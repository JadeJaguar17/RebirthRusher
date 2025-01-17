const UserDB = require("../../database/controllers/userController");
const shop = require("../../config/shop.json");
const MessageEmbed = require("../../system/MessageEmbed");
const { ROLE_PURCHASE_CHANNEL_ID } = require("../../config/discordIds.json");

module.exports.name = "buy"
module.exports.description = "Purchases and item from the shop"
module.exports.syntax = "`/buy [item id] [hex code if applicable]`"
module.exports.needsAccount = true

module.exports.execute = async function (interaction) {
    const itemID = interaction.data.options[0].value;
    const hex = interaction.data.options[1]
        && `#${interaction.data.options[1].value.replace("#", "")}`;

    if (itemID === 14 || itemID === 23) {
        if (!hex) {
            return `:no_entry_sign: Please provide a custom hex in the `
                + `\`hex\` option (ex. \`#123456\` or \`123456\`)!`;
        }

        if (!isHex(hex)) {
            return `:no_entry_sign: Please provide a valid hex!`;
        }
    }

    const user = await UserDB.getUserById(interaction.member.user.id);
    const item = shop.find(i => itemID === i.id);
    if (!item) {
        return ":no_entry_sign: Item ID is invalid";
    } else if (user.inventory.tokens < item.price) {
        return `:no_entry_sign: You can't afford this purchase! Get more `
            + `tokens through \`/donate\` or \`/vote\``;
    } else if (hasItem(user, item)) {
        return ":no_entry_sign: You already have this item!";
    } else {
        return {
            content: `Are you sure you want to buy `
                + `${item.name}${(hex && ` **(${hex})**`) || ""}?`,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 2,
                            custom_id: `${interaction.member.user.id}-buy-${item.id}-${hex || ""}`,
                            emoji: {
                                name: "✅",
                                id: null,
                            }
                        },
                        {
                            type: 2,
                            style: 2,
                            custom_id: `${interaction.member.user.id}-buy-cancel`,
                            emoji: {
                                name: "❌",
                                id: null,
                            }
                        },
                    ]
                }
            ]
        };
    }
}

module.exports.purchaseItem = async function (interaction, itemID, hex) {
    const user = await UserDB.getUserById(interaction.member.user.id);
    const item = shop.find(i => Number(itemID) === i.id);
    const purchasedItem = {...item};

    if (user.inventory.tokens < purchasedItem.price) {
        return `:no_entry_sign: You can't afford this purchase! Get more `
            `tokens through \`/donate\` or \`/vote\``;
    }

    if (purchasedItem.id === 14 || purchasedItem.id === 23) {
        purchasedItem.hex = hex;
    }

    if (purchasedItem.id === 14) {
        let count = 0;
        for (let i = 0; i < user.inventory.graphColors.length; i++) {
            if (Math.floor(user.inventory.graphColors[i].id) === 14) {
                count++;
            }
        }

        purchasedItem.id = Number(`14.${count + 1}`);
    }

    switch (purchasedItem.category) {
        case "graphColors":
            user.inventory.graphColors.push(purchasedItem);
            break;
        case "theme":
            user.inventory.hasDarkMode = true;
            break;
    }

    if (purchasedItem.id === 23) {
        const roleEmbed = new MessageEmbed()
            .setColor(hex.replace("#", "0x"))
            .setTitle("Custom Color Role")
            .setDescription(
                `<@${interaction.member.user.id}> has purchased a custom `
                + `color role with the hex \`${hex}\`. `
                + `Once the role has been created and given to the user, `
                + `please react with a :white_check_mark:`);

        const purchaseLog = await bot.send(
            { channel: { id: ROLE_PURCHASE_CHANNEL_ID } },
            { embeds: [roleEmbed] });
        await purchaseLog.addReaction("✅");
    }

    user.inventory.tokens -= purchasedItem.price;
    await user.save();

    return `You successfully bought `
        + `${purchasedItem.name}${(hex && ` **(${purchasedItem.hex})**`) || ""}. `
        + `${(purchasedItem.category === "graphColors" && `To learn how to use `
            + `this color, see \`/graph set\`. `) || ""}Enjoy your purchase!`;
}

module.exports.options = [
    {
        name: "id",
        description: "ID of item you want to buy (from /shop)",
        type: 4,
        required: true
    },
    {
        name: "hex",
        description: "hex code of custom color or role if applicable",
        type: 3
    }
]

function hasItem(user, item) {
    if (["graphColors", "subscriptions"].includes(item.category) && item.id !== 14) {
        return user.inventory[item.category].some(i => i.id === item.id);
    } else if (item.category === "theme") {
        return user.inventory.hasDarkMode;
    }

    return false;
}

function isHex(hex) {
    return /^#?([0-9A-F]{3}){1,2}$/i.test(hex);
}
