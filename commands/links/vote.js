const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const { vote } = require("../../config/links.json");

module.exports.name = "vote"
module.exports.description = "Sends the bot vote link"
module.exports.syntax = "`/vote`"

module.exports.execute = async function () {
    const voteEmbed = new MessageEmbed()
        .setTitle("Vote!")
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setThumbnail("https://i.imgur.com/f0ErbMs.png")
        .setDescription(`Vote for me to get extra tokens!`)
        .setColor(RBR);

    return {
        embeds: [voteEmbed],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 5,
                        label: "Vote",
                        url: vote
                    }
                ]
            }
        ]
    };
}
