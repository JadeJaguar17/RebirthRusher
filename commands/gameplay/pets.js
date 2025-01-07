const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const UserDB = require("../../database/controllers/userController");
const { backpack, pick, gold, boost, shard } = require("../../config/emojis.json");

const petPrices = {
    common: 10,
    uncommon: 25,
    rare: 50,
    epic: 50,
    mythical: 60,
    legendary: 250,
    "★ uncommon": 25,
    "★ rare": 50,
    "★ epic": 50,
}

const COMMON_BOOST = 0.05;
const UNCOMMON_BOOST = 0.1;
const RARE_BOOST = 0.075;
const EPIC_BOOST = 0.02;

module.exports.name = "pets"
module.exports.description = "Analyzes pet data and calculates some stats"
module.exports.syntax = "`/pets`"
module.exports.aliases = ["p"]
module.exports.needsAccount = true

module.exports.execute = async function (interaction) {
    const user = await UserDB.getUserById(interaction.member.user.id);

    // number of each pet
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

    // event shop Pet Perks boosts
    const petPerkBoost = user.settings.petPerks >= 1
        ? 0.01
        : 0.0;
    const petPerkDiscount = user.settings.petPerks >= 3
        ? 0.9
        : 1.0;

    // base stats
    const bpBoost = commons * COMMON_BOOST;
    const paBoost = uncommons * (UNCOMMON_BOOST + petPerkBoost);
    const sellBoost = rares * RARE_BOOST;
    const epicBoost = 1 + (epics * EPIC_BOOST);
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
        const upgrade = getOptimalUpgrade(user.pets, user.settings.petPerks);
        const price = Math.floor(Math.max((petPrices[upgrade] - user.pets["spider-jockey"]), 0) * petPerkDiscount);

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
    let nextOptimalUpgradeString = "";

    if ((user.settings.petPerks >= 3 && user.pets["spider-jockey"] >= 24) || user.pets["spider-jockey"] >= 25) {
        nextOptimalUpgradeString += "- You have free common and uncommon "
            + "upgrades, so max them to your heart's content!\n";
    }
    else if ((user.settings.petPerks >= 3 && user.pets["spider-jockey"] >= 9) || user.pets["spider-jockey"] >= 10) {
        nextOptimalUpgradeString += "- You have free common upgrades, so "
            + "max them to your heart's content!\n";
    }

    for (rarity of Object.keys(nextOptimalUpgrade)) {
        nextOptimalUpgradeString += `- ${nextOptimalUpgrade[rarity]} ${rarity}\n`;
    }

    if (nextOptimalUpgradeString === "") {
        nextOptimalUpgradeString = "None (you can't afford any. You can do "
            + "\`/pets [shards]\` to calculate )";
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
}

module.exports.options = [
    {
        name: "shards",
        description: "set a custom amount of shards to calculate upgrades",
        type: 4
    }
]

/**
 * Gets the next single optimal upgrade (formulas taken from Wes' spreadsheet)
 * @param {*} pets user's current pets
 * @param {int} petPerks user's event shop Pet Perks level (0-3)
 * @returns {string} Rarity to upgrade (ex: "uncommon")
 */
function getOptimalUpgrade(pets, petPerks) {
    const boosts = [];
    const uncommons = pets.uncommon + 2 * pets["★ uncommon"];
    const rares = pets.rare + 2 * pets["★ rare"];
    const epics = pets.epic + 2 * pets["★ epic"];

    // event shop Pet Perks boosts
    const petPerksBoost = petPerks >= 1
        ? 0.01
        : 0.0;
    const petPerkDiscount = petPerks >= 3
        ? 0.9
        : 1.0;

    // percent increase from upgrading 1 uncommon
    if (Math.floor((petPrices.uncommon - pets["spider-jockey"]) * petPerkDiscount) > 0) {
        const addedBoost = (1 + (uncommons + 1 + (pets["★ uncommon"] > 0)) * (UNCOMMON_BOOST + petPerksBoost) * (1 + epics * EPIC_BOOST));
        const currBoost = (1 + uncommons * (UNCOMMON_BOOST + petPerksBoost) * (1 + epics * EPIC_BOOST));
        const percentIncrease = (addedBoost - currBoost) / currBoost;

        boosts.push([(percentIncrease / petPrices.uncommon) || 0, `${(pets["★ uncommon"] > 0 && "★ ") || ""}uncommon`]);
    }

    // percent increase from upgrading 1 rare
    if (Math.floor((petPrices.rare - pets["spider-jockey"]) * petPerkDiscount) > 0) {
        const addedBoost = (1 + (rares + 1 + (pets["★ rare"] > 0)) * RARE_BOOST * (1 + epics * EPIC_BOOST));
        const currBoost = (1 + rares * RARE_BOOST * (1 + epics * EPIC_BOOST))
        const percentIncrease = (addedBoost - currBoost) / currBoost;

        boosts.push([(percentIncrease / petPrices.rare) || 0, `${(pets["★ rare"] > 0 && "★ ") || ""}rare`]);
    }

    // percent increase from upgrading 1 epic
    if (Math.floor((petPrices.epic - pets["spider-jockey"]) * petPerkDiscount) > 0) {
        const addedUncommonBoost = (1 + uncommons * (UNCOMMON_BOOST + petPerksBoost) * (1 + EPIC_BOOST * (epics + 1 + (pets["★ epic"] > 0))));
        const currUncommonBoost = (1 + uncommons * (UNCOMMON_BOOST + petPerksBoost) * (1 + epics * EPIC_BOOST));
        const uncommonIncrease = 1 + ((addedUncommonBoost - currUncommonBoost) / currUncommonBoost);

        const addedRareBoost = (1 + rares * RARE_BOOST * (1 + EPIC_BOOST * (epics + 1 + (pets["★ epic"] > 0))));
        const currRareBoost = (1 + rares * RARE_BOOST * (1 + epics * EPIC_BOOST));
        const rareIncrease = 1 + ((addedRareBoost - currRareBoost) / currRareBoost);

        const percentIncrease = uncommonIncrease * rareIncrease - 1;
        boosts.push([(percentIncrease / petPrices.epic) || 0, `${(pets["★ epic"] > 0 && "★ ") || ""}epic`]);
    }

    // return upgrade that gave highest percent increase
    return boosts.sort((a, b) => b[0] - a[0])[0][1];
}
