const MessageEmbed = require("../../system/MessageEmbed");
const UserDB = require("../../database/controllers/userController");
const { RBR } = require("../../config/embedColors.json");
const shop = require("../../config/shop.json");
const { token } = require("../../config/emojis.json");

module.exports.name = "shop"
module.exports.description = "Displays the shop"
module.exports.syntax = "`/shop`"
module.exports.needsAccount = true

module.exports.execute = async function (interaction) {
    const user = await UserDB.getUserById(interaction.member.user.id);

    shopMenuEmbed
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setDescription(
            `You currently have **${user.inventory.tokens}** ${token}\n`
            + `Want more tokens? \`/donate\` or \`/vote\` to get some more!\n\n`
            + `Buy an item with \`/buy [item id]\`. You will be asked to `
            + `confirm the purchase\n`
            + `Check your \`/inventory\` for all the things you've bought `
            + `so far`
        );

    return { embeds: [shopMenuEmbed] };
}

const shopMenuEmbed = new MessageEmbed()
    .setTitle("Shop")
    .setColor(RBR)
    .setThumbnail("https://i.imgur.com/x7GRidJ.png");

let graphStandards = "";
for (const color of shop.filter(i => i.id <= 12)) {
    const id = color.id < 10 ? ` ${color.id}` : color.id;
    graphStandards += `\`${id}\` ${color.name}\n`;
}

let graphSpecials = "";
for (const color of shop.filter(i => i.id > 12 && i.id <= 15)) {
    graphSpecials += `\`${color.id}\` ${color.name} | ${color.price} ${token}\n`
        + `${color.description}\n`;
}

let serverPerks = "";
const perks = shop.filter(i => i.category == "server");
for (const perk of perks) {
    serverPerks += `\`${perk.id}\` ${perk.name} | ${perk.price} ${token}\n`
        + `${perk.description}\n`;
}

shopMenuEmbed
    .addFields(
        { name: "Standard Colors (20 ${token} each)", value: graphStandards },
        { name: "Graph Specials", value: graphSpecials },
        { name: "Server Perks", value: serverPerks }
    );
