const UserDB = require("../../database/controllers/userController");

module.exports.name = "daily"
module.exports.aliases = ["d"]

module.exports.execute = async function (message, userID) {
    const user = await UserDB.getUserById(userID);

    if (user.settings.daily !== message.channel.id) {
        user.settings.daily = message.channel.id;
        return await user.save();
    }
}
