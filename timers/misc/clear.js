/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 */

const TimerDB = require("../../database/controllers/timerController");

module.exports.name = "clear"
module.exports.aliases = ["cl"]

/**
 * Clearing cancels the harvest timer
 * @param {RebirthRusher} bot RbR Discord client
 * @param {string} userID user's Discord ID
 * @returns {Promise<void>}
 */
module.exports.execute = async function (bot, userID) {
    await TimerDB.deleteTimerForUser(userID, "harvest");
}
