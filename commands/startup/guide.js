const MessageEmbed = require("../../system/MessageEmbed");
const { RBR } = require("../../config/embedColors.json");

module.exports.name = "guide"
module.exports.description = "Gives a guide on how to use the bot"
module.exports.syntax = "`/guide [page]` (*[] = optional*)"

module.exports.execute = async function (interaction, pageNum = 1) {
    const guideEmbed = new MessageEmbed()
        .setColor(RBR)
        .setAuthor(bot.user.username, bot.user.avatarURL)
        .setThumbnail("https://i.imgur.com/mXwagpH.png")
        .setTitle("Guide")
        .setDescription("Use buttons to change the page");

    const gettingStarted = "To create a new Rebirth Rusher account, use "
        + "`/start`. After creating your account, you should immediately "
        + "check your Idle Miner `/profile`. That way, RbR can see your "
        + "initial stats and begin tracking your progress!\n\n"
        + "Note: make sure you don't have a default avatar. RbR uses your "
        + "avatar to track your Idle Miner data, and default avatars screw "
        + "with the system. If you have a default avatar, certain features "
        + "such as timers, `/graph`, and `/pets` won't work properly.";

    const graph = "One of the main things that Rebirth Rusher does is track"
        + " and graph the number of rebirths/prestiges you do per day as "
        + "well as your rb/day rate. If you're new to the bot, you might "
        + "have an empty graph because RbR can't see any progress you've "
        + "done *before* making your account. No worries, just check your "
        + "profile again when you've done some rebirths and you'll see them"
        + " on your graph! It's important to check your Idle Miner profile "
        + "so RbR has some initial stats to base its calculations on. "
        + "Everytime you want to update your graph, just check your Idle "
        + "Miner profile again. It's a good idea to always check your Idle "
        + "Miner profile before doing `/graph` so it can be as accurate as "
        + "possible. You can adjust your graph settings with `/set graph`.";

    const pets = "Pets are a very big deal in Idle Miner. They last the "
        + "whole prestige and shards are relatively easy to obtain. "
        + "However, just like how the right pet upgrades can speed up your "
        + "progress, having bad pet upgrades will slow you down. Based on "
        + "your pet data, Rebirth Rusher can make calculations and make "
        + "recommendations for which pet upgrades are the most optimal."
        + " Along with other information, these recommendations can be "
        + "found in `/pets`. To update your `/pets`, check your Idle Miner "
        + "pets first and Rebirth Rusher will recalculate everything.";

    const reminders = "Rebirth Rusher boasts a wide range of reminders "
        + "where the bot will ping you when certain cooldowns are up, such "
        + "as hunt being ready, a crate can be claimed, your backpack is "
        + "full, and even when a personal booster is about to expire! Every"
        + " reminder is listed in `/set`, where you can fully customize "
        + "which reminders are *on* or *off* using `/set reminder`.";

    const tokens = "Your `/tokens` can be obtained from either `/vote`ing "
        + "or `/donate`ing. You can spend them in the `/shop` for very "
        + "~~lame~~ fun stuff! The main thing to buy are colors that you "
        + "can use to customize your graph. You can either buy standard "
        + "colors or pay extra for a custom color. If you want to see what "
        + "a color looks like on your graph before buying it, you can use "
        + "`/preview`. If you have a lot of tokens, you can use `/pay` to "
        + "gift other users some tokens!";

    switch (pageNum) {
        case 1:
            guideEmbed.addFields(
                {
                    name: "Getting Started",
                    value: gettingStarted
                },

                {
                    name: "Graphs",
                    value: graph
                }
            );
            break;
        case 2:
            guideEmbed.addFields(
                {
                    name: "Pets",
                    value: pets
                },

                {
                    name: "Reminders",
                    value: reminders
                },

                {
                    name: "Tokens",
                    value: tokens
                }
            );
            break;
        default:
            return "Please enter a valid page number";
    }

    return {
        embeds: [guideEmbed],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 4,
                        label: "Page 1",
                        custom_id: `${interaction.member.user.id}-guide-1`,
                        disabled: pageNum === 1
                    },
                    {
                        type: 2,
                        style: 4,
                        label: "Page 2",
                        custom_id: `${interaction.member.user.id}-guide-2`,
                        disabled: pageNum === 2
                    },
                    // {
                    //     type: 2,
                    //     style: 4,
                    //     label: "Page 3",
                    //     custom_id: `${interaction.member.user.id}-guide-3`,
                    //     disabled: pageNum === 3
                    // },
                ]
            }
        ]
    };
}
