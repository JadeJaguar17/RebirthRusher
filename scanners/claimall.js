module.exports = {
    name: "claimall",
    execute: async function(interaction, userID) {
        const newMessage = {
            author: {
                id: userID
            },
            channel: interaction.channel
        };

        for (kit of interaction.embeds[0].description.split("\n")) {
            const name = kit.split("**")[1].toLowerCase();

            try {
                await bot.timers.get(name).execute(newMessage, userID);
            } catch (error) {}
        }
    }
}