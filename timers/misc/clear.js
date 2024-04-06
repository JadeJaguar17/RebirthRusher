const timers = require("../../models/timerModel");
const UserDB = require("../../database/userController");

module.exports = {
    name: "clear",
    aliases: ["cl"],
    execute: async function (userID) {
        const user = await UserDB.getUserById(userID);

        const query = { "message.author.id": userID, "timerName": "harvest" };
        let hasHarvestTimer = false;
        timers.find(query, async function (_, docs) {
            for (const timer of docs) {
                await timers.findByIdAndDelete(timer._id);
                user.timers[timer.timerCategory][timer.timerName] = "ready";
                hasHarvestTimer = true;
            }
        });

        if (hasHarvestTimer) {
            await user.save();
        }
    }
}
