/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message 
 */

const UserDB = require("../../database/controllers/userController");

module.exports.name = "daily"
module.exports.aliases = ["d"]

/**
 * Starts daily timer
 * @param {RebirthRusher} bot RbR Discord client
 * @param {Message} message triggering Discord message
 * @param {string} userID user's Discord ID
 */
module.exports.execute = async function (bot, message, userID) {
    const user = await UserDB.getUserById(userID);

    if (user.settings.daily !== message.channel.id) {
        user.settings.daily = message.channel.id;
        return await user.save();
    }
}
