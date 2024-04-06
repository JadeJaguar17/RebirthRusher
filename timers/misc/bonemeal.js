const TimerDB = require("../../database/timerController");

module.exports = {
    name: "bonemeal",
    aliases: ["bm", "bone"],
    execute: async function (userID) {
        await TimerDB.deleteTimerForUser(userID, "harvest");
    }
}
