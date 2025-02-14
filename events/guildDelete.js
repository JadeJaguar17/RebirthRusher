/**
 * @typedef {import("../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Guild} Guild
 */

const MessageEmbed = require("../system/MessageEmbed");
const { ERROR2 } = require("../config/embedColors.json");

/**
 * @param {RebirthRusher} bot RbR Discord client
 * @param {Guild} guild guild that got deleted
 */
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
