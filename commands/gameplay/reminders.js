const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const users = require("../../models/userModel.js");
const { off, on } = require("../../config/emojis.json");

module.exports = {
    name: "reminders",
    description: "Displays settings for cooldown reminders",
    syntax: "`/reminders`",
    aliases: ["r"],
    needsAccount: true,
    execute: async function (interaction) {
        const user = await users.findById(interaction.member.user.id);

        // inital embed build for the reminders list
        const setEmbed = new MessageEmbed()
            .setColor(RBR)
            .setAuthor(interaction.member.user.username, interaction.member.user.avatarURL)
            .setThumbnail("https://i.imgur.com/Lmc0Jzo.png")
            .setTitle("Reminders")
            .setDescription(`To change your reminder settings, use \`/set reminders\``);

        // go through each timer category and display accordingly
        for (const category of Object.keys(user.timers)) {
            if (category == "$init") {
                continue;
            }

            let settings = "";
            for (const timer of Object.keys(user.timers[category])) {
                if (timer == "$init") {
                    continue;
                }

                if (user.timers[category][timer] === "off") {
                    settings += `${off} ${timer}\n`;
                } else {
                    settings += `${on} ${timer}\n`;
                }
            }

            setEmbed.addFields({
                name: `**${capitalize(category)}**`,
                value: settings
            });
        }

        // add final settings
        const settings = `huntcd: \`${user.settings.huntcd}\` *set your hunt `
            + `cooldown here*\n`
            + `boostercd: \`${user.settings.boostercd}s\` *get pinged when there's`
            + ` ${user.settings.boostercd}s left for a booster*\n`
            + `pKit: \`${user.settings.pkit}\` set your prestige kit level here`

        setEmbed.addFields({
            name: "**Settings**",
            value: settings
        });

        return { embeds: [setEmbed] };
    },
    options: []
}

function isTimer(user, settingName) {
    let timerExists = false;
    ["kits", "games", "abilities", "boosters"].forEach(category => {
        if (user.timers[category][settingName]) {
            timerExists = true;
        }
    });
    return timerExists;
}

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
