const users = require("../../models/userModel");

module.exports = {
    name: "daily",
    aliases: ["d"],
    execute: async function (message, userID) {
        const user = await users.findById(userID);

        if (user.settings.daily !== message.channel.id) {
            user.settings.daily = message.channel.id;
            return await user.save();
        }
    }
}
