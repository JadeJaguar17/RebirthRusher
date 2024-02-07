const fs = require("fs");
const { dev } = require("../../config/discordIds.json");

module.exports = {
    name: "ban",
    description: "Bans user from the bot",
    syntax: "`/ban`",
    hidden: true,
    async execute(interaction) {
        if (interaction.member.user.id !== dev) return;

        const userID = interaction.data.options[0].value;
        const bannedUsers = JSON.parse(fs.readFileSync("./config/bannedUsers.json"));

        bannedUsers.push(userID);
        fs.writeFileSync("./config/bannedUsers.json", JSON.stringify(bannedUsers, null, 4));

        return `\`${userID}\` banned`;
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
