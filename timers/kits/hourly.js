const UserDB = require("../../database/userController");
const Timer = require("../../system/Timer");

module.exports = {
    name: "hourly",
    aliases: ["hr"],
    execute: async function (message, userID) {
        const user = await UserDB.getUserById(userID);

        if (user.timers.kits.hourly === "ready") {
            await new Timer().startTimer(
                message,
                userID,
                "hourly",
                "kits",
                3600
            );
        }
    }
}
