const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports.name = "wings"
module.exports.aliases = ["ws", "wg", "dragon", "wotb"]

module.exports.execute = async function (message, userID) {
    const user = await UserDB.getUserById(userID);

    if (user?.timers.abilities.wings === "ready") {
        await new Timer().startTimer(
            message,
            userID,
            "wings",
            "abilities",
            420 - 60 * user.pets["ender-dragon"]
        );

        return await bot.timers.get("booster").execute(bot,
            message,
            userID,
            "wings",
            60
        );
    }
}
