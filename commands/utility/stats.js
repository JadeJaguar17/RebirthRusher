const MessageEmbed = require("../../system/MessageEmbed");
const users = require("../../models/userModel");
const { RBR } = require("../../config/embedColors.json");

module.exports = {
    name: "stats",
    description: "Displays bot stats",
    syntax: "`/stats`",
    execute: async function () {
        const statEmbed = new MessageEmbed()
            .setColor(RBR)
            .setAuthor(bot.user.username, bot.user.avatarURL)
            .setDescription(
                `**Servers:** ${bot.guilds.size}\n`
                + `**Users:** ${await users.countDocuments()}`
            )
            .setThumbnail("https://i.imgur.com/JUNFqEn.png")
            .setTitle("Stats");

        return { embeds: [statEmbed] };
    },
    options: []
}
