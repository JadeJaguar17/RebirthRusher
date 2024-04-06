const UserDB = require("../database/userController");

module.exports = {
    name: "profileScan",
    execute: async function (userID, embedPr, embedRb, embedRbDay) {
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
        const graphLast = new Date(user.graph.tracker.dates[user.graph.tracker.dates.length - 1]);

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

        // Get personal bests
        if (user.graph.tracker.rebirths[user.graph.tracker.dates.indexOf(todayString)] > user.graph.personalBests.rb) {
            user.graph.personalBests.rb = user.graph.tracker.rebirths[user.graph.tracker.dates.indexOf(todayString)];
        }

        if (user.graph.tracker.prestiges[user.graph.tracker.dates.indexOf(todayString)] > user.graph.personalBests.pr) {
            user.graph.personalBests.pr = user.graph.tracker.prestiges[user.graph.tracker.dates.indexOf(todayString)]
        }

        if (user.graph.tracker.rbDay[user.graph.tracker.dates.indexOf(todayString)] > user.graph.personalBests.rbDay) {
            user.graph.personalBests.rbDay = user.graph.tracker.rbDay[user.graph.tracker.dates.indexOf(todayString)]
        }

        user.graph.prLevel = embedPr;
        user.graph.rbLevel = embedRb;

        user.markModified("graph");

        await user.save();
    }
}
