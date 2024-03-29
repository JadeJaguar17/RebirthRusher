const users = require("../../models/userModel");
const Timer = require("../../system/Timer");

module.exports = {
    name: "hourly",
    aliases: ["hr"],
    execute: async function (message, userID) {
        const user = await users.findById(userID);

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
