const UserDB = require("../../database/controllers/userController");

module.exports.name = "prestige"
module.exports.aliases = ["pr"]

module.exports.execute = async function (userID) {
    const user = await UserDB.getUserById(userID);
    const deletedTimers = [];

    const query = { "message.author.id": userID };
    await timers.find(query, function (_, docs) {
        docs.forEach(timer => {
            if (timer.timerName === "harvest") return;

            deletedTimers.push(timers.findByIdAndDelete(timer._id));
            user.timers[timer.timerCategory][timer.timerName] = "ready";
        });
    });

    if (deletedTimers.length > 0) {
        await Promise.all(deletedTimers);
        await user.save();
    }
}
