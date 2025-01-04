const UserDB = require("../../database/controllers/userController");
const { RBR } = require("../../config/embedColors.json");
const MessageEmbed = require("../../system/MessageEmbed");
const { token } = require("../../config/emojis.json");

module.exports.name = "inventory"
module.exports.description = "Displays all items that user has bought from the shop"
module.exports.syntax = "`/inventory`"
module.exports.needsAccount = true

module.exports.execute = async function (interaction, pageNum = 1) {
    const user = await UserDB.getUserById(interaction.member.user.id);

    // create list of colors
    const inventoryPages = [];
    let colorString = "";
    const colors = user.inventory.graphColors.sort((a, b) => a.id - b.id);
    colors.forEach(color => {
        const id = color.id < 10 ? ` ${color.id}` : color.id;
        const customHex = Math.floor(id) === 14
            ? (" **(" + color.hex + ")**")
            : "";
        const stringToAdd = `\`${id}\` ${color.name}${customHex}\n`;

        // handle overflow
        if (stringToAdd.length + colorString.length > 1024) {
            inventoryPages.push(colorString);
            colorString = "";
        }
        colorString += `\`${id}\` ${color.name}${customHex}\n`;
    });
    inventoryPages.push(colorString);

    // let subscriptions = "";
    // user.inventory.subscriptions.forEach(subscription => {
    //     const today = new Date();
    //     subscriptions += `\`${subscription.id}\` ${subscription.name} - `
    //         + `${Math.round((subscription.expiration - today) / 86400000)}`
    //         + `days left\n`;
    // });

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
                value: inventoryPages[pageNum - 1] || "When you buy graph colors, "
                    + "they will appear here"
            },
            // {
            //     name: "Subscriptions",
            //     value: subscriptions || "When you buy subscriptions, they will appear here"
            // }
        );
    
    const buttons = [];
    if (inventoryPages.length > 1) {
        for (let i = 1; i <= inventoryPages.length; i++) {
            buttons.push({
                type: 2,
                style: 4,
                label: `Page ${1}`,
                custom_id: `${interaction.member.user.id}-inventory-${i}`,
                disabled: pageNum === i
            });
        }
    }

    return {
        embeds: [inventoryEmbed],
        components: [
            {
                type: 1,
                components: buttons
            }
        ]
    };
}
