/**
 * @typedef {import("../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message
 */

module.exports.name = "claimall"

/**
 * Scans claimed kits from Idle Miner /claimall
 * @param {RebirthRusher} bot instance of RbR base class
 * @param {Message} message triggering Eris interaction
 * @param {string} userID user's Discord ID
 */
module.exports.execute = async function (bot, message, userID) {
    const newMessage = {
        author: {
            id: userID
        },
        channel: message.channel
    };

    for (const kit of message.embeds[0].description.split("\n")) {
        const name = kit.split("**")[1].toLowerCase();

        try {
            await bot.timers.get(name).execute(bot, newMessage, userID);
        } catch (error) { }
    }
}
