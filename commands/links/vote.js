/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const { vote } = require("../../config/links.json");

module.exports.name = "vote"
module.exports.description = "Sends the bot vote link"
module.exports.syntax = "`/vote`"

/**
 * Sends the bot vote link
 * @param {RebirthRusher} bot instance of RbR base class
 * @param {CommandInteraction} interaction triggering Eris interaction
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    const voteEmbed = new MessageEmbed()
        .setTitle("Vote!")
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setThumbnail("https://i.imgur.com/f0ErbMs.png")
        .setDescription(`Vote for me to get extra tokens!`)
        .setColor(RBR);

    return {
        embeds: [voteEmbed],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 5,
                        label: "Vote",
                        url: vote
                    }
                ]
            }
        ]
    };
}
