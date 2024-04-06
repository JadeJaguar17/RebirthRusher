const UserDB = require("../../database/controllers/userController");
const Timer = require("../../system/Timer");

module.exports = {
    name: "supporter",
    aliases: ["sup", "support"],
    execute: async function (message, userID) {
        const user = await UserDB.getUserById(userID);

        if (user.timers.kits.supporter === "ready") {
            await new Timer().startTimer(
                message,
                userID,
                "supporter",
                "kits",
                86400
            );
        }
    }
}
