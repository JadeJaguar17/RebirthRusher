const TimerDB = require("../../database/timerController");

module.exports = {
    name: "clear",
    aliases: ["cl"],
    execute: async function (userID) {
        await TimerDB.deleteTimerForUser(userID, "harvest");
    }
}
