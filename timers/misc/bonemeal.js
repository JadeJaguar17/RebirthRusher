const TimerDB = require("../../database/controllers/timerController");

module.exports.name = "bonemeal"
module.exports.aliases = ["bm", "bone"]

module.exports.execute = async function (userID) {
    await TimerDB.deleteTimerForUser(userID, "harvest");
}
