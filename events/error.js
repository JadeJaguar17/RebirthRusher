/**
 * @typedef {import("../RebirthRusher.js")} RebirthRusher
 */

/**
 * @param {RebirthRusher} bot RbR Discord client
 * @param {Error} error error that was emitted
 */
module.exports = async (bot, error, _) => {
    console.error(error);
    bot.error("Error Event", error);
}

// Apparently there's been a long-running issue in Eris where single-shard bots
// can't reconnect, even if the error event is being handled. The devs have no
// idea why it's happening, so it's unlikely a fix will be out anytime soon. In
// the meantime, we'll just leave this code here
