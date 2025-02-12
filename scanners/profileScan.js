/**
 * @typedef {import("../RebirthRusher.js")} RebirthRusher
 */

const UserDB = require("../database/controllers/userController");

module.exports.name = "profileScan"

/**
 * Scans user's IM profile and updates rb/pr/rbday stats
 * @param {RebirthRusher} bot instance of RbR base class
 * @param {string} userID user's Discord ID
 * @param {Number} embedPr user's prestige count
 * @param {Number} embedRb user's rebirth count
 * @param {Number} embedRbDay user's rb/day
 * @returns {Promise<void>}
 */
module.exports.execute = async function (bot, userID, embedPr, embedRb, embedRbDay) {
    if (isNaN(embedPr) || isNaN(embedRb) || isNaN(embedRbDay)) {
        return await bot.error("profileScan", new TypeError(`Invalid embed stats: [${embedPr}/${embedRb}/${embedRbDay}]`));
    }

    const user = await UserDB.getUserById(userID);

    // need to flip the signs for timezone
    const tz = user.settings.timezone.startsWith("+")
        ? user.settings.timezone.replace("+", "-")
        : user.settings.timezone.replace("-", "+");

    const now = new Date();
    const today = new Date(now.toLocaleString("en-US", { timeZone: `Etc/GMT${tz}` }));
    const todayString = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    const graphLast = user.graph.tracker.dates[user.graph.tracker.dates.length - 1];

    for (let d = new Date(graphLast); d < new Date(todayString); d.setDate(d.getDate() + 1)) {
        const date = new Date(d)
        date.setDate(date.getDate() + 1);

        user.graph.tracker.dates.push(`${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`);
        user.graph.tracker.rebirths.push(0);
        user.graph.tracker.prestiges.push(0);
        user.graph.tracker.rbDay.push(null);
    }

    if (user.graph.rbLevel != null) {
        const rebirths = (embedPr * 25 + embedRb) - (user.graph.prLevel * 25 + user.graph.rbLevel);
        const prestiges = embedPr - user.graph.prLevel;

        user.graph.tracker.rebirths[user.graph.tracker.dates.indexOf(todayString)] += rebirths;
        user.graph.tracker.prestiges[user.graph.tracker.dates.indexOf(todayString)] += prestiges;
    }

    user.graph.tracker.rbDay[user.graph.tracker.dates.indexOf(todayString)] = embedRbDay;

    // Only want 2 weeks worth of data
    while (user.graph.tracker.dates.length > 14) {
        user.graph.tracker.dates.shift();
        user.graph.tracker.rebirths.shift();
        user.graph.tracker.prestiges.shift();
        user.graph.tracker.rbDay.shift();
    }

    // update personal bests only if stats are within yesterday
    if (hasDataYesterday(user.graph.tracker, tz)) {
        if (user.graph.tracker.rebirths[user.graph.tracker.dates.indexOf(todayString)] > user.graph.personalBests.rb) {
            user.graph.personalBests.rb = user.graph.tracker.rebirths[user.graph.tracker.dates.indexOf(todayString)];
        }

        if (user.graph.tracker.prestiges[user.graph.tracker.dates.indexOf(todayString)] > user.graph.personalBests.pr) {
            user.graph.personalBests.pr = user.graph.tracker.prestiges[user.graph.tracker.dates.indexOf(todayString)]
        }
    }

    if (user.graph.tracker.rbDay[user.graph.tracker.dates.indexOf(todayString)] > user.graph.personalBests.rbDay) {
        user.graph.personalBests.rbDay = user.graph.tracker.rbDay[user.graph.tracker.dates.indexOf(todayString)]
    }

    user.graph.prLevel = embedPr;
    user.graph.rbLevel = embedRb;
    user.markModified("graph");

    await user.save();
}

/**
 * Checks for the presence of data yesterday
 * @param {Object} tracker tracker object containing user graph data
 * @param {Array<string>} tracker.dates list of dates
 * @param {Array<number>} tracker.rebirths list of rebirth counts
 * @param {Array<number>} tracker.prestiges list of prestige counts
 * @param {Array<number>} tracker.rbDay list of rb/day stats
 * @param {string} timezone timezone of the user's graph
 * @returns {Boolean}
 */
function hasDataYesterday(tracker, timezone = "+0") {
    // get yesterday's date
    const now = new Date();
    const yesterdayDate = new Date(now.toLocaleString('en-US', { timeZone: `Etc/GMT${timezone}` }));
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);

    // get date string as mm/dd/yyyy
    const month = yesterdayDate.getMonth() + 1;
    const day = yesterdayDate.getDate();
    const year = yesterdayDate.getFullYear();
    const yesterdayString = `${month}/${day}/${year}`;
    const yesterdayIndex = tracker.dates.indexOf(yesterdayString);

    // check presence of rbDay stat
    return tracker.rbDay[yesterdayIndex] !== null && tracker.rbDay[yesterdayIndex] !== undefined;
}
