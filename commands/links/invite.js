/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const { invite } = require("../../config/links.json");

module.exports.name = "invite"
module.exports.description = "Sends the bot invite link"
module.exports.syntax = "`/invite`"

/**
 * Sends the bot invite link
 * @param {RebirthRusher} bot RbR Discord client
 * @param {CommandInteraction} interaction triggering Discord slash command
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    const inviteEmbed = new MessageEmbed()
        .setColor(RBR)
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setTitle("Invite Me!")
        .setThumbnail("https://i.imgur.com/HRIQMyF.png")
        .setDescription(`Want to use me in your server? Invite me!`);

    return {
        embeds: [inviteEmbed],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 5,
                        label: "Invite",
                        url: invite
                    }
                ]
            }
        ]
    };
}
