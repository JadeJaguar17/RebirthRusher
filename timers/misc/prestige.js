module.exports = {
    name: "prestige",
    aliases: ["pr"],
    execute: async function (userID) {
        const user = await users.findById(userID);
        const deletedTimers = [];

        const query = { "message.author.id": userID };
        await timers.find(query, function (_, docs) {
            for (const timer of docs) {
                if (timer.timerName === "harvest") continue;

                deletedTimers.push(timers.findByIdAndDelete(timer._id));
                user.timers[timer.timerCategory][timer.timerName] = "ready";
            }
        });

        if (deletedTimers.length > 0) {
            await Promise.all(deletedTimers);
            await user.save();
        }
    }
}
