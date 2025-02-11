const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports.name = "rage"
module.exports.aliases = ["r", "wither"]

module.exports.execute = async function (message, userID) {
    const user = await UserDB.getUserById(userID);

    if (user.timers.abilities.rage === "ready") {
        new Timer().startTimer(
            message,
            user,
            "rage",
            "abilities",
            420 - 60 * user.pets.wither
        );

        return bot.timers.get("booster").execute(bot,
            message,
            userID,
            "rage",
            60
        );
    }
}
