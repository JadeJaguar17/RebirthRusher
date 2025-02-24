/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const fs = require("fs");
const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../resources/embedColors.json");
const { vote } = require("../../resources/links.json");

module.exports.name = "vote"
module.exports.description = "Sends the bot vote link"
module.exports.syntax = "`/vote`"

/**
 * Sends the bot vote link
 * @param {RebirthRusher} bot RbR Discord client
 * @param {CommandInteraction} interaction triggering Discord slash command
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    const voteEmbed = new MessageEmbed()
        .setTitle("Vote!")
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setThumbnail("attachment://topgg_logo.png")
        .setDescription(`Vote for me to get extra tokens!`)
        .setColor(RBR);

    const thumbnail = {
        file: fs.readFileSync("resources/thumbnails/topgg_logo.png"),
        name: "topgg_logo.png"
    };

    return {
        embeds: [voteEmbed],
        file: thumbnail,
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
