const UserDB = require("../../database/userController");

module.exports = {
    name: "daily",
    aliases: ["d"],
    execute: async function (message, userID) {
        const user = await UserDB.getUserById(userID);

        if (user.settings.daily !== message.channel.id) {
            user.settings.daily = message.channel.id;
            return await user.save();
        }
    }
}
