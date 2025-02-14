/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const MessageEmbed = require("../../system/MessageEmbed");
const UserDB = require("../../database/controllers/userController");
const { RBR } = require("../../config/embedColors.json");

module.exports.name = "identify"
module.exports.description = "Retrieves and displays data associated with a Discord ID\n*(operator only)*"
module.exports.syntax = "`/identify [id]`"
module.exports.hidden = true

/**
 * Identifies a Discord snowflake ID
 * @param {RebirthRusher} bot RbR Discord client
 * @param {CommandInteraction} interaction triggering Discord slash command
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    const id = interaction.data.options[0].value;
    if (!id) return "Please enter an id";

    // check if ID is a user
    try {
        const user = await bot.users.get(id) || await bot.getRESTUser(id);

        if (user) {
            const isRbRUser = await UserDB.checkUserExists(id)
                ? ":white_check_mark:"
                : ":x:"

            const userEmbed = new MessageEmbed()
                .setColor(RBR)
                .setTitle("User")
                .setThumbnail(user.avatarURL)
                .setDescription(user.username)
                .addFields(
                    { name: "Additional info", value: `RbR user: ${isRbRUser}` }
                );

            return { embeds: [userEmbed] };
        }
    } catch (error) { }

    // check if ID is a channel
    try {
        const channel = await bot.getRESTChannel(id);

        if (channel) {
            const channelEmbed = new MessageEmbed()
                .setColor(RBR)
                .setTitle("Channel")
                .setThumbnail(channel.guild.iconURL)
                .setDescription(`#${channel.name}`)
                .addFields({
                    name: "Additional info",
                    value: `Guild name: ${channel.guild.name}\n`
                        + `Guild ID: \`${channel.guild.id}\``
                });

            return { embeds: [channelEmbed] };
        }
    } catch (error) { }

    // check if ID is a server
    try {
        const guild = await bot.guilds.get(id) || await bot.getRESTGuild(id);
        const owner = await bot.users.get(guild.ownerID) || await bot.getRESTUser(guild.ownerID);

        if (guild) {
            const isRbRUser = await UserDB.checkUserExists(guild.ownerID)
                ? ":white_check_mark:"
                : ":x:"

            const guildEmbed = new MessageEmbed()
                .setColor(RBR)
                .setTitle("Guild")
                .setThumbnail(guild.iconURL)
                .setDescription(guild.name)
                .addFields({
                    name: "Additional info",
                    value: `Owner tag: ${owner.username}\n`
                        + `Owner ID: \`${guild.ownerID}\`\n`
                        + `Owner RbR user: ${isRbRUser}`
                });

            return { embeds: [guildEmbed] };
        }
    } catch (error) { }

    return ":x: Nothing found";
}

module.exports.options = [
    {
        name: "id",
        description: "ID of user/channel/server",
        type: 3,
        required: true
    }
]
