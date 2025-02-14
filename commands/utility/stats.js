/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const MessageEmbed = require("../../system/MessageEmbed");
const UserDB = require("../../database/controllers/userController");
const { RBR } = require("../../config/embedColors.json");

module.exports.name = "stats"
module.exports.description = "Displays bot stats"
module.exports.syntax = "`/stats`"

/**
 * Displays bot's user and server count
 * @param {RebirthRusher} bot RbR Discord client
 * @param {CommandInteraction} interaction triggering Discord slash command
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    const statEmbed = new MessageEmbed()
        .setColor(RBR)
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setDescription(
            `**Servers:** ${bot.guilds.size}\n`
            + `**Users:** ${await UserDB.getUserCount()}`
        )
        .setThumbnail("https://i.imgur.com/JUNFqEn.png")
        .setTitle("Stats");

    return { embeds: [statEmbed] };
}
