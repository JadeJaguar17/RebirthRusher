const UserDB = require("../../database/controllers/userController");
const { RBR } = require("../../config/embedColors.json");
const MessageEmbed = require("../../system/MessageEmbed");
const { token } = require("../../config/emojis.json");

module.exports.name = "inventory"
module.exports.description = "Displays all items that user has bought from the shop"
module.exports.syntax = "`/inventory`"
module.exports.needsAccount = true

module.exports.execute = async function (interaction) {
    const user = await UserDB.getUserById(interaction.member.user.id);

    // create list of colors
    let colorString = "";
    const colors = user.inventory.graphColors.sort((a, b) => a.id - b.id);
    for (const color of colors) {
        const id = color.id < 10 ? ` ${color.id}` : color.id;
        const customHex = Math.floor(id) === 14
            ? (" **(" + color.hex + ")**")
            : "";
        colorString += `\`${id}\` ${color.name}${customHex}\n`;
    }

    // let subscriptions = "";
    // for (const subscription of user.inventory.subscriptions) {
    //     const today = new Date();
    //     subscriptions += `\`${subscription.id}\` ${subscription.name} - `
    //         + `${Math.round((subscription.expiration - today) / 86400000)}`
    //         + `days left\n`;
    // }

    const inventoryEmbed = new MessageEmbed()
        .setTitle("Inventory")
        .setColor(RBR)
        .setDescription(
            `Tokens: ${user.inventory.tokens} ${token}\n`
            + `Buy more stuff at \`/shop\`!`)
        .setThumbnail("https://i.imgur.com/K9TZLhE.png")
        .addFields(
            {
                name: "Colors",
                value: colorString || "When you buy graph colors, "
                    + "they will appear here"
            },
            // {
            //     name: "Subscriptions",
            //     value: subscriptions || "When you buy subscriptions, they will appear here"
            // }
        );

    return { embeds: [inventoryEmbed] };
}

module.exports.options = []
