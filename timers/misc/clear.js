const TimerDB = require("../../database/controllers/timerController");

module.exports = {
    name: "clear",
    aliases: ["cl"],
    execute: async function (userID) {
        await TimerDB.deleteTimerForUser(userID, "harvest");
    }
}
