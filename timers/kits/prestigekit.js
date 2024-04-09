const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

const pKitCooldowns = [86400, 86400, 86400, 72000, 54000, 36000];

module.exports.name = "prestigekit"
module.exports.aliases = ["pkit", "pk"]

module.exports.execute = async function (message, userID) {
    const user = await UserDB.getUserById(userID);

    if (user.timers.kits.pKit === "ready") {
        await new Timer().startTimer(
            message,
            userID,
            "prestigekit",
            "kits",
            pKitCooldowns[user.settings.pKit]
        );
    }
}
