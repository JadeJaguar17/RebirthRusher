const users = require("../../models/userModel.js");
const MessageCollector = require("../../system/collector/MessageCollector");
const boosters = require("../../config/boosters.json");

module.exports = {
    name: "booster",
    execute: async function (message, userID, boosterID, time) {
        const user = await users.findById(userID);
        const booster = boosters.find(b => b.id === boosterID);

        if (!booster || user.timers.boosters[booster.type] === "off") {
            return;
        }

        const timer = setTimeout(async () => {
            const timerUser = await users.findById(user._id);
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

        // Timer reset collector
        function resetFilter(m) {
            try {
                if (m.embeds?.[0]?.author) {
                    const embedAuthorID = m.embeds[0].author.icon_url
                        ?.replace("https://cdn.discordapp.com/avatars/", "")
                        .split("/")[0]
                        .trim();
                    const hasPrestiged = m.embeds[0].title?.startsWith("You are now prestige");
                    const hasRevoked = m.embeds[0].description
                        ?.startsWith("You revoked the following")
                        && m.embeds[0].description?.includes(booster.id);

                    return (embedAuthorID === userID) && (hasPrestiged || hasRevoked);
                }
            } catch (error) {
                bot.error("booster resetFilter", error);
                return false;
            }
        }

        const resetCollector = new MessageCollector(
            bot,
            message.channel,
            resetFilter,
            { time: time * 1000, max: 1 }
        );
        resetCollector.on("collect", async (m) => {
            clearTimeout(timer);
            user.timers.boosters[booster.type] = "ready";

            await user.save();
        });
    }
}
