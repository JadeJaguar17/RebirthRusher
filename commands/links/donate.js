/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const { patreon } = require("../../config/links.json");

module.exports.name = "donate"
module.exports.description = "Sends link to Patreon page"
module.exports.syntax = "`/donate`"

/**
 * Sends link to Patreon page
 * @param {RebirthRusher} bot instance of RbR base class
 * @param {CommandInteraction} interaction triggering Eris interaction
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    const donateEmbed = new MessageEmbed()
        .setColor(RBR)
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setTitle("Donate!")
        .setThumbnail("https://i.imgur.com/YAid9qv.png")
        .setDescription(`Want to support me and Rebirth Rusher? All donations, big or small, are always highly appreciated!`);

    return {
        embeds: [donateEmbed],
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
