const TimerDB = require("../../database/controllers/timerController");

module.exports.name = "clear"
module.exports.aliases = ["cl"]

module.exports.execute = async function (userID) {
    await TimerDB.deleteTimerForUser(userID, "harvest");
}
