/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const fs = require("fs");
const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../resources/embedColors.json");
const { invite } = require("../../resources/links.json");

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
        .setThumbnail("attachment://discord_logo.png")
        .setDescription(`Want to use me in your server? Invite me!`);

    const thumbnail = {
        file: fs.readFileSync("resources/thumbnails/discord_logo.png"),
        name: "discord_logo.png"
    };

    return {
        embeds: [inviteEmbed],
        file: thumbnail,
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
