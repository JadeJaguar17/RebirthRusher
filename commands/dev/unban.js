const fs = require("fs");
const { dev } = require("../../config/discordIds.json");

module.exports = {
    name: "unban",
    description: "Unbans user from the bot",
    syntax: "`/unban`",
    hidden: true,
    async execute(interaction) {
        if (interaction.member.user.id === dev) return;

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
    },
    options: [
        {
            name: "id",
            description: "user ID",
            type: 3,
            required: true
        }
    ]
}
