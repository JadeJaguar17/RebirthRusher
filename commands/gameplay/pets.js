const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const UserDB = require("../../database/userController");
const { backpack, pick, gold, boost, shard } = require("../../config/emojis.json");

const petPrices = {
    common: 10,
    uncommon: 25,
    rare: 50,
    epic: 50,
    mythical: 60,
    legendary: 75,
    "★ uncommon": 25,
    "★ rare": 50,
    "★ epic": 50,
}

module.exports = {
    name: "pets",
    description: "Analyzes pet data and calculates some stats",
    syntax: "`/pets`",
    aliases: ["p"],
    needsAccount: true,
    execute: async function (interaction) {
        const user = await UserDB.getUserById(interaction.member.user.id);

        // Some initial calculations
        const commons = user.pets.common + 2 * user.pets["★ common"];
        const uncommons = user.pets.uncommon + 2 * user.pets["★ uncommon"];
        const rares = user.pets.rare + 2 * user.pets["★ rare"];
        const epics = user.pets.epic + 2 * user.pets["★ epic"];
        const mythicals = user.pets["spider-jockey"]
            + user.pets["zombie-horse"]
            + user.pets["skeleton-horse"];
        const legendaries = user.pets["giant"]
            + user.pets["wither"]
            + user.pets["ender-dragon"];

        const bpBoost = commons * 0.05;
        const paBoost = uncommons * 0.1;
        const sellBoost = rares * 0.075;
        const epicBoost = 1 + (epics * 0.02);

        const petWorth = petPrices.common * commons
            + petPrices.uncommon * uncommons
            + petPrices.rare * rares
            + petPrices.epic * epics
            + petPrices.mythical * mythicals
            + petPrices.legendary * legendaries;

        // Getting next optimal upgrade
        const nextOptimalUpgrade = {};
        let userShards = (interaction.data.options?.[0]?.value) || user.pets.shards;

        // cap user shards as 5k to prevent CPU overuse
        let isCapped = false;
        if (userShards > 5000) {
            userShards = 5000;
            isCapped = true;
        }

        // calculate upgrades within the amount of shards
        while (userShards > 0) {
            const upgrade = getOptimalUpgrade(user.pets);
            const price = Math.max((petPrices[upgrade] - user.pets["spider-jockey"]), 1);

            if ((userShards - price) < 0) {
                break;
            }

            if (!nextOptimalUpgrade[upgrade]) {
                nextOptimalUpgrade[upgrade] = 0;
            }

            nextOptimalUpgrade[upgrade]++;
            user.pets[upgrade]++;
            userShards -= price;
        }

        // generate list of upgrades
        let nextOptimalUpgradeString = ""

        if (user.pets["spider-jockey"] >= 25) {
            nextOptimalUpgradeString += "- You have free common and uncommon "
                + "upgrades, so max them to your heart's content!\n"
        }

        if (user.pets["spider-jockey"] >= 10) {
            nextOptimalUpgradeString += "- You have free common upgrades, so "
                + "max them to your heart's content!\n"
        }

        for (rarity of Object.keys(nextOptimalUpgrade)) {
            nextOptimalUpgradeString += `- ${nextOptimalUpgrade[rarity]} ${rarity}\n`;
        }

        if (nextOptimalUpgradeString === "") {
            nextOptimalUpgradeString = "None (you can't afford any. You can do "
                + "\`/pets [shards]\` to calculate )"
        }

        const petEmbed = new MessageEmbed()
            .setColor(RBR)
            .setAuthor(interaction.member.user.username, interaction.member.user.avatarURL)
            .setThumbnail("https://i.imgur.com/q3j286y.png")
            .setTitle("Pets")
            .setDescription(
                `- *${boost} = epic boost*\n`
                + `- *Each golden level counts as 2 levels*`
            )
            .addFields(
                {
                    name: `Total Levels`,
                    value: `${backpack} ${commons}\n`
                        + `${pick} ${uncommons}\n`
                        + `${gold} ${rares}\n`
                        + `${boost} ${epics}\n`,
                    inline: true
                },
                {
                    name: `Base Boost`,
                    value: `+${bpBoost.toFixed(2)}x\n`
                        + `+${paBoost.toFixed(2)}x\n`
                        + `+${sellBoost.toFixed(2)}x\n`
                        + `+${(epicBoost - 1).toFixed(2)}x`,
                    inline: true
                },
                {
                    name: `${boost} (+${epics * 2}%)`,
                    value: `+${(bpBoost * epicBoost).toFixed(2)}x\n`
                        + `+${(paBoost * epicBoost).toFixed(2)}x\n`
                        + `+${(sellBoost * epicBoost).toFixed(2)}x`,
                    inline: true
                },
                {
                    name: "Net worth",
                    value: `Pets: ${petWorth} ${shard}\n`
                        + `Shards: ${user.pets.shards} ${shard}\n`
                        + `**Total:** ${petWorth + user.pets.shards} ${shard}`,
                    inline: true
                },
                {
                    name: "Ratios",
                    value: `${backpack} to ${pick} ratio = ${(commons / uncommons).toFixed(3)}\n`
                        + `${pick} to ${gold} ratio = ${(uncommons / rares).toFixed(3)}\n`
                        + `${gold} to ${backpack} ratio = ${(rares / commons).toFixed(3)}`,
                    inline: true
                },
                {
                    name: "Next Optimal Upgrades",
                    value: nextOptimalUpgradeString
                },
            );

        return {
            content: isCapped
                ? "*Note: pet calculations are capped at 5000 shards to optimize performance*"
                : "",
            embeds: [petEmbed]
        };
    },
    options: [
        {
            name: "shards",
            description: "set a custom amount of shards to calculate upgrades",
            type: 4
        }
    ]
}

