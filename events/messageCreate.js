/**
 * @typedef {import("../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").Message} Message
 */

const UserDB = require("../database/controllers/userController");
const fs = require("fs");

/**
 * @param {RebirthRusher} bot base class of RbR
 * @param {Message} message Message that got updated
 */
module.exports = async (bot, message) => {
    try {
        // ignore if message is not from Idle Miner
        if (message.author?.id !== "518759221098053634") return;

        // embed responses
        if (message.embeds[0]?.author) {
            return await handleEmbedMessage(bot, message);
        }

        // normal text messages
        if (message.content?.startsWith("**")) {
            return await handleTextMessage(bot, message);
        }

        // 'clear' and 'bonemeal' slash commands reset harvest timer
        if (message.interaction && ["clear", "bonemeal"].includes(message.interaction.name)
            && (await UserDB.checkUserExists(message.interaction.member.user.id))) {
            const imCommand = await bot.timers.get(message.interaction.name);

            if (imCommand) {
                return await imCommand.execute(bot, message.interaction.member.user.id);
            }
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

/**
 * Handles message embeds from Idle Miner
 * @param {RebirthRusher} bot base class of RbR
 * @param {Message} message message containing the embed to process
 * @returns an awaitable RbR action
 */
async function handleEmbedMessage(bot, message) {
    const embed = message.embeds[0];
    const userID = embed.author?.icon_url
        ?.replace("https://cdn.discordapp.com/avatars/", "")
        .split("/")[0]
        .trim();

    if (isBanned(userID) || !(await UserDB.checkUserExists(userID))) return;

    // pet embed
    if (embed.title === "Pets") {
        await bot.scanners.get("petScan").execute(bot, embed, userID);

        // autopet feature
        const user = await UserDB.getUserById(userID);
        if (user.settings.autoPet && await bot.users.get(userID)) {
            const msgData = {
                member: { user: await bot.users.get(userID) },
                data: { options: null }
            };
            const petEmbed = await bot.commands.get("pets").execute(bot, msgData, userID);

            petEmbed.messageReference = { messageID: message.id };

            return bot.send(message, petEmbed);
        }
    }

    // profile stats
    else if (embed.fields?.[0]?.name === "**General**") {
        const embedPr = embed.fields[0].value
            .trim()
            .split("\n")[3]
            .replace("**Prestige:**", "")
            .trim()
            .replace(/,/g, '');
        const embedRb = embed.fields[1].value
            .trim()
            .split("\n")[1]
            .replace("**Rebirth:**", "")
            .trim()
            .replace(/,/g, '');
        const embedRbDay = embed.fields[1].value.trim().split("\n")[5]
            ? embed.fields[1].value
                .trim()
                .split("\n")[4]
                .replace("**Rebirths/day:** ", "")
                .trim()
                .replace(/,/g, '')
            : embed.fields[1].value
                .trim()
                .split("\n")[3]
                .replace("**Rebirths/day:** ", "")
                .trim()
                .replace(/,/g, '') || 0;

        return await bot.scanners.get("profileScan").execute(bot,
            userID,
            Number(embedPr),
            Number(embedRb),
            Number(embedRbDay)
        );
    }

    // claimall resets timers for claimed kits
    else if (embed.title === "Claimall" && embed.description) {
        return await bot.scanners.get("claimall").execute(bot, message, userID);
    }

    // cooldowns sets any missing timers
    else if (embed.title === "Cooldowns") {
        return await bot.scanners.get("kits").execute(bot, message, userID);
    }

    // Idle Miner games and abilities
    else if (embed.title === "Fish") {
        return await bot.timers.get("fish").execute(bot, message, userID);
    }
    else if (embed.title === "Hunt") {
        return await bot.timers.get("hunt").execute(bot, message, userID);
    }
    else if (embed.title === "Farm") {
        let time;
        message.embeds[0].description.split("\n").forEach(line => {
            if (line.startsWith("Next crop ready")) {
                time = bot.stringToTime(line.split(" ")[4]);
            }
        });

        if (!time) {
            return;
        }

        // Add an extra minute since times > 1hr don't show seconds
        if (time >= 3600) {
            time += 60
        }

        return await bot.timers.get("harvest").execute(bot, message, userID, time);
    }
    else if (embed.title?.startsWith("Earthquake broke")) {
        return await bot.timers.get("earthquake").execute(bot, message, userID);
    }

    // booster timers
    else if (embed.description?.startsWith("You used the following booster")) {
        for (const field of embed.fields) {
            if (field.name === "**Personal**") {
                const activeBoosters = embed.fields[0].value.split("\n");

                for (const activeBooster of activeBoosters) {
                    if (activeBooster.startsWith("<:")) {
                        const boosterID = activeBooster.split(" ")[0].trim();
                        const boosterTime = bot.stringToTime(
                            activeBooster
                                .split(" ")[3]
                                .trim()
                        );

                        if (boosterTime < 86400) { // 24 hours
                            await bot.timers.get("booster").execute(bot,
                                message,
                                userID,
                                boosterID,
                                boosterTime
                            );
                        }
                    }
                }

                return;
            }
        }
    }

    // backpack timer
    else if (embed.fields?.[0]?.name === "**Storage**") {
        const remainingTime = bot.stringToTime(message.embeds[0].fields[0].value.split("\n")[4].replace("Full in ", ""));

        if (remainingTime) return await bot.timers.get("backpack").execute(bot, message, userID, remainingTime);
    }

    // prestiging resets timers
    else if (embed.title?.startsWith("You are now prestige")) {
        return await bot.timers.get("prestige").execute(bot, userID);
    }

    // /play for the first time
    else if (embed.fields?.[2]?.name === "**Stats**") {
        const embedPr = embed.fields[2].value
            .trim()
            .split("\n")[0]
            .replace("**Prestige:**", "")
            .trim()
            .replace(/,/g, '');
        const embedRb = embed.fields[2].value
            .trim()
            .split("\n")[1]
            .replace("**Rebirth:**", "")
            .trim()
            .replace(/,/g, '');
        const embedRbDay = embed.fields[2].value
            .trim()
            .split("\n")[2]
            .replace("**AVG rebirths/day**:", "")
            .trim()
            .replace(/,/g, '');

        return await bot.scanners.get("profileScan").execute(bot,
            userID,
            Number(embedPr),
            Number(embedRb),
            Number(embedRbDay)
        );
    }
}

/**
 * Handles text messages from Idle Miner
 * @param {RebirthRusher} bot base class of RbR
 * @param {Message} message text message to process
 * @returns an awaitable RbR action
 */
async function handleTextMessage(bot, message) {
    const username = message.content.split("**")[1];
    const user = await bot.users.find(u => u.username === username);

    if (user && !isBanned(user.id) && await UserDB.checkUserExists(user.id)) {
        if (message.content.includes("You didn't get any pet")) {
            return await bot.timers.get("hunt").execute(bot, message, user.id);
        }
        else if (message.content.includes("Activated Wings")) {
            return await bot.timers.get("wings").execute(bot, message, user.id);
        }
        else if (message.content.includes("Activated Rage")) {
            return await bot.timers.get("rage").execute(bot, message, user.id);
        }
        else if (message.content.includes("You claimed your")) {
            const kit = await bot.timers.get(message.content.split("**")[3].toLowerCase());

            return kit && await kit.execute(bot, message, user.id);
        }
        else if (message.content.includes("Your next crop will be ready in")) {
            const time = bot.stringToTime(message.content.split("\n")[1].split(" ")[7]);

            return await bot.timers.get("harvest").execute(bot, message, user.id, time);
        }

        // backpack timer based on the 'BP' stat in messages
        const lines = message.content.split("\n");
        if (lines[lines.length - 1].startsWith("BP:")) {
            const time = bot.stringToTime(lines[lines.length - 1].replace("BP:", ""));

            if (time) return await bot.timers.get("backpack").execute(bot, message, user.id, time);
        }
    }
}
