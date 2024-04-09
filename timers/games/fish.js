const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports.name = "fish"

module.exports.execute = async function (message, userID) {
    const user = await UserDB.getUserById(userID);

    if (user?.timers.games.fish === "ready") {
        await new Timer().startTimer(
            message,
            userID,
            "fish",
            "games",
            300
        );
    }
}
