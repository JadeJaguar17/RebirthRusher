/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message 
 */

const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports.name = "wings"
module.exports.aliases = ["ws", "wg", "dragon", "wotb"]

/**
 * Starts wings timer
 * @param {RebirthRusher} bot RbR Discord client
 * @param {Message} message triggering Discord message
 * @param {string} userID user's Discord ID
 * @returns {Promise<void>}
 */
module.exports.execute = async function (bot, message, userID) {
    const user = await UserDB.getUserById(userID);

    if (user?.timers.abilities.wings === "ready") {
        await new Timer(
            bot,
            message,
            userID,
            "wings",
            "abilities",
            420 - 60 * user.pets["ender-dragon"]
        ).start();

        return await bot.timers.get("booster").execute(bot,
            message,
            userID,
            "wings",
            60
        );
    }
}
