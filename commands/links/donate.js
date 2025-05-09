/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const fs = require("fs");
const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../resources/embedColors.json");
const { patreon } = require("../../resources/links.json");

module.exports.name = "donate"
module.exports.description = "Sends link to Patreon page"
module.exports.syntax = "`/donate`"

/**
 * Sends link to Patreon page
 * @param {RebirthRusher} bot RbR Discord client
 * @param {CommandInteraction} interaction triggering Discord slash command
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    const donateEmbed = new MessageEmbed()
        .setColor(RBR)
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setTitle("Donate!")
        .setThumbnail("attachment://patreon_logo.png")
        .setDescription(`Want to support me and Rebirth Rusher? All donations, big or small, are always highly appreciated!`);

    const thumbnail = {
        file: fs.readFileSync("resources/thumbnails/patreon_logo.png"),
        name: "patreon_logo.png"
    };

    return {
        embeds: [donateEmbed],
        file: thumbnail,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 5,
                        label: "Donate",
                        url: patreon
                    },
                ]
            }
        ]
    };
}
