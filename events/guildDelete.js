const MessageEmbed = require("../system/MessageEmbed");
const { ERROR2 } = require("../config/embedColors.json");

module.exports = async (bot, guild) => {
    if (!guild.name) return;

    const deleteServerEmbed = new MessageEmbed()
        .setColor(ERROR2)
        .setTitle("Deleted Server")
        .setDescription(`**Name:** ${guild.name}\n**ID:** \`${guild.id}\``)
        .setThumbnail(guild.iconURL)
        .setTimestamp();

    return bot.log("account", deleteServerEmbed);
}
