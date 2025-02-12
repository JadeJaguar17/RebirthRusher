/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message 
 */

const UserDB = require("../../database/controllers/userController");
const MessageCollector = require("../../system/collector/MessageCollector");

module.exports.name = "backpack"

/**
 * Starts backpack timer, which gets cancelled when user sells
 * @param {RebirthRusher} bot instance of RbR base class
 * @param {Message} message triggering Discord message
 * @param {string} userID user's Discord ID
 * @param {Number} time remaining time for backpack (in seconds)
 */
module.exports.execute = async function (bot, message, userID, time) {
    const user = await UserDB.getUserById(userID);

    if (user.timers.kits.backpack === "ready" && time >= 10) {
        const timer = setTimeout(async () => {
            const timerUser = await UserDB.getUserById(userID);
            if (timerUser.timers.kits.backpack === "off") {
                return;
            }

            await bot.send(message, `<@${userID}> \`Backpack\` full`);

            user.timers.kits.backpack = "ready";
            await user.save();
        }, 1000 * time + 300);

        user.timers.kits.backpack = "running";
        await user.save();

        // Timer reset collector
        function resetFilter(m) {
            try {
                if (m.embeds?.[0]?.author && m.embeds?.[0]?.title) {
                    const embedAuthorID = m.embeds[0].author.icon_url
                        ?.replace("https://cdn.discordapp.com/avatars/", "")
                        .split("/")[0]
                        .trim();
                    const hasPrestiged = m.embeds[0].title.startsWith("You are now prestige");
                    const hasSold = m.embeds[0].title.startsWith("Sold ");

                    return (embedAuthorID === userID) && (hasPrestiged || hasSold);
                }
            } catch (error) {
                bot.error("backpack resetFilter", error);
                return false;
            }
        }

        const resetCollector = new MessageCollector(
            bot,
            message.channel,
            resetFilter,
            { time: 1000 * time, max: 1 }
        );
        resetCollector.on("collect", () => {
            clearTimeout(timer);

            user.timers.kits.backpack = "ready";
            return user.save();
        });
    }
}
