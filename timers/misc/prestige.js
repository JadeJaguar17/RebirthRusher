const TimerDB = require("../../database/controllers/timerController");

module.exports.name = "prestige"
module.exports.aliases = ["pr"]

module.exports.execute = async function (userID) {
    return await TimerDB.deleteTimerForUserExcept(userID, ["harvest"]);
}
