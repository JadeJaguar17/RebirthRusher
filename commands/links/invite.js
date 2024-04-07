const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const { invite } = require("../../config/links.json");

module.exports.name = "invite"
module.exports.description = "Sends the bot invite link"
module.exports.syntax = "`/invite`"

module.exports.execute = async function (message) {
    const inviteEmbed = new MessageEmbed()
        .setColor(RBR)
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setTitle("Invite Me!")
        .setThumbnail("https://i.imgur.com/HRIQMyF.png")
        .setDescription(`Want to use me in your server? Invite me!`);

    return {
        embeds: [inviteEmbed],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 5,
                        label: "Invite",
                        url: invite
                    }
                ]
            }
        ]
    };
}
