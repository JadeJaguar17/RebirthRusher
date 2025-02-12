/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

const fs = require("fs");
const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const tipsData = require("../../config/tips.json");

module.exports.name = "tips"
module.exports.description = "Community-provided tips and tricks for Idle Miner"
module.exports.syntax = "`/tips [tip]` (*[] = optional*)"

/**
 * Provides community tips and tricka
 * @param {RebirthRusher} bot instance of RbR base class
 * @param {CommandInteraction} interaction triggering Eris interaction
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    const tipName = interaction.data.options?.[0]?.value;

    // create embed structure
    const tipEmbed = new MessageEmbed()
        .setColor(RBR)
        .setAuthor(interaction.member.user.username, interaction.member.user.avatarURL)
        .setTitle("Idle Miner Tips")
        .setThumbnail("https://i.imgur.com/0cv6ipB.png");

    // no tip name provided, display tips menu
    if (!tipName) {
        let tipsMenu = "";
        tipsData.forEach(tip => tipsMenu += `- ${tip.title}\n`);
        tipsMenu += `\nHave a tip you want to share? Send it to [#feedback]`
            + `(https://discord.gg/tEHs8Tbw9p) in our support server and it`
            + ` might get added to the list!`;

        const tipsDescription = `Select a tip from below and insert it into`
            + ` \`/tips [tip]\`\nFor example, if I wanted to see the `
            + `"Token Guide" tip, I would do \`/tips token guide\` (not `
            + `case sensitive)\n`;

        tipEmbed
            .setDescription(tipsDescription)
            .addFields({ name: "Tips", value: tipsMenu });

        return { embeds: [tipEmbed] };
    }

    // display specific tip
    const tip = tipsData.find(t => t.title === tipName);
    let file = undefined;
    if (tip.filename) {
        file = {
            file: fs.readFileSync(`config/tips/${tip.filename}`),
            name: tip.filename
        };
        tipEmbed.setImage(`attachment://${tip.filename}`);
    }
    if (tip.text) {
        tipEmbed.setDescription(tip.text);
    }
    tipEmbed.setFooter(tip.credit);
    tipEmbed.setTitle(tip.title);

    return {
        embeds: [tipEmbed],
        file: file
    };
}

module.exports.options = [
    {
        name: "tip",
        description: "tip to read",
        type: 3,
        choices: getTipChoices(tipsData)
    }
]

/**
 * Converts tips data into Discord slash command options
 * @param {Array<{title: string}>} tips list of tips data
 * @returns {Array<{tip: string, value: string}>}  
 */
function getTipChoices(tips) {
    const choices = [];
    tips.forEach(tip => {
        choices.push({
            name: tip.title,
            value: tip.title
        });
    });
    return choices;
}
