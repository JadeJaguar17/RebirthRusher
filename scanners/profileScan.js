const UserDB = require("../database/controllers/userController");

module.exports.name = "profileScan"

module.exports.execute = async function (userID, embedPr, embedRb, embedRbDay) {
    if (isNaN(embedPr) || isNaN(embedRb) || isNaN(embedRbDay)) {
        return await bot.error("profileScan", new TypeError("Invalid embed stats"));
    }

    const user = await UserDB.getUserById(userID);

    // Need to flip the signs
    const flipped = user.settings.timezone.startsWith("+")
        ? user.settings.timezone.replace("+", "-")
        : user.settings.timezone.replace("-", "+");

    const now = new Date();
    const today = new Date(now.toLocaleString("en-US", { timeZone: `Etc/GMT${flipped}` }));
    const todayString = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    const graphLast = user.graph.tracker.dates[user.graph.tracker.dates.length - 1];
    const lastRecordedIndex = user.graph.tracker.rebirths.lastIndexOf(
        user.graph.tracker.rebirths
            .slice()
            .reverse()
            .find(value => value !== null)
    );
    const lastRecordedDate = user.graph.tracker.dates[lastRecordedIndex];

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
    if (isYesterdayOrToday(lastRecordedDate)) {
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

function isYesterdayOrToday(dateString) {
    if (!dateString) return false;

    // Parse the input date
    const [month, day] = dateString.split('/').map(Number);

    // Get today's date
    const today = new Date();
    const currentYear = today.getFullYear();

    // Create a Date object for the given date (using the current year)
    let inputDate = new Date(currentYear, month - 1, day);

    // Handle cases where the input date is more than 30 days in the future
    if (inputDate - today > 30 * 24 * 60 * 60 * 1000) {
        inputDate = new Date(currentYear - 1, month - 1, day);
    }

    // Get yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Check if the input date is either yesterday or today
    const isToday = (
        inputDate.getFullYear() === today.getFullYear() &&
        inputDate.getMonth() === today.getMonth() &&
        inputDate.getDate() === today.getDate()
    );

    const isYesterday = (
        inputDate.getFullYear() === yesterday.getFullYear() &&
        inputDate.getMonth() === yesterday.getMonth() &&
        inputDate.getDate() === yesterday.getDate()
    );

    return isToday || isYesterday;
}
