const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");
const links = require("../../config/links.json");
const fs = require("fs");
const { DEV_ID } = require("../../config/discordIds.json");

module.exports.name = "help"
module.exports.description = "Displays either a list of commands or gives more info on a specific command"
module.exports.syntax = "`/help [command]` (*[] = optional*)"
module.exports.aliases = ["h"]

module.exports.execute = async function (interaction) {
    const inputCommand = interaction.data.options?.[0]?.value.toLowerCase();

    const helpEmbed = new MessageEmbed()
        .setColor(RBR)
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setThumbnail("https://i.imgur.com/0sHQBWA.png");

    // just '/help' provides the whole list
    if (!inputCommand) {
        const helpDescription = `Hello! Here are a list of available `
            + `commands you can use.\n`
            + `For more information on a specific command, do `
            + `\`/help [command]\`n`
            + `For a guide on how to use the bot, do \`/guide\``;

        helpEmbed
            .setTitle(`Commands`)
            .setDescription(helpDescription);

        // go through each category (except 'dev') and add to help embed
        ["Startup", "Gameplay", "Economy", "Links", "Utility"].forEach(name => {
            const files = fs.readdirSync(`./commands/${name.toLowerCase()}`);
            let commands = "";
            files.forEach(file => {
                commands += `\`${file.replace(".js", "")}\`,`;
            });

            helpEmbed.addFields({
                name: name,
                value: commands.substring(0, commands.length - 1)
            });
        });

        // buttons for the different links on the bottom of the embed
        const linkButtons = [{
            type: 1,
            components: [
                {
                    type: 2,
                    style: 5,
                    label: "Server",
                    url: links.server
                },
                {
                    type: 2,
                    style: 5,
                    label: "Invite",
                    url: links.invite
                },
                {
                    type: 2,
                    style: 5,
                    label: "Donate",
                    url: links.patreon
                },
                {
                    type: 2,
                    style: 5,
                    label: "Vote",
                    url: links.vote
                }
            ]
        }];

        return {
            embeds: [helpEmbed],
            components: linkButtons
        };
    }

    // getting help for a specific command
    else {
        const command = bot.commands.get(inputCommand);

        if (!command || (command.hidden && interaction.member.user.id !== DEV_ID)) {
            return `That's not a valid command!`;
        }

        helpEmbed
            .setTitle(`Help | ${capitalize(command.name)}`)
            .setDescription(command.description)
            .addFields(
                { name: "Syntax", value: command.syntax }
            );

        return { embeds: [helpEmbed] };
    }
}

module.exports.options = [
    {
        name: "command",
        description: "name of command",
        type: 3
    }
]


// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
