const MessageEmbed = require("../../system/MessageEmbed");
const users = require("../../models/userModel.js");
const { RBR } = require("../../config/embedColors.json");
const shop = require("../../config/shop.json");
const { token } = require("../../config/emojis.json");

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

module.exports = {
    name: "shop",
    description: "Displays the shop",
    syntax: "`/shop`",
    needsAccount: true,
    execute: async function (interaction) {
        const user = await users.findById(interaction.member.user.id);

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
    },
    options: []
}
