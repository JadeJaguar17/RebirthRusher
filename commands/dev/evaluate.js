/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const UserDB = require("../../database/controllers/userController");
const { DEV_ID } = require("../../config/discordIds.json");

module.exports.name = "evaluate"
module.exports.description = "Lets developers directly evaluate code with Discord messages\n*(dev only)*"
module.exports.syntax = "`/evaluate [code]`"
module.exports.hidden = true

/**
 * Evaluate code with Discord messages
 * @param {RebirthRusher} bot RbR Discord client
 * @param {CommandInteraction} interaction triggering Discord slash command
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    // extra protection in case future changes to interactionCreate exposes this
    if (interaction.member.user.id !== DEV_ID) {
        await bot.error("eval", new Error("EVAL HAS BEEN ACCESSED"));
        return;
    }

    try {
        const user = await UserDB.getUserById(interaction.member.user.id);
        const result = eval(interaction.data.options[0].value);

        return `\`\`\`js\n${result}\n\`\`\``;
    } catch (err) {
        return `**ERROR** \`\`\`xl\n${err}\n\`\`\``;
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
