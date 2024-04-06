module.exports = {
    name: "resetstats",
    description: "Reset your personal best stats",
    syntax: "`/resetstats`",
    needsAccount: true,
    execute: async function (interaction) {
        const confirm = `<@${interaction.member.user.id}> are you sure you want`
            + ` to reset your personal best stats? These are the 3 stats listed`
            + ` under the "Highest stats for one day" section in your graph. If`
            + ` so, please confirm within the next 15s`;

        return {
            content: confirm,
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            style: 4,
                            custom_id: `${interaction.member.user.id}-reset-confirm`,
                            label: "Yes, reset my stats",
                            emoji: {
                                name: "⚠️",
                                id: null,
                            }
                        },
                        {
                            type: 2,
                            style: 2,
                            custom_id: `${interaction.member.user.id}-reset-cancel`,
                            label: "Cancel"
                        },
                    ]
                }
            ]
        };
    },
    options: []
}
