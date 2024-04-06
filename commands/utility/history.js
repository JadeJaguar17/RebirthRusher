const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");

module.exports.name = "history"
module.exports.description = "Gives a brief history on the origins of Rebirth Rusher"
module.exports.syntax = "`/history`"

module.exports.execute = async function () {
    const historyMessage =
        "Rebirth Rusher was an old guild that had a good run. It was "
        + "created by Anto but taken over by breezyy where the magic "
        + "happened, eventually they left off to Firefly(another guild) "
        + "where ownership was given to Tobi then to Jade(those who were "
        + "there will remember a different name he had). When papa jade "
        + "took over that's where lots of other stuff took priority that "
        + "was outside of playing Idle Miner itself meaning communication "
        + "with other guilds and lots of server work and maintenance. "
        + "Then there was the golden age of Rebirth Rusher where gijo777, "
        + "oxy, Wolfdragon, Zie, Aiko, Will7, Jaycee, myself, and Jade were "
        + "loving the bot, flirting a little(just me), and just having a "
        + "good time on discord. Eventually it started to fall apart to "
        + "where other people joined other guilds and people going "
        + "inactive. There [were] desperate efforts to get the guild back "
        + "together but in the end, it did not end up working and the "
        + "efforts stopped. Once that had finished then Jade had a new "
        + "purpose: create a bot that is available to the public that can "
        + "help people with Idle Miner. Plenty of work has gone in along "
        + "with a full server transformation from what used to be a guild "
        + "server to a fully functional bot support server. That's my "
        + "essay and I'm done😂";

    const historyEmbed = new MessageEmbed()
        .setColor(RBR)
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setDescription(historyMessage)
        .setThumbnail("https://i.imgur.com/JUNFqEn.png")
        .setFooter("Courtesy of fuzzbeed")
        .setTitle("History");

    return { embeds: [historyEmbed] };
}

module.exports.options = []
