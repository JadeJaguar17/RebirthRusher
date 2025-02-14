/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message 
 */
const UserDB = require("../../database/controllers/userController");
const MessageCollector = require("../../system/collector/MessageCollector");
const boosters = require("../../config/boosters.json");

module.exports.name = "booster"

/**
 * Starts timers for boosters
 * @param {RebirthRusher} bot RbR Discord client
 * @param {Message} message triggering Discord message
 * @param {string} userID user's Discord ID
 * @param {string} boosterID booster's ID
 * @param {Number} time duration of booster (in seconds)
 * @returns {Promise<void>}
 */
module.exports.execute = async function (bot, message, userID, boosterID, time) {
    const user = await UserDB.getUserById(userID);
    const booster = boosters.find(b => b.id === boosterID);

    if (!booster || user.timers.boosters[booster.type] === "off") {
        return;
    }

    // set a timer
    const timer = setTimeout(async () => {
        const timerUser = await UserDB.getUserById(user._id);
        if (timerUser.timers.boosters[booster.type] === "off") {
            return;
        }

        await bot.send(
            message,
            `<@${userID}> You have \`${user.settings.boostercd}s\` left for`
            + ` ${booster.emoji}`
        );

        user.timers.boosters[booster.type] = "ready";
        await user.save();
    }, (time - user.settings.boostercd) * 1000);

    user.timers.boosters[booster.type] = "running";
    await user.save();

    // set up timer reset filter
    function resetFilter(msg) {
        try {
            if (msg.embeds?.[0]?.author) {
                const embedAuthorID = msg.embeds[0].author.icon_url
                    ?.replace("https://cdn.discordapp.com/avatars/", "")
                    .split("/")[0]
                    .trim();
                const hasPrestiged = msg.embeds[0].title?.startsWith("You are now prestige");
                const hasRevoked = msg.embeds[0].description?.startsWith("You revoked the following");
                return (embedAuthorID === userID) && (hasPrestiged || hasRevoked);
            }
        } catch (error) {
            bot.error("booster resetFilter", error);
            return false;
        }
    }

    // set up message collector
    const resetCollector = new MessageCollector(
        bot,
        message.channel,
        resetFilter,
        { time: time * 1000, max: 1 }
    );

    resetCollector.on("collect", async () => {
        clearTimeout(timer);
        user.timers.boosters[booster.type] = "ready";

        await user.save();
    });
}
