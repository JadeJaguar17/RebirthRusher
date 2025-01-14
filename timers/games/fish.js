const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports.name = "fish"

module.exports.execute = async function (message, userID) {
    const user = await UserDB.getUserById(userID);
    const fishcd = user?.settings.fishingPerks === 3
        ? 240
        : 300
    if (user?.timers.games.fish === "ready") {
        await new Timer().startTimer(
            message,
            userID,
            "fish",
            "games",
            fishcd
        );
    }
}
