const UserDB = require("../database/controllers/userController");
const fs = require("fs");

module.exports = async (bot, message) => {
    try {
        if (message.author?.bot) {
            if (message.author.id === "518759221098053634") {
                // embed responses
                if (message.embeds[0]?.author) {
                    const userID = message.embeds[0].author?.icon_url?.replace("https://cdn.discordapp.com/avatars/", "")
                        .split("/")[0].trim();

                    if (isBanned(userID) || !(await UserDB.checkUserExists(userID))) return;

                    const embed = message.embeds[0];

                    // pet embed
                    if (embed.title === "Pets") {
                        await bot.scanners.get("petScan").execute(embed, userID);

                        // autopet feature
                        const user = await UserDB.getUserById(userID);
                        if (user.settings.autoPet && await bot.users.get(userID)) {
                            const petEmbed = await bot.commands.get("pets").execute({
                                member: { user: await bot.users.get(userID) },
                                data: { options: null }
                            }, userID);

                            petEmbed.messageReference = { messageID: message.id };

                            return bot.send(message, petEmbed);
                        }
                    }

                    // profile stats
                    else if (embed.fields?.[0]?.name === "**General**") {
                        const embedPr = Number(embed.fields[0].value.trim().split("\n")[3].replace("**Prestige:**", "").trim().replace(/,/g, ''));
                        const embedRb = Number(embed.fields[1].value.trim().split("\n")[1].replace("**Rebirth:**", "").trim().replace(/,/g, ''));
                        const embedRbDay = embed.fields[1].value.trim().split("\n")[4]
                            ? Number(embed.fields[1].value.trim().split("\n")[4].replace("**Rebirths/day:** ", "").trim().replace(/,/g, ''))
                            : Number(embed.fields[1].value.trim().split("\n")[3].replace("**Rebirths/day:** ", "").trim().replace(/,/g, '')) || 0;

                        return await bot.scanners.get("profileScan").execute(userID, embedPr, embedRb, embedRbDay);
                    }

                    // claimall resets timers for claimed kits
                    else if (embed.title === "Claimall" && embed.description) {
                        return await bot.scanners.get("claimall").execute(message, userID);
                    }

                    // cooldowns sets any missing timers
                    else if (embed.title === "Cooldowns") {
                        return await bot.scanners.get("kits").execute(message, userID);
                    }

                    // Idle Miner games and abilities
                    else if (embed.title === "Fish") {
                        return await bot.timers.get("fish").execute(message, userID);
                    }
                    else if (embed.title === "Hunt") {
                        return await bot.timers.get("hunt").execute(message, userID);
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

                        return await bot.timers.get("harvest").execute(message, userID, time);
                    }
                    else if (embed.title?.startsWith("Earthquake broke")) {
                        return await bot.timers.get("earthquake").execute(message, userID);
                    }

                    // booster timers
                    else if (embed.description?.startsWith("You used the following booster")) {
                        for (const field of embed.fields) {
                            if (field.name === "**Personal**") {
                                const activeBoosters = embed.fields[0].value.split("\n");

                                for (const activeBooster of activeBoosters) {
                                    if (activeBooster.startsWith("<:")) {
                                        const boosterID = activeBooster.split(" ")[0].trim();
                                        const boosterTime = bot.stringToTime(activeBooster.split(" ")[3].trim());

                                        if (boosterTime < 86400) { // 24 hours
                                            await bot.timers.get("booster").execute(message, userID, boosterID, boosterTime);
                                        }
                                    }
                                }

                                return;
                            }
                        }
                    }

                    // backpack timer
                    else if (embed.fields?.[0]?.name === "**Backpack**") {
                        const remainingTime = bot.stringToTime(message.embeds[0].fields[0].value.split("\n")[4].replace("Full in ", ""));

                        if (remainingTime) return await bot.timers.get("backpack").execute(message, userID, remainingTime);
                    }

                    // prestiging resets timers
                    else if (embed.title?.startsWith("You are now prestige")) {
                        return await bot.timers.get("prestige").execute(userID);
                    }

                    // /play for the first time
                    else if (embed.fields?.[2]?.name === "**Stats**") {
                        const embedPr = Number(embed.fields[2].value.trim().split("\n")[0].replace("**Prestige:**", "").trim().replace(/,/g, ''));
                        const embedRb = Number(embed.fields[2].value.trim().split("\n")[1].replace("**Rebirth:**", "").trim().replace(/,/g, ''));
                        const embedRbDay = Number(embed.fields[2].value.trim().split("\n")[2].replace("**AVG rebirths/day**:", "").trim().replace(/,/g, ''));

                        return await bot.scanners.get("profileScan").execute(userID, embedPr, embedRb, embedRbDay);
                    }
                }

                // normal text messages
                if (message.content?.startsWith("**")) {
                    const username = message.content.split("**")[1];
                    const user = await bot.users.find(u => u.username === username);

                    if (user && !isBanned(user.id) && await UserDB.checkUserExists(user.id)) {
                        if (message.content.includes("You didn't get any pet")) {
                            return await bot.timers.get("hunt").execute(message, user.id);
                        }
                        else if (message.content.includes("Activated Wings")) {
                            return await bot.timers.get("wings").execute(message, user.id);
                        }
                        else if (message.content.includes("Activated Rage")) {
                            return await bot.timers.get("rage").execute(message, user.id);
                        }
                        else if (message.content.includes("You claimed your")) {
                            const kit = await bot.timers.get(message.content.split("**")[3].toLowerCase());

                            return kit && await kit.execute(message, user.id);
                        }
                        else if (message.content.includes("Your next crop will be ready in")) {
                            const time = bot.stringToTime(message.content.split("\n")[1].split(" ")[7]);

                            return await bot.timers.get("harvest").execute(message, user.id, time);
                        }

                        // backpack timer based on the 'BP' stat in messages
                        const lines = message.content.split("\n");
                        if (lines[lines.length - 1].startsWith("BP:")) {
                            const time = bot.stringToTime(lines[lines.length - 1].replace("BP:", ""));

                            if (time) return await bot.timers.get("backpack").execute(message, user.id, time);
                        }
                    }
                }

                // clear command
                if (message.interaction && ["clear", "bonemeal"].includes(message.interaction.name)
                    && (await UserDB.checkUserExists(message.interaction.member.user.id))) {
                    const imCommand = await bot.timers.get(message.interaction.name);

                    if (imCommand) {
                        return await imCommand.execute(message.interaction.member.user.id);
                    }
                }
            }
            return;
        }
    } catch (error) {
        await bot.error("MessageUpdate", error, message);
    }
}

function isBanned(userID) {
    const bannedUsers = JSON.parse(fs.readFileSync("./config/bannedUsers.json"));

    return bannedUsers.indexOf(userID) !== -1;
}
