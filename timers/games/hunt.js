const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports = {
    name: "hunt",
    aliases: ["h"],
    execute: async function (message, userID) {
        const user = await UserDB.getUserById(userID);

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
