const MessageEmbed = require("../../system/MessageEmbed");
const UserDB = require("../../database/controllers/userController");
const { RBR } = require("../../config/embedColors.json");

module.exports = {
    name: "calculate",
    description: "Calculates the price of upgrading your pick/bp a certain number of levels",
    syntax: "`/calculate <bp|pa> [current level] [levels]` (*<> = required, [] = optional, | = either works*)",
    needsAccount: true,
    execute: async function (interaction) {
        const tool = interaction.data.options[0].value;
        const currentLevel = interaction.data.options[1].value;
        const amount = interaction.data.options[2].value;

        if (currentLevel < 0) {
            return `:no_entry_sign: Tool level must be greater than 0`;
        }

        if (amount < 0) {
            return `:no_entry_sign: Amount must be greater than 0`;
        }

        const user = await UserDB.getUserById(interaction.member.user.id);
        const price = calculatePrice(currentLevel, amount, user);

        const priceEmbed = new MessageEmbed()
            .setColor(RBR)
            .setAuthor(
                interaction.member.user.username,
                interaction.member.user.avatarURL
            )
            // .setThumbnail("")
            .setTitle("Calculate")
            .setDescription(
                `It will cost you **$${numToMoney(price)}** to `
                + `upgrade your ${tool} **${amount}** level(s)`
            );

        return { embeds: [priceEmbed] };
    },
    options: [
        {
            name: "tool",
            description: "which tool to make upgrade calculations for",
            type: 3,
            required: true,
            choices: [
                {
                    name: "Pickaxe",
                    value: "pickaxe"
                },
                {
                    name: "Backpack",
                    value: "backpack"
                }
            ]
        },
        {
            name: "level",
            description: "current level of selected tool",
            type: 4,
            required: true
        },
        {
            name: "amount",
            description: "amount of levels to calculate",
            type: 4,
            required: true
        }
    ]
}

// calculate whole upgrade cost
function calculatePrice(currentLevel, amount, user) {
    let price = 0;
    for (let l = currentLevel; l < (currentLevel + amount); l++) {
        const discount = user.pets["zombie-horse"]
            ? 1 - 0.06 ** user.pets["zombie-horse"]
            : 1;
        price += calc(user.graph.prLevel, user.graph.rbLevel, l, discount);
    }
    return price;
}

// calculate price for one level
function calc(prestige, rebirth, currentLevel, discount) {
    return Math.round(
        1000                                    // base price = $1000
        * (1 + prestige * 0.05)                 // upgrade prices increase by 5% every prestige
        * Math.pow(3, Math.floor(rebirth / 3))  // new dimension = tripled prices
        * Math.pow(1.05, currentLevel)          // price increases by 5% each level
        * discount                              // mythical pet effect
    );
}

// adds dollar sign and commas
function numToMoney(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
