const UserDB = require("../../database/controllers/userController");
const { rbrServer } = require("../../config/discordIds.json");
const { token } = require("../../config/emojis.json");

module.exports.name = "claim"
module.exports.description = "Claims token gifts during special events"
module.exports.syntax = "`/claim`"
module.exports.needsAccount = true

module.exports.execute = async function (interaction) {
    const user = await UserDB.getUserById(interaction.member.user.id);

    if (!bot.eventReward) {
        return `There's no event going on right now`;
    }

    if (interaction.channel.guild.id !== rbrServer) {
        return `Gifts can only be claimed in the support server!\n`
            + `https://discord.gg/QmrEbsyKYB`;
    }

    if (bot.eventClaimed.includes(user._id)) {
        return `You already claimed your gift!`;
    }

    user.inventory.tokens += bot.eventReward;
    bot.eventClaimed.push(user._id);

    await user.save();
    return `You claimed your gift of **${bot.eventReward}** ${token}`;
}
