/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const fs = require("fs");

module.exports.name = "unban"
module.exports.description = "Unbans user from the bot"
module.exports.syntax = "`/unban`"
module.exports.hidden = true

/**
 * Unbans a user from the bot
 * @param {RebirthRusher} bot instance of RbR base class
 * @param {CommandInteraction} interaction triggering Eris interaction
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    const userID = interaction.data.options[0].value;
    const bannedUsers = JSON.parse(fs.readFileSync("./config/bannedUsers.json"));

    const index = bannedUsers.indexOf(userID);
    if (index === -1) return "User not found";
    bannedUsers.splice(index, 1);
    fs.writeFileSync(
        "./config/bannedUsers.json",
        JSON.stringify(bannedUsers, null, 4)
    );

    return `\`${userID}\` unbanned`;
}

module.exports.options = [
    {
        name: "id",
        description: "user ID",
        type: 3,
        required: true
    }
]
