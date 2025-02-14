/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 */

const TimerDB = require("../../database/controllers/timerController");

module.exports.name = "bonemeal"
module.exports.aliases = ["bm", "bone"]

/**
 * Bonemealing cancels existing harvest timers
 * @param {RebirthRusher} bot RbR Discord client
 * @param {string} userID user's Discord ID
 */
module.exports.execute = async function (bot, userID) {
    await TimerDB.deleteTimerForUser(userID, "harvest");
}
