/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const { getTopTenTokens } = require("../../database/controllers/userController");
const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");

module.exports.name = "leaderboard"
module.exports.description = "A leaderboard for the top 10 with the most tokens"
module.exports.syntax = "`/leaderboard`"

/**
 * Displays a leaderboard for top 10 users with most tokens
 * @param {RebirthRusher} bot instance of RbR base class
 * @param {CommandInteraction} interaction triggering Eris interaction
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    // only get the top 10 users
    const places = await getTopTenTokens();

    // create string representation of the leaderboard
    let leaderboard = ""
    for (const place in places) {
        const user = places[place];
        const discordUser = await bot.users.get(user._id)
            || await bot.getRESTUser(user._id);

        leaderboard += `**#${Number(place) + 1} ${discordUser.username}**\n`
            + `${addCommas(user.inventory.tokens.toString())}\n`;
    }

    // add to embed
    const leaderboardEmbed = new MessageEmbed()
        .setTitle("Token Leaderboard")
        .setDescription(leaderboard)
        .setThumbnail("https://i.imgur.com/QGeVBwy.png")
        .setColor(RBR);

    return { embeds: [leaderboardEmbed] };
}

// add commas to number string
function addCommas(string) {
    return string.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
