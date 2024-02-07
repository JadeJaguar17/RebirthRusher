const timers = require("../../models/timerModel");
const users = require("../../models/userModel");

module.exports = {
    name: "bonemeal",
    aliases: ["bm", "bone"],
    execute: async function (userID) {
        const user = await users.findById(userID);

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
