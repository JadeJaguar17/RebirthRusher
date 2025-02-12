/**
 * @typedef {import("../../RebirthRusher.js")} RebirthRusher
 * @typedef {import("eris").CommandInteraction} CommandInteraction
 * @typedef {import("eris").MessageContent} MessageContent 
 */

module.exports.name = "resetstats"
module.exports.description = "Reset your personal best stats"
module.exports.syntax = "`/resetstats`"
module.exports.needsAccount = true

/**
 * Resets a user's personal best stats
 * @param {RebirthRusher} bot instance of RbR base class
 * @param {CommandInteraction} interaction triggering Eris interaction
 * @returns {Promise<MessageContent>} message to display to user
 */
module.exports.execute = async function (bot, interaction) {
    const resetRbDay = interaction.data.options?.[0].value;

    let resetString = "- Rebirths\n- Prestiges";
    if (resetRbDay === "yes") {
        resetString += "\n- Rb/day";
    }

    const confirm = `<@${interaction.member.user.id}> The following personal `
        + `bests will be reset\n${resetString}\nIf you want to proceed, please `
        + `confirm within the next 15s`;

    return {
        content: confirm,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 4,
                        custom_id: `${interaction.member.user.id}-reset-confirm-${resetRbDay}`,
                        label: "Yes, reset my stats",
                        emoji: {
                            name: "⚠️",
                            id: null,
                        }
                    },
                    {
                        type: 2,
                        style: 2,
                        custom_id: `${interaction.member.user.id}-reset-cancel-${resetRbDay}`,
                        label: "Cancel"
                    },
                ]
            }
        ]
    };
}

module.exports.options = [
    {
        name: "rbday",
        description: "Reset rb/day stat as well?",
        type: 3,
        choices: [
            {
                name: "yes",
                value: "yes"
            },
            {
                name: "no",
                value: "no"
            }
        ]
    }
]
