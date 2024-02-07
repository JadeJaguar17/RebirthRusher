const users = require("../../models/userModel");
const { dev } = require("../../config/discordIds.json");

module.exports = {
    name: "evaluate",
    description: "Lets developers directly evaluate code with Discord messages\n*(dev only)*",
    syntax: "`/evaluate [code]`",
    hidden: true,
    execute: async function (interaction) {
        if (interaction.member.user.id === dev) {
            try {
                const user = await users.findById(interaction.member.user.id);
                const result = eval(interaction.data.options[0].value);

                return `\`\`\`js\n${result}\n\`\`\``;
            } catch (err) {
                return `**ERROR** \`\`\`xl\n${err}\n\`\`\``;
            }
        }
    },
    options: [
        {
            name: "code",
            description: "code to evaluate",
            type: 3,
            required: true
        }
    ]
}
