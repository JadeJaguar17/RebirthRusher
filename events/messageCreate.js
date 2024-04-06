// const users = require("../models/userModel.js");
// const {RBR} = require("../config/embedColors.json");
// const MessageEmbed = require("../system/MessageEmbed");
// const fs = require("fs");

module.exports = require("../events/messageUpdate"); //async (bot, message) => {
    // try {
    //     if (message.author.bot) {
    //         if (message.author.id === "518759221098053634") {
    //             // embed responses
    //             if (message.embeds[0]?.author) {
    //                 const userID = message.embeds[0].author?.icon_url?.replace("https://cdn.discordapp.com/avatars/", "")
    //                               .split("/")[0].trim();

    //                 if (isBanned(userID) || !(await users.exists({_id: userID}))) return;

    //                 const embed = message.embeds[0];

    //                 if (embed.title === "Pets") {
    //                     await bot.scanners.get("petScan").execute(embed, userID);

    //                     const user = await UserDB.getUserById(userID);
    //                     if (user.settings.autoPet) {
    //                         const petEmbed = await bot.commands.get("pets").execute({
    //                             member: {user: await bot.users.get(userID)},
    //                             data: {options: null}
    //                         }, userID);
    //                         petEmbed.messageReference = {messageID: message.id};
                            
    //                         return bot.send(message, petEmbed);
    //                     }
    //                 } else if (embed.fields?.[0]?.name === "**General**") {
    //                     return await bot.scanners.get("profileScan").execute(message.embeds[0], userID);
    //                 } else if (embed.title === "Claimall" && embed.description) {
    //                     return await bot.scanners.get("claimall").execute(message, userID);
    //                 } else if (embed.title === "Cooldowns") {
    //                     return await bot.scanners.get("kits").execute(message, userID);
    //                 } else if (embed.title === "Fish") {
    //                     return await bot.timers.get("fish").execute(message, userID);
    //                 } else if (embed.title === "Hunt") {
    //                     return await bot.timers.get("hunt").execute(message, userID);
    //                 } else if (embed.title === "Farm") {
    //                     let time;
    //                     message.embeds[0].description.split("\n").forEach(line => {
    //                         if (line.startsWith("Next crop ready")) {
    //                             time = bot.stringToTime(line.split(" ")[4]);
    //                         }
    //                     });

    //                     if (!time) {
    //                         return;
    //                     }

    //                     // Add an extra minute since times > 1hr don't show seconds
    //                     if (time >= 3600) {
    //                         time += 60
    //                     }

    //                     return await bot.timers.get("harvest").execute(message, userID, time);
    //                 } else if (embed.title?.startsWith("Earthquake broke")) {
    //                     return await bot.timers.get("earthquake").execute(message, userID);
    //                 } else if (embed.description?.startsWith("You used the following booster")) {
    //                     for (const field of embed.fields) {
    //                         if (field.name === "**Personal**") {
    //                             const activeBoosters = embed.fields[0].value.split("\n");

    //                             for (const activeBooster of activeBoosters) {
    //                                 if (activeBooster.startsWith("<:")) {
    //                                     const boosterID = activeBooster.split(" ")[0].trim();
    //                                     const boosterTime = bot.stringToTime(activeBooster.split(" ")[3].trim());

    //                                     if (boosterTime < 86400) { // 24 hours
    //                                         await bot.timers.get("booster").execute(message, userID, boosterID, boosterTime);
    //                                     }
    //                                 }
    //                             }

    //                             return;
    //                         }
    //                     }
    //                 } else if (embed.fields?.[0]?.name === "**Backpack**") {
    //                     return await bot.timers.get("backpack").execute(message, userID);
    //                 } else if (embed.title?.startsWith("You are now prestige")) {
    //                     return await bot.timers.get("prestige").execute(message, userID);
    //                 }
    //             }

    //             if (message.content?.startsWith("**")) {
    //                 const tag = message.content.split("**")[1];
    //                 const user = await bot.users.find(u => `${u.username}#${u.discriminator}` === tag);

    //                 if (user) {
    //                     if (isBanned(user.id) || !(await users.exists({_id: user.id}))) return;

    //                     if (message.content.includes("You didn't get any pet")) {
    //                         return await bot.timers.get("hunt").execute(message, user.id);
    //                     } else if (message.content.includes("Activated Wings")) {
    //                         return await bot.timers.get("wings").execute(message, user.id);
    //                     } else if (message.content.includes("Activated Rage")) {
    //                         return await bot.timers.get("rage").execute(message, user.id);
    //                     } else if (message.content.includes("You claimed your")) {
    //                         const kit = await bot.timers.get(message.content.split("**")[3].toLowerCase());

    //                         return kit && await kit.execute(message, user.id);
    //                     } else if (message.content.includes("Your next crop will be ready in")) {
    //                         const time = bot.stringToTime(message.content.split("\n")[1].split(" ")[7]);

    //                         return await bot.timers.get("harvest").execute(message, user.id, time);
    //                     } else if (message.content.includes("Used bonemeal on:")) {
    //                         return await bot.timers.get("bonemeal").execute(message, user.id);
    //                     }
    //                 }
    //             }

    //             // slash commands
    //             if (message.interaction && ["clear"].includes(message.interaction.name)
    //                 && (await users.exists({_id: message.interaction.member.user.id}))) {
    //                 const imCommand = await bot.timers.get(message.interaction.name);

    //                 if (imCommand) {
    //                     return await imCommand.execute(message, message.interaction.member.user.id);
    //                 }
    //             }
    //         }
    //         return;

    //     // User messages
    //     } else {
    //         if (isBanned(message.author.id) || !message.channel.guild) {
    //             return;
    //         }

    //         const user = await UserDB.getUserById(message.author.id);
    //         const server = await servers.findById(message.channel.guild.id) || {prefix: "r.", imPrefix: ";"};

    //         // If the bot gets pinged
    //         if (message.content.trim() === `<@${bot.user.id}>` || message.content.trim() === `<@!${bot.user.id}>`) {
    //             const mentionEmbed = new MessageEmbed()
    //             .setColor(RBR)
    //             .setAuthor(bot.user.username, bot.user.avatarURL)
    //             .setThumbnail(bot.user.avatarURL)
    //             .setDescription(`Hello there! I'm Rebirth Rusher, but you can just call me RbR. My purpose is to help players be better at IM, regardless of their prestige level. You can use \`/help\` for a list of all my commands and \`/guide\` will give you a detailed guide on how to use me. If this is your first time using me, you will have to use \`/start\` to make an account. Enjoy!`);
                
    //             return bot.send(message, {embed: mentionEmbed});
                
    //         // Attempting to use RbR commands
    //         } else if (message.content.toLowerCase().startsWith(server.prefix.toLowerCase())) {
    //             const args = message.content.slice(server.prefix.length).trim().split(/ +/);
    //             const commandName = args.shift().toLowerCase();

    //             const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    //             if (command) {
    //                 return bot.send(message, `Please use \`/${command.name}\` instead. All commands are now only `
    //                                         +`available as slash commands. If slash commands aren't showing up, re-invite`
    //                                         +` me using the big blue "Add to Server" button under my profile.`
    //                                         +`\n\n*Bots can no longer see message content due to changes in Discord's `
    //                                         +`privacy policy. As a result, prefix commands no longer work, so slash `
    //                                         +`commands are the only way*).`);
    //             }
    //         }
    //     }
    // } catch (error) {
    //     await bot.error("MessageCreate", error, message);
    // }
// }

// function isBanned(userID) {
//     const bannedUsers = JSON.parse(fs.readFileSync("./config/bannedUsers.json"));

//     return bannedUsers.indexOf(userID) !== -1;
// }
