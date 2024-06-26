module.exports.name = "delete"
module.exports.description = "Deletes your user data"
module.exports.syntax = "`/delete`"
module.exports.needsAccount = true

module.exports.execute = async function (interaction) {
    const confirm = `<@${interaction.member.user.id}> are you sure you want`
        + ` to **permamemtly** delete all your data? If so, please confirm `
        + `within the next 15s`;

    return {
        content: confirm,
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        style: 4,
                        custom_id: `${interaction.member.user.id}-delete-confirm`,
                        label: "Yes, delete ALL my data",
                        emoji: {
                            name: "⚠️",
                            id: null,
                        }
                    },
                    {
                        type: 2,
                        style: 2,
                        custom_id: `${interaction.member.user.id}-delete-cancel`,
                        label: "Cancel"
                    },
                ]
            }
        ]
    };
}
