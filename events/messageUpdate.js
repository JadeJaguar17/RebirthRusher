const Eris = require("eris");
const RebirthRusher = require("../system/RebirthRusher");
const UserDB = require("../database/controllers/userController");
const fs = require("fs");

/**
 * @param {RebirthRusher} bot base class of RbR
 * @param {Eris.Message} message Message that got updated
 */
module.exports = async (bot, message) => {
    try {
        // ignore if message is not from Idle Miner or message is not an embed
        if (message.author?.id !== "518759221098053634") return;
        if (!message.embeds[0]?.author) return;

        // parse user ID from the embed author's avatar
        const userID = message.embeds[0].author?.icon_url
            ?.replace("https://cdn.discordapp.com/avatars/", "")
            .split("/")[0]
            .trim();

        // ignore if user is banned or isn't an RbR user
        if (isBanned(userID) || !(await UserDB.checkUserExists(userID))) return;

        const embed = message.embeds[0];

        // pets embed
        if (embed.title === "Pets") {
            await bot.scanners.get("petScan").execute(embed, userID);
        }

        // normal /play embed
        if (
            message.interaction?.name === "play"
            && !embed.description.startsWith("**Event**")
            && embed.description.includes("Backpack full")
        ) {
            // update shard count from /play
            try {
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
            } catch (e) { /* do nothing */ }

            // handle profile states
            const statsField = embed.fields?.find(f => f.name === "**Stats**");

            const embedPr = statsField.value
                .trim()
                .split("\n")[0]
                .replace("**Prestige:**", "")
                .trim()
                .replace(/,/g, '');
            const embedRb = statsField.value
                .trim()
                .split("\n")[1]
                .replace("**Rebirth:**", "")
                .trim()
                .replace(/,/g, '');
            const embedRbDay = statsField.value
                .trim()
                .split("\n")[2]
                .replace("**AVG rebirths/day**:", "")
                .trim()
                .replace(/,/g, '');

            return await bot.scanners.get("profileScan").execute(
                userID,
                Number(embedPr),
                Number(embedRb),
                Number(embedRbDay)
            );
        }

        return;
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
