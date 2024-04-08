const fs = require("fs");
const { DEV_ID } = require("../../config/discordIds.json");

module.exports.name = "unban"
module.exports.description = "Unbans user from the bot"
module.exports.syntax = "`/unban`"
module.exports.hidden = true

module.exports.execute = async function (interaction) {
    if (interaction.member.user.id === DEV_ID) return;

    const userID = interaction.data.options[0].value;
    const bannedUsers = JSON.parse(fs.readFileSync("./config/bannedUsers.json"));

    const index = bannedUsers.indexOf(userID);
    if (index === -1) return "User not found";
    bannedUsers.splice(index, 1);
    fs.writeFileSync(
        "./config/bannedUsers.json",
        JSON.stringify(bannedUsers, null, 4)
    );

    return `\`${userID}\` unbanned`;
}

module.exports.options = [
    {
        name: "id",
        description: "user ID",
        type: 3,
        required: true
    }
]
