const UserDB = require("../../database/controllers/userController");
const { DEV_ID } = require("../../config/discordIds.json");
const { token } = require("../../config/emojis.json");

module.exports.name = "pay"
module.exports.description = "Pays users tokens\n*(operator only)*"
module.exports.syntax = "`/pay [@user] [tokens]`"
module.exports.needsAccount = true

module.exports.execute = async function (interaction) {
    const payeeID = interaction.data.options[0].value;
    const payerID = interaction.member.user.id;
    const tokens = interaction.data.options[1].value;
    const payee = await UserDB.getUserById(payeeID);
    
    if (!payee) {
        return "User does not have a Rebirth Rusher account!";
    }

    // dev payments
    if (payerID === DEV_ID) {
        payee.inventory.tokens += tokens;
        await payee.save()
        return `<@${payee._id}> received ${tokens} ${token}`;
    }

    // normal payments
    if (tokens < 0) return "You can't give somebody negative tokens!";
    if (payerID === payeeID) return "You can't pay yourself!";

    const payer = await UserDB.getUserById(payerID);
    if (payer.inventory.tokens < tokens) return "You don't have enough tokens to give";

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
