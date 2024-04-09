const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const tipsData = require("../../config/tips.json");

const choices = [];
tipsData.forEach(tip => {
    choices.push({
        name: tip.name,
        value: tip.name
    });
});

module.exports.name = "tips"
module.exports.description = "Community-provided tips and tricks for Idle Miner"
module.exports.syntax = "`/tips [tip]` (*[] = optional*)"

module.exports.execute = async function (interaction) {
    const tipName = interaction.data.options?.[0]?.value;

    const tipEmbed = new MessageEmbed()
        .setColor(RBR)
        .setAuthor(interaction.member.user.username, interaction.member.user.avatarURL)
        .setTitle("Idle Miner Tips")
        .setThumbnail("https://i.imgur.com/0cv6ipB.png");

    if (!tipName) {
        let tipsMenu = "";
        tipsData.forEach(tip => tipsMenu += `- ${tip.name}\n`);
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

    const tip = tipsData.find(t => t.name === tipName);

    if (tip.link) {
        tipEmbed
            .setImage(tip.link);
    } else if (tip.body) {
        tipEmbed
            .setDescription(tip.body);
    }

    tipEmbed.setFooter(`From: ${tip.author}`);

    return { embeds: [tipEmbed] };
}

module.exports.options = [
    {
        name: "tip",
        description: "tip to read",
        type: 3,
        choices: choices
    }
]
