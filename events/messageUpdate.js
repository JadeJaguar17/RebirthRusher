const UserDB = require("../database/controllers/userController");
const fs = require("fs");

module.exports = async (bot, message) => {
    try {
        if (message.author?.id === "518759221098053634") {
            if (message.embeds[0]?.author) {
                const userID = message.embeds[0].author?.icon_url
                    ?.replace("https://cdn.discordapp.com/avatars/", "")
                    .split("/")[0]
                    .trim();

                if (isBanned(userID) || !(await UserDB.checkUserExists(userID))) return;

                const embed = message.embeds[0];

                // pets embed
                if (embed.title === "Pets") {
                    await bot.scanners.get("petScan").execute(embed, userID);

                    const user = await UserDB.getUserById(userID);
                    if (user.settings.autoPet && await bot.users.get(userID)) {
                        const msgData = {
                            member: { user: await bot.users.get(userID) },
                            data: { options: null }
                        };
                        const petEmbed = await bot.commands.get("pets").execute(msgData, userID);

                        petEmbed.embeds[0]
                            .setTitle(null)
                            .setDescription(null)
                            .setThumbnail(null)
                            .setAuthor(null, null);
                        petEmbed.embeds[0].fields = [petEmbed.embeds[0].fields[5]];
                        petEmbed.messageReference = { messageID: message.id };

                        return bot.send(message, petEmbed);
                    }
                }

                // normal /play embed
                else if (
                    message.interaction.name === "play"
                    && !embed.description.startsWith("**Event**")
                    && embed.description.includes("Backpack full")
                ) {
                    const field = embed.fields?.find(f => f.name === "**Stats**");

                    const embedPr = field.value
                        .trim()
                        .split("\n")[0]
                        .replace("**Prestige:**", "")
                        .trim()
                        .replace(/,/g, '');
                    const embedRb = field.value
                        .trim()
                        .split("\n")[1]
                        .replace("**Rebirth:**", "")
                        .trim()
                        .replace(/,/g, '');
                    const embedRbDay = field.value
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
            }
        }

        return;

    } catch (error) {
        await bot.error("MessageUpdate", error, message);
    }
}

function isBanned(userID) {
    const bannedUsers = JSON.parse(fs.readFileSync("./config/bannedUsers.json"));

    return bannedUsers.indexOf(userID) !== -1;
}
