const users = require("../../models/userModel.js");
const Timer = require("../../system/Timer");

module.exports = {
    name: "hunt",
    aliases: ["h"],
    execute: async function (message, userID) {
        const user = await users.findById(userID);

        if (user?.timers.games.hunt === "ready") {
            await new Timer().startTimer(
                message,
                userID,
                "hunt",
                "games",
                user.settings.huntcd
            );
        }
    }
}