// next single optimal upgrade (formulas taken from Wes' spreadsheet)
// yes, this code is messy, and yes I don't feel like cleaning it 🤣
function getOptimalUpgrade(pets) {
    const uncommons = pets.uncommon + 2 * pets["★ uncommon"];
    const rares = pets.rare + 2 * pets["★ rare"];
    const epics = pets.epic + 2 * pets["★ epic"];
    const upgrades = [];

    if (petPrices.uncommon - pets["spider-jockey"] > 0) {
        const uncommonBoost = ((1 + (uncommons + 1 + (pets["★ uncommon"] > 0)) * 0.1 * (1 + epics * 0.02))
            - (1 + uncommons * 0.1 * (1 + epics * 0.02))) / (1 + uncommons * 0.1 * (1 + epics * 0.02));

        upgrades.push([(uncommonBoost / petPrices.uncommon) || 0, `${(pets["★ uncommon"] > 0 && "★ ") || ""}uncommon`]);
    }

    if (petPrices.rare - pets["spider-jockey"] > 0) {
        const rareBoost = ((1 + (rares + 1 + (pets["★ rare"] > 0)) * 0.075 * (1 + epics * 0.02))
            - (1 + rares * 0.075 * (1 + epics * 0.02))) / (1 + rares * 0.075 * (1 + epics * 0.02));

        upgrades.push([(rareBoost / petPrices.rare) || 0, `${(pets["★ rare"] > 0 && "★ ") || ""}rare`]);
    }

    if (petPrices.epic - pets["spider-jockey"] > 0) {
        const epicBoost = (1 + ((1 + uncommons * 0.1 * (1 + 0.02 * (epics + 1 + (pets["★ epic"] > 0))))
            - (1 + uncommons * 0.1 * (1 + 0.02 * epics))) / (1 + uncommons * 0.1 * (1 + 0.02 * epics)))
            * (1 + ((1 + rares * 0.05 * (1 + 0.02 * (epics + 1 + (pets["★ epic"] > 0))))
                - (1 + rares * 0.05 * (1 + 0.02 * epics))) / (1 + rares * 0.05 * (1 + 0.02 * epics))) - 1;

        upgrades.push([(epicBoost / petPrices.epic) || 0, `${(pets["★ epic"] > 0 && "★ ") || ""}epic`]);
    }
    return upgrades.sort((a, b) => b[0] - a[0])[0][1];
}
