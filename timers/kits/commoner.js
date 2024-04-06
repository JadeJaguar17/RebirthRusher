const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports = {
    name: "commoner",
    aliases: ["com"],
    execute: async function (message, userID) {
        const user = await UserDB.getUserById(userID);

        if (user.timers.kits.commoner === "ready") {
            await new Timer().startTimer(
                message,
                userID,
                "commoner",
                "kits",
                600
            );
        }
    }
}
