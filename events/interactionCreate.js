const Eris = require("eris");
const fs = require("fs");
const users = require("../models/userModel");
const MessageEmbed = require("../system/MessageEmbed");
const { ERROR } = require("../config/embedColors.json");

module.exports = async (bot, interaction) => {
    // slash commands
    if (interaction instanceof Eris.CommandInteraction) {
        if (!interaction.guildID) {
            return interaction.createMessage("Sorry, my commands aren't available in DM's");
        }

        const bannedUsers = JSON.parse(fs.readFileSync("./config/bannedUsers.json"));
        if (bannedUsers.indexOf(interaction.member.user.id) !== -1) {
            interaction.acknowledge();
            return;
        }

        const command = bot.commands.get(interaction.data.name);

        if (!(await users.exists({ _id: interaction.member.user.id })) && command?.needsAccount) {
            return interaction.createMessage("You don't have an account yet! Enter \`/start\` to make an account");
        }

        if (command) {
            const result = await bot.commands.get(interaction.data.name).execute(interaction);

            if (command.name === "delete") {
                setTimeout(() => {
                    interaction.editOriginalMessage({ content: "Time's up, your data deletion was cancelled", components: [] })
                }, 15000);
            }

            return interaction.createMessage(result, result.file);
        }

        else if (interaction.data.name === "Fetch Graph") {
            interaction.data.options = [{ value: interaction.data.target_id }];
            const graph = await bot.commands.get("graph").execute(interaction);
            return interaction.createMessage(graph, graph.file);
        }

        else {
            bot.error("interactionCreate.js", new TypeError(`Invalid command: ${interaction.data.name}`));
        }
    }

    // buttons
    else if (interaction instanceof Eris.ComponentInteraction) {
        const args = interaction.data.custom_id.split("-");
        const userID = args[0];
        const command = args[1];
        args.splice(0, 2);

        if (interaction.member.user.id === userID) {
            await interaction.acknowledge();
            switch (command) {
                case "guide":
                    return interaction.editMessage(interaction.message.id, await bot.commands.get("guide").execute(interaction, Number(args[0])));
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
                        await users.findByIdAndDelete(interaction.member.user.id);

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
            }
        }

        return bot.error("interactionCreate", new Error(`Unhandled ComponentInteraction: ${interaction.data.custom_id}`));
    }
}
