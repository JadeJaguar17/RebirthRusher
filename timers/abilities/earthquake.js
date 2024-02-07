const users = require("../../models/userModel.js");
const Timer = require("../../system/Timer");

module.exports = {
    name: "earthquake",
    execute: async function (message, userID) {
        const user = await users.findById(userID);

        if (user.timers.abilities.earthquake === "ready") {
            await new Timer().startTimer(
                message,
                userID,
                "earthquake",
                "abilities",
                180
            );
        }
    }
}
