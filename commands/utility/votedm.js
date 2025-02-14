/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const UserDB = require("../../database/controllers/userController");
const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const { off, on } = require("../../config/emojis.json");

module.exports.name = "votedm"
module.exports.description = "Enables/disables the bot DMing you after a vote"
module.exports.syntax = "`/votedm [enable | disable]`"
module.exports.needsAccount = true

/**
 * Enables/disables the bot DMing user after a vote
 * @param {RebirthRusher} bot RbR Discord client
 * @param {CommandInteraction} interaction triggering Discord slash command
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    const user = await UserDB.getUserById(interaction.member.user.id);
    const emoji = user.settings.voteDisabled
        ? off
        : on

    const votedmEmbed = new MessageEmbed()
        .setTitle("Vote DM Settings")
        .setThumbnail("https://i.imgur.com/TDSkM7u.png")
        .setColor(RBR)
        .setDescription(`Vote DM's are currently ${emoji}`);

    return { embeds: [votedmEmbed] };
}
