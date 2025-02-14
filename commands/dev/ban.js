/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const fs = require("fs");

module.exports.name = "ban"
module.exports.description = "Bans user from the bot"
module.exports.syntax = "`/ban`"
module.exports.hidden = true

/**
 * Bans a user from the bot
 * @param {RebirthRusher} bot RbR Discord client
 * @param {CommandInteraction} interaction triggering Discord slash command
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    const userID = interaction.data.options[0].value;
    const bannedUsers = JSON.parse(fs.readFileSync("./config/bannedUsers.json"));

    bannedUsers.push(userID);
    fs.writeFileSync("./config/bannedUsers.json", JSON.stringify(bannedUsers, null, 4));

    return `\`${userID}\` banned`;
}

module.exports.options = [
    {
        name: "id",
        description: "user ID",
        type: 3,
        required: true
    }
]
