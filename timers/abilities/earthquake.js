const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports = {
    name: "earthquake",
    execute: async function (message, userID) {
        const user = await UserDB.getUserById(userID);

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
