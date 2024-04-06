const UserDB = require("../../database/userController");
const Timer = require("../../system/Timer");

module.exports = {
    name: "harvest",
    execute: async function (message, userID, harvestTime) {
        const user = await UserDB.getUserById(userID);

        if (user.timers.games.harvest === "ready") {
            await new Timer().startTimer(
                message,
                userID,
                "harvest",
                "games",
                harvestTime
            );
        }
    }
}
