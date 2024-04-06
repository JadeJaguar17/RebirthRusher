const MessageEmbed = require("../../system/MessageEmbed");
const { createUser } = require("../../database/controllers/userController");
const { SUCCESS } = require("../../config/embedColors.json");

module.exports = {
    name: "start",
    description: "Creates a new account for the user",
    syntax: "`/start`",
    execute: async function (interaction) {
        try {
            await createUser(interaction.member.user.id);
        } catch (error) {
            return "You already have an account!";
        }

        // log new user
        const newUserEmbed = new MessageEmbed()
            .setColor(SUCCESS)
            .setThumbnail(interaction.member.user.avatarURL)
            .setTitle("New user")
            .setDescription(
                `**Name:** ${interaction.member.user.username}\n`
                + `**ID:** \`${interaction.member.user.id}\``)
            .setTimestamp();

        await bot.log("account", newUserEmbed);

        // return the welcome message with a warning if the user has a default
        // avatar (since it'll screw with their experience)
        const welcomeMessage = `Your account has been created! To set up your `
            + `graph, run the Idle Miner \`/profile\` command. To learn more on`
            + ` how to use the bot, read \`/help\` and \`/guide\`!`;

        const defaultWarning = "\n\n:warning: You have a default avatar! "
            + "Due to how RbR works, certain features will not function "
            + "properly until you get a personalized avatar. I am very sorry "
            + "for this inconvinience, but unfortunately, there is currently "
            + "no workaround.";

        return welcomeMessage
            + `${interaction.member.user.avatar ? "" : defaultWarning}`;

    },
    options: []
}
