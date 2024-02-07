const MessageEmbed = require("../../system/MessageEmbed");
const users = require("../../models/userModel");
const { SUCCESS } = require("../../config/embedColors.json");

module.exports = {
    name: "start",
    description: "Creates a new account for the user",
    syntax: "`/start`",
    execute: async function (interaction) {
        const user = await users.findById(interaction.member.user.id);
        if (user) return "You already have an account!";

        await users.create({
            _id: interaction.member.user.id
        });

        // log new user
        const newUserEmbed = new MessageEmbed()
            .setColor(SUCCESS)
            .setThumbnail(interaction.member.user.avatarURL)
            .setTitle("New user")
            .setDescription(
                `**Name:** ${interaction.member.user.username}`
                + `#${interaction.member.user.discriminator}\n`
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
