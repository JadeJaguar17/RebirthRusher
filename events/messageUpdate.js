/**
 * @typedef {import("../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message
 * @typedef {import("eris").Embed} Embed
 */

const UserDB = require("../database/controllers/userController");
const fs = require("fs");

/**
 * @param {RebirthRusher} bot RbR Discord client
 * @param {Message} message Message that got updated
 */
module.exports = async (bot, message) => {
    try {
        // ignore if message is not from Idle Miner or message is not an embed
        const embed = message?.embeds?.[0];
        if (message.author?.id !== "518759221098053634") return;
        if (!embed?.author) return;

        // ignore if userID not present or RbR user is banned/doesn't exist
        const userID = getUserID(embed);
        if (!userID) return;
        if (isBanned(userID) || !(await UserDB.checkUserExists(userID))) return;

        // handle /play embed
        const isPlayEmbed =
            message.interaction?.name === "play"
            && !embed.description.startsWith("**Event**")
            && embed.description.includes("Backpack full");
        if (isPlayEmbed) {
            await updateShardCount(embed);
            await updateProfileStats(bot, embed);
        }

        // handle /pets embed (coming from /play)
        if (embed.title === "Pets") {
            await bot.scanners.get("petScan").execute(bot, embed, userID);
        }
    } catch (error) {
        await bot.error("MessageUpdate", error, message);
    }
}

/**
 * Checks if a user is banned
 * @param {string} userID user's Discord snowflake ID
 * @returns Boolean whether user is banned
 */
function isBanned(userID) {
    const bannedUsers = JSON.parse(fs.readFileSync("./config/bannedUsers.json"));

    return bannedUsers.indexOf(userID) !== -1;
}

/**
 * Parses user's ID from a message embed
 * @param {Embed} embed message embed object
 * @returns {string | undefined} user's Discord ID
 */
function getUserID(embed) {
    return embed?.author?.icon_url
        ?.replace("https://cdn.discordapp.com/avatars/", "")
        ?.split("/")[0]
        ?.trim();
}

/**
 * Updates user's shard count
 * @param {Embed} embed message embed object
 * @returns {Promise<boolean>} whether update succeeded or not 
 */
async function updateShardCount(embed) {
    try {
        const userID = getUserID(embed);
        const currencyField = embed.fields?.find(f => f.name === "**Currency**");
        const shardsString = currencyField.value
            .split("\n")[1]
            .split(" ")[1]
            .trim();

        let shards = 0;
        if (shardsString.includes("K")) {
            shards = parseFloat(shardsString) * 1000;
        }
        else {
            shards = Number(shardsString);
        }

        const user = await UserDB.getUserById(userID);
        if (user.pets.shards !== shards) {
            user.pets.shards = shards
            await user.save();
        }
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Updates rb/pr/rbday stats
 * @param {RebirthRusher} bot RbR Discord client
 * @param {Embed} embed message embed object
 */
async function updateProfileStats(bot, embed) {
    const userID = getUserID(embed);

    const statsField = embed.fields?.find(f => f.name === "**Stats**");
    const statsStrings = statsField.value.trim().split("\n");

    await bot.scanners.get("profileScan").execute(
        bot,
        userID,
        parseStat(statsStrings, "**Prestige:**"),
        parseStat(statsStrings, "**Rebirth:**"),
        parseStat(statsStrings, "**AVG rebirths/day**:")
    );
}

/**
 * Finds and parses a stat from a list of stat strings
 * @param {Array<string>} statStrings list of stats strings to parse
 * @param {string} label name of stat to find (including formatting)
 * @returns {number?} parsed number, or 0 if unsuccesful
 */
function parseStat(statStrings, label) {
    const embedStat = statStrings
        .find(ss => ss.startsWith(label))
        .replace(label, "")
        .replace(/,/g, '')
        .trim();

    const numberStat = Number(embedStat);
    if (isNaN(numberStat)) {
        return null;
    }
    return numberStat;
}
