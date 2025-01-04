const Eris = require("eris");
const RebirthRusher = require("../system/RebirthRusher");
const fs = require("fs");
const UserDB = require("../database/controllers/userController");
const MessageEmbed = require("../system/MessageEmbed");
const { ERROR } = require("../config/embedColors.json");
const { DEV_ID } = require("../config/discordIds.json");

/**
 * @param {RebirthRusher} bot base class of RbR
 * @param {Eris.Interaction} interaction Interaction object
 */
module.exports = async (bot, interaction) => {
    try {
        // slash commands
        if (interaction instanceof Eris.CommandInteraction) {
            return await handleSlashCommand(bot, interaction);
        }

        // buttons
        else if (interaction instanceof Eris.ComponentInteraction) {
            return await handleButton(bot, interaction);
        }
    } catch (error) {
        bot.error("interactionCreate", error);
    }
}

/**
 * Handles slash commands
 * @param {RebirthRusher} bot base class of RbR
 * @param {Eris.CommandInteraction} interaction Interaction object for slash command
 * @returns awaitable RbR response
 */
async function handleSlashCommand(bot, interaction) {
    try {
        // no commands in DM's
        if (!interaction.guildID) {
            return interaction.createMessage("Sorry, my commands aren't available in DM's");
        }

        // ignore banned users
        const bannedUsers = JSON.parse(fs.readFileSync("./config/bannedUsers.json"));
        if (bannedUsers.indexOf(interaction.member.user.id) !== -1) {
            interaction.acknowledge();
            return;
        }

        // handle commands
        const command = bot.commands.get(interaction.data.name);

        if (!(UserDB.checkUserExists(interaction.member.user.id)) && command?.needsAccount) {
            return interaction.createMessage("You don't have an account yet! Enter \`/start\` to make an account");
        }

        if (command) {
            if (command.hidden && interaction.member.user.id !== DEV_ID) return;
            const result = await bot.commands.get(interaction.data.name).execute(interaction);

            // 'delete' and 'resetstats' have a 15s expiry time
            if (command.name === "delete") {
                setTimeout(() => {
                    interaction.editOriginalMessage({ content: "Time's up, your data deletion was cancelled", components: [] })
                }, 15000);
            }
            else if (command.name === "resetstats") {
                setTimeout(() => {
                    interaction.editOriginalMessage({ content: "Time's up, your stats reset was cancelled", components: [] })
                }, 15000);
            }

            return interaction.createMessage(result, result?.file);
        }

        // context menu graph
        else if (interaction.data.name === "Fetch Graph") {
            interaction.data.options = [{ value: interaction.data.target_id }];
            const graph = await bot.commands.get("graph").execute(interaction);
            return interaction.createMessage(graph, graph.file);
        }

        // unhandled interaction at this point
        return bot.error(
            "interactionCreate.handleSlashCommand",
            new TypeError(`Invalid command: ${interaction.data.name}`)
        );
    } catch (error) {
        return bot.error(
            "interactionCreate.handleSlashCommand",
            error,
            `Name: ${interaction.data.name}`
        );
    }
}

/**
 * Handles buttons
 * @param {RebirthRusher} bot base class of RbR
 * @param {Eris.ComponentInteraction} interaction Interaction object for button
 * @returns awaitable RbR response
 */
async function handleButton(bot, interaction) {
    try {
        const args = interaction.data.custom_id.split("-");
        const userID = args[0];
        const command = args[1];
        args.splice(0, 2);

        if (interaction.member.user.id === userID) {
            await interaction.acknowledge();
            switch (command) {
                case "guide":
                    return interaction.editMessage(interaction.message.id, await bot.commands.get("guide").execute(interaction, Number(args[0])));
                case "inventory":
                    return interaction.editMessage(interaction.message.id, await bot.commands.get("inventory").execute(interaction, Number(args[0])));
                case "buy":
                    if (args[0] === "cancel") {
                        return interaction.editMessage(interaction.message.id, { content: "You cancelled your purchase", components: [] });
                    }

                    const itemID = Number(args[0]);
                    const hex = args[1];

                    const result = await bot.commands.get("buy").purchaseItem(interaction, itemID, hex);
                    return interaction.editMessage(interaction.message.id, { content: result, components: [] });
                case "delete":
                    if (args[0] === "cancel") {
                        return interaction.editMessage(interaction.message.id, { content: "Your data deletion was cancelled", components: [] });
                    }

                    if (args[0] === "confirm") {
                        await UserDB.deleteUser(interaction.member.user.id);

                        interaction.editMessage(interaction.message.id, { content: "Your data has been deleted", components: [] });

                        const deleteUserEmbed = new MessageEmbed()
                            .setColor(ERROR)
                            .setThumbnail(interaction.member.user.avatarURL)
                            .setTitle("Deleted User")
                            .setDescription(
                                `**Name:** ${interaction.member.user.username}\n`
                                + `**ID:** \`${interaction.member.user.id}\``
                            )
                            .setTimestamp();

                        return bot.log("account", deleteUserEmbed);
                    }
                case "reset":
                    if (args[0] === "cancel") {
                        return interaction.editMessage(interaction.message.id, { content: "Your stats reset was cancelled", components: [] });
                    }

                    if (args[0] === "confirm") {
                        await UserDB.resetPersonalBest(interaction.member.user.id);

                        interaction.editMessage(interaction.message.id, { content: "Your stats has been reset", components: [] });

                        return;
                    }
            }
        }

        return bot.error(
            "interactionCreate.handleButton",
            new Error(`Unhandled ComponentInteraction: ${interaction.data.custom_id}`)
        );
    } catch (error) {
        return bot.error(
            "interactionCreate.handleButton",
            error,
            `Button ID: ${interaction.data.custom_id}`
        );
    }
}
