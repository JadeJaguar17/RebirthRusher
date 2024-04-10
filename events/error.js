const RebirthRusher = require("../system/RebirthRusher");

/**
 * @param {RebirthRusher} bot base class of RbR
 * @param {Error} error error that was emitted
 */
module.exports = async (bot, error, _) => {
    console.error(error);
    bot.error("Error Event", error);
}
