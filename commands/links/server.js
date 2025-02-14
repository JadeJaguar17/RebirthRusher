/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const { server } = require("../../config/links.json");

module.exports.name = "server"
module.exports.description = "Sends server invite link"
module.exports.syntax = "`/server`"

/**
 * command_description
 * @param {RebirthRusher} bot RbR Discord client
 * @param {CommandInteraction} interaction triggering Discord slash command
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    return `Need help? Have a suggestion? Found a bug?\n`
        + `Whatever the reason, you're always welcome to our support server!\n`
        + `${server}`;
}
