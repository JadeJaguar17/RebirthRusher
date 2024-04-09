const UserDB = require("../../database/controllers/userController");
const { DEV_ID } = require("../../config/discordIds.json");
const { token } = require("../../config/emojis.json");

module.exports.name = "pay"
module.exports.description = "Pays users tokens\n*(operator only)*"
module.exports.syntax = "`/pay [@user] [tokens]`"
module.exports.needsAccount = true

module.exports.execute = async function (interaction) {
    const payeeID = interaction.data.options[0].value;
    const tokens = interaction.data.options[1].value;

    if (tokens < 0 && interaction.member.user.id !== DEV_ID) {
        return "You can't give somebody negative tokens!";
    }

    const payer = await UserDB.getUserById(interaction.member.user.id);
    const payee = await UserDB.getUserById(payeeID);

    if (!payee) {
        return "I cannot find the person you want to give tokens to. Make "
            + "sure they have an account first!";
    }

    if (payer._id === DEV_ID) {
        payer.inventory.tokens += tokens;
    } else if (payer._id === payee._id) {
        return "You can't pay yourself!";
    }

    if (payer.inventory.tokens < tokens) {
        return "You don't have enough tokens to give";
    }

    payer.inventory.tokens -= tokens;
    payee.inventory.tokens += tokens;

    await payer.save();
    await payee.save();

    return `You succesfully gave ${tokens} ${token} to <@${payee._id}>`;
}

module.exports.options = [
    {
        name: "user",
        description: "user to give your tokens to",
        type: 6,
        required: true
    },
    {
        name: "tokens",
        description: "amount of tokens to pay",
        type: 4,
        required: true
    }
]
