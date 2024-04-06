const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const UserDB = require("../../database/controllers/userController");
const { off, on } = require("../../config/emojis.json");

module.exports.name = "reminders"
module.exports.description = "Displays settings for cooldown reminders"
module.exports.syntax = "`/reminders`"
module.exports.aliases = ["r"]
module.exports.needsAccount = true

module.exports.execute = async function (interaction) {
    const user = await UserDB.getUserById(interaction.member.user.id);

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
}

module.exports.options = []

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
