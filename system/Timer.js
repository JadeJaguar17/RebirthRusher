/**
 * @typedef {import("../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message 
 */

const UserDB = require("../database/controllers/userController");
const TimerDB = require("../database/controllers/timerController");
const MessageCollector = require("./collector/MessageCollector");
const slashIDS = require("../config/slashIds.json");

class Timer {
    /**
     * Creates a new Timer object
     * @param {RebirthRusher} bot instance of RbR base class
     * @param {Message} message triggering Discord message
     * @param {string} userID user's Discord ID
     * @param {string} timerName timer name (ex: "hunt")
     * @param {string} timerCategory timer category (ex: "games")
     * @param {Number} timerCd timer duration (in seconds)
     * @param {string?} timerID timer ID
     */
    constructor(bot, message, userID, timerName, timerCategory, timerCd, timerID = null) {
        this.bot = bot;
        this.message = message;
        this.userID = userID;
        this.timerName = timerName;
        this.timerCategory = timerCategory;
        this.timerCd = timerCd;
        this.timerID = timerID;
    }

    /**
     * Starts the timer
     * @returns {Promise<void>}
     */
    async start() {
        const user = await UserDB.getUserById(this.userID);
        if (this.timerCd >= 90) {
            const endTime = new Date();
            endTime.setSeconds(endTime.getSeconds() + this.timerCd);

            await TimerDB.createTimer(
                this.timerName,
                this.timerCategory,
                endTime,
                user._id,
                this.message.channel.id,
                this.message.channel.guild.id
            )

            user.timers[this.timerCategory][this.timerName] = "running";
            return await user.save();
        }

        const timer = setTimeout(async () => {
            try {
                const timerUser = await UserDB.getUserById(user._id);
                if (timerUser.timers[this.timerCategory][this.timerName] === "off") {
                    return;
                }

                await this.bot.send(
                    this.message,
                    `<@${timerUser._id}> `
                    + `</${this.timerName}:${slashIDS[this.timerName]}> ready`
                );

                timerUser.timers[this.timerCategory][this.timerName] = "ready";
                await timerUser.save();
                await TimerDB.deleteTimer(this.timerID);
            } catch (error) {
                this.bot.error("Timer", error, this.message);
            }
        }, 1000 * this.timerCd + 300);

        user.timers[this.timerCategory][this.timerName] = "running";
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

                    return (embedAuthorID === this.userID) && hasPrestiged;
                }
            } catch (error) {
                this.bot.error("Timer resetFilter", error);
                return false;
            }
        }

        const resetCollector = new MessageCollector(
            this.bot,
            this.message.channel,
            resetFilter,
            { time: 1000 * this.timerCd, max: 1 }
        );
        resetCollector.on("collect", async () => {
            clearTimeout(timer);
            await TimerDB.deleteTimer(this.timerID);

            user.timers[this.timerCategory][this.timerName] = "ready";
            user.save();
        });
    }
}

module.exports = Timer;
