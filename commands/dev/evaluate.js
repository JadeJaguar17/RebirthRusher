const UserDB = require("../../database/controllers/userController");
const { DEV_ID } = require("../../config/discordIds.json");

module.exports.name = "evaluate"
module.exports.description = "Lets developers directly evaluate code with Discord messages\n*(dev only)*"
module.exports.syntax = "`/evaluate [code]`"
module.exports.hidden = true

module.exports.execute = async function (interaction) {
    if (interaction.member.user.id === DEV_ID) {
        try {
            const user = await UserDB.getUserById(interaction.member.user.id);
            const result = eval(interaction.data.options[0].value);

            return `\`\`\`js\n${result}\n\`\`\``;
        } catch (err) {
            return `**ERROR** \`\`\`xl\n${err}\n\`\`\``;
        }
    }
}

module.exports.options = [
    {
        name: "code",
        description: "code to evaluate",
        type: 3,
        required: true
    }
]
