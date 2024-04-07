const MessageEmbed = require("../../system/MessageEmbed");
const UserDB = require("../../database/controllers/userController");
const { RBR } = require("../../config/embedColors.json");

module.exports.name = "stats"
module.exports.description = "Displays bot stats"
module.exports.syntax = "`/stats`"

module.exports.execute = async function () {
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
