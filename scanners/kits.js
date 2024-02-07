const users = require("../models/userModel");
const Timer = require("../system/Timer");

module.exports = {
    name: "kits",
    execute: async function (interaction, userID) {
        const user = await users.findById(userID);

        for (field of interaction.embeds[0].fields) {
            const category = field.name.split("**")[1].toLowerCase();

            for (line of field.value.split("\n")) {
                try {
                    const name = line.split(" ")[1].split("**")[1].toLowerCase();
                    const time = bot.stringToTime(line.split(" ")[3]);

                    if (user.timers[category][name] === "ready" && Number.isInteger(time) && name !== "daily") {
                        await new Timer().startTimer(interaction, userID, name, category, time);
                    }
                } catch (error) { }
            }
        }
    }
}
