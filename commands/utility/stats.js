const MessageEmbed = require("../../system/MessageEmbed");
const { getAllUsers } = require("../../database/userController");
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
                + `**Users:** ${await getAllUsers()}`
            )
            .setThumbnail("https://i.imgur.com/JUNFqEn.png")
            .setTitle("Stats");

        return { embeds: [statEmbed] };
    },
    options: []
}
