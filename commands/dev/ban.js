const fs = require("fs");
const { dev } = require("../../config/discordIds.json");

module.exports.name = "ban"
module.exports.description = "Bans user from the bot"
module.exports.syntax = "`/ban`"
module.exports.hidden = true

module.exports.execute = async function (interaction) {
    if (interaction.member.user.id !== dev) return;

    const userID = interaction.data.options[0].value;
    const bannedUsers = JSON.parse(fs.readFileSync("./config/bannedUsers.json"));

    bannedUsers.push(userID);
    fs.writeFileSync("./config/bannedUsers.json", JSON.stringify(bannedUsers, null, 4));

    return `\`${userID}\` banned`;
}

module.exports.options = [
    {
        name: "id",
        description: "user ID",
        type: 3,
        required: true
    }
]
