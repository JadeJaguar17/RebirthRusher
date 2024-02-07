const timers = require("../models/timerModel");
const users = require("../models/userModel");
const MessageCollector = require("./collector/MessageCollector");
const slashIDS = require("../config/slashIds.json");

class Timer {
    constructor() { }

    async startTimer(message, userID, timerName, timerCategory, timerCd, timerID) {
        const user = await users.findById(userID);
        if (timerCd >= 90) {
            const endTime = new Date();
            endTime.setSeconds(endTime.getSeconds() + timerCd);

            await timers.create({
                message: {
                    author: {
                        id: user._id
                    },
                    channel: {
                        id: message.channel.id,
                        guild: {
                            id: message.channel.guild.id
                        }
                    }
                },
                timerName: timerName,
                timerCategory: timerCategory,
                endTime: endTime
            });

            user.timers[timerCategory][timerName] = "running";
            return await user.save();
        }

        const timer = setTimeout(async () => {
            try {
                const timerUser = await users.findById(user._id);
                if (timerUser.timers[timerCategory][timerName] === "off") {
                    return;
                }

                await bot.send(
                    message,
                    `<@${timerUser._id}> `
                    + `</${timerName}:${slashIDS[timerName]}> ready`
                );

                timerUser.timers[timerCategory][timerName] = "ready";
                await timerUser.save();
                await timers.findByIdAndDelete(timerID);
            } catch (error) {
                bot.error("Timer", error, message);
            }
        }, 1000 * timerCd + 300);

        user.timers[timerCategory][timerName] = "running";
        await user.save();

        // Timer reset collector
        function resetFilter(m) {
            try {
                if (m.embeds?.[0]?.author) {
                    const embedAuthorID = m.embeds[0]?.author.icon_url
                        ?.replace("https://cdn.discordapp.com/avatars/", "")
                        .split("/")[0]
                        .trim();
                    const hasPrestiged = m.embeds[0].title
                        ?.startsWith("You are now prestige");

                    return (embedAuthorID === userID) && hasPrestiged;
                }
            } catch (error) {
                bot.error("Timer resetFilter", error);
                return false;
            }
        }

        const resetCollector = new MessageCollector(
            bot,
            message.channel,
            resetFilter,
            { time: 1000 * timerCd, max: 1 }
        );
        resetCollector.on("collect", async () => {
            clearTimeout(timer);
            await timers.findByIdAndDelete(timerID);

            user.timers[timerCategory][timerName] = "ready";
            user.save();
        });
    }
}

module.exports = Timer;
