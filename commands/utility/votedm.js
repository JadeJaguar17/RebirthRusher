const UserDB = require("../../database/userController");
const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const { off, on } = require("../../config/emojis.json");

module.exports = {
    name: "votedm",
    description: "Enables/disables the bot DMing you after a vote",
    syntax: "`/votedm [enable | disable]`",
    needsAccount: true,
    execute: async function (interaction) {
        const user = await UserDB.getUserById(interaction.member.user.id);
        const emoji = user.settings.voteDisabled
            ? off
            : on

        const votedmEmbed = new MessageEmbed()
            .setTitle("Vote DM Settings")
            .setThumbnail("https://i.imgur.com/TDSkM7u.png")
            .setColor(RBR)
            .setDescription(`Vote DM's are currently ${emoji}`);

        return { embeds: [votedmEmbed] };
    },
    options: []
}
