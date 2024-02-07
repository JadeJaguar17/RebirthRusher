const users = require("../../models/userModel");
const Timer = require("../../system/Timer");

module.exports = {
    name: "fish",
    execute: async function (message, userID) {
        const user = await users.findById(userID);

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
}
