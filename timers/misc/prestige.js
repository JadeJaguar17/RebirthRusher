/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 */

const TimerDB = require("../../database/controllers/timerController");

module.exports.name = "prestige"
module.exports.aliases = ["pr"]

/**
 * Prestige cancels all existing timers except harvest
 * @param {RebirthRusher} bot RbR Discord client
 * @param {string} userID user's Discord ID
 * @returns {Promise<void>}
 */
module.exports.execute = async function (bot, userID) {
    await TimerDB.deleteTimerForUserExcept(userID, ["harvest"]);
}
