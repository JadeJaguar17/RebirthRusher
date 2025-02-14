/**
 * @typedef {import("../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Guild} Guild
 */

const MessageEmbed = require("../system/MessageEmbed");
const { SUCCESS2 } = require("../config/embedColors.json");

/**
 * @param {RebirthRusher} bot RbR Discord client
 * @param {Guild} guild guild that got created
 */
module.exports = async (bot, guild) => {
    const newServerEmbed = new MessageEmbed()
        .setColor(SUCCESS2)
        .setTitle("Server added")
        .setDescription(`**Name:** ${guild.name}\n**ID:** \`${guild.id}\``)
        .setThumbnail(guild.iconURL)
        .setTimestamp();

    return bot.log("account", newServerEmbed);
}
