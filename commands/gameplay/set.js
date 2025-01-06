const UserDB = require("../../database/controllers/userController");

const defaults = {
    "rb": "#E67E22",
    "pr": "#A84300",
    "rbday": "#E74C3C"
};

const errorMessage = ":banana: Here's an empathy banana or whatever. "
    + "Anyways, something went wrong, please report it "
    + "in #feedback of the support server (`/server`)";

module.exports.name = "set"
module.exports.description = "Changes your different settings on Rebirth Rusher"
module.exports.syntax = "`/set`"
module.exports.needsAccount = true

module.exports.execute = async function (interaction) {
    const user = await UserDB.getUserById(interaction.member.user.id);

    const subcommand = interaction.data.options[0];
    const args = subcommand.options[0];

    switch (subcommand.name) {
        case "graph":
            return handleGraph(args, user);
        case "reminders":
            return handleReminders(args, user);
        case "votedm":
            user.settings.voteDisabled = args.value !== "on";

            await user.save();
            return `RbR will `
                + `${(args.value === "on" && "now start to") || "no longer"}`
                + ` DM you after you vote`;
        case "autopet":
            user.settings.autoPet = args.value === "on";

            await user.save();
            return `RbR will `
                + `${(args.value === "on" && "now start to") || "no longer"}`
                + ` automatically send \`/pets\` when you check your Idle `
                + `Miner pets`;
        default:
            return errorMessage;
    }
}

module.exports.options = [
    {
        name: "graph",
        description: "Changes your graph settings",
        type: 2,
        options: [
            {
                name: "theme",
                description: "Changes your graph theme",
                type: 1,
                options: [
                    {
                        name: "theme",
                        description: "change your theme between dark/light",
                        type: 3,
                        required: true,
                        choices: [
                            {
                                name: "dark",
                                value: "dark"
                            },
                            {
                                name: "light",
                                value: "light"
                            }
                        ]
                    }
                ]
            },
            {
                name: "color",
                description: "Changes the color of each aspect of your graph",
                type: 1,
                options: [
                    {
                        name: "category",
                        description: "category of graph to change color",
                        type: 3,
                        required: true,
                        choices: [
                            {
                                name: "rebirth",
                                value: "rb"
                            },
                            {
                                name: "prestige",
                                value: "pr"
                            },
                            {
                                name: "rb/day",
                                value: "rbday"
                            }
                        ]
                    },
                    {
                        name: "color",
                        description: "ID of color (you can view ID in /inventory. Use 0 for default colors)",
                        type: 10,
                        required: true
                    }
                ]
            },
            {
                name: "visibility",
                description: "Changes whether other users can view your graph",
                type: 1,
                options: [
                    {
                        name: "visibility",
                        description: "change your graph visibility between public/private",
                        type: 3,
                        required: true,
                        choices: [
                            {
                                name: "private",
                                value: "private"
                            },
                            {
                                name: "public",
                                value: "public"
                            }
                        ]
                    }
                ]
            },
            {
                name: "timezone",
                description: "Changes the timezone of your graph (determines when to create a new date)",
                type: 1,
                options: [
                    {
                        name: "timezone",
                        description: "your timezone's UTC offset (ex. If you're UTC+3, the offset would be +3)",
                        type: 4,
                        required: true
                    }
                ]
            },
            {
                name: "dateformat",
                description: "Changes how dates on your graph are displayed",
                type: 1,
                options: [
                    {
                        name: "format",
                        description: "your desired date format",
                        type: 3,
                        required: true,
                        choices: [
                            {
                                name: "mm/dd",
                                value: "mm/dd"
                            },
                            {
                                name: "dd/mm",
                                value: "dd/mm"
                            }
                        ]
                    }
                ]
            },
        ]
    },
    {
        name: "reminders",
        description: "Changes your reminder settings",
        type: 2,
        options: [
            {
                name: "all",
                description: "Affects all reminders",
                type: 1,
                options: [
                    {
                        name: "setting",
                        description: "on/off",
                        type: 3,
                        required: true,
                        choices: [
                            {
                                name: "on",
                                value: "on"
                            },
                            {
                                name: "off",
                                value: "off"
                            }
                        ]
                    }
                ]
            },
            {
                name: "category",
                description: "Affects all reminders in this category",
                type: 1,
                options: [
                    {
                        name: "name",
                        description: "name of category",
                        type: 3,
                        required: true,
                        choices: [
                            {
                                name: "kits",
                                value: "kits"
                            },
                            {
                                name: "games",
                                value: "games"
                            },
                            {
                                name: "abilities",
                                value: "abilities"
                            }
                            , {
                                name: "boosters",
                                value: "boosters"
                            }
                        ]
                    },
                    {
                        name: "setting",
                        description: "on/off",
                        type: 3,
                        required: true,
                        choices: [
                            {
                                name: "on",
                                value: "on"
                            },
                            {
                                name: "off",
                                value: "off"
                            }
                        ]
                    }
                ]
            },
            {
                name: "timer",
                description: "Affects only a specific timer",
                type: 1,
                options: [
                    {
                        name: "name",
                        description: "name of timer (ex. hunt, size, wings)",
                        type: 3,
                        required: true,
                    },
                    {
                        name: "setting",
                        description: "on/off",
                        type: 3,
                        required: true,
                        choices: [
                            {
                                name: "on",
                                value: "on"
                            },
                            {
                                name: "off",
                                value: "off"
                            }
                        ]
                    }
                ]
            },
            {
                name: "huntcd",
                description: "Set your hunt cooldown",
                type: 1,
                options: [
                    {
                        name: "cooldown",
                        description: "cooldown in seconds",
                        type: 4,
                        required: true
                    }
                ]
            },
            {
                name: "boostercd",
                description: "[insert description here]",
                type: 1,
                options: [
                    {
                        name: "time",
                        description: "time in seconds",
                        type: 4,
                        required: true
                    }
                ]
            },
            {
                name: "pkit",
                description: "Set your PrestigeKit level here",
                type: 1,
                options: [
                    {
                        name: "level",
                        description: "if your prestige kit level is higher than 6, just enter 6",
                        type: 4,
                        required: true
                    }
                ]
            }
        ]
    },
    {
        name: "votedm",
        description: "Enable/Disable getting DMed by RbR after voting",
        type: 1,
        options: [
            {
                name: "setting",
                description: "on/off",
                type: 3,
                required: true,
                choices: [
                    {
                        name: "on",
                        value: "on"
                    },
                    {
                        name: "off",
                        value: "off"
                    }
                ]
            }
        ]
    },
    {
        name: "autopet",
        description: "Enable/Disable r/pets automatically sending after im/pets",
        type: 1,
        options: [
            {
                name: "setting",
                description: "on/off",
                type: 3,
                required: true,
                choices: [
                    {
                        name: "on",
                        value: "on"
                    },
                    {
                        name: "off",
                        value: "off"
                    }
                ]
            }
        ]
    }
]

// handle changing graph settings
async function handleGraph(args, user) {
    switch (args.name) {
        case "color":
            const category = args.options[0].value;
            const colorID = args.options[1].value;

            const color = colorID === 0
                ? { name: "the default color", hex: defaults[category] }
                : user.inventory.graphColors.find(i => i.id == colorID);

            if (!color) {
                return ":no_entry_sign: You do not have this item";
            }

            const colorCategory = category === "rbday"
                ? "rbDayColor"
                : category + "Color";
            user.settings[colorCategory] = color.hex;
            await user.save();

            const customHex = Math.floor(color.id) === 14
                ? (" **(" + color.hex + ")**")
                : "";
            return `Your \`${category}\` line color was changed to `
                + `${color.name}${customHex}`;

        case "theme":
            if (args.options[0].value === "light") {
                user.settings.theme = 1;
                await user.save();
                return "Your graph theme is now `light` (you are a monster)";
            } else if (user.inventory.hasDarkMode) {
                user.settings.theme = 0;
                await user.save();
                return "Your graph theme is now `dark`";
            }

            return ":no_entry_sign: You don't have dark mode, buy "
                + "it in the shop!";

        case "visibility":
            if (args.options[0].value === "public") {
                user.settings.isPrivate = false;
                await user.save();

                return "Your graph is now `public`";
            }

            user.settings.isPrivate = true;
            await user.save();

            return "Your graph is now `private`";

        case "timezone":
            const tz = (args.options[0].value < 0 ? "" : "+") + args.options[0].value;

            if (tz > 14 || tz < -12) {
                return ":no_entry_sign: Invalid offset (must be between `-12` "
                    + "and `+14`). If you're `UTC-6`, the  offset would be `-6`."
                    + " If you're `UTC+3`, the offset would be `+3`)";
            }

            user.settings.timezone = tz;
            await user.save();

            return `Your graph timezone has been set to \`UTC${tz}\``;
        case "dateformat":
            if (user.settings.dateFormat !== args.options[0].value) {
                user.settings.dateFormat = args.options[0].value;
                await user.save()
            }

            return `Your graph now displays dates as \`${user.settings.dateFormat}\``;
        default:
            return errorMessage;
    }
}

// handle changing reminder settings
async function handleReminders(args, user) {
    switch (args.name) {
        case "all":
            Object.keys(user.timers).forEach(category => {
                Object.keys(user.timers[category]).forEach(timer => {
                    if (args.options[0].value === "on") {
                        if (user.timers[category][timer] !== "ready") {
                            user.timers[category][timer] = "ready";
                        }
                    } else {
                        user.timers[category][timer] = "off"
                    }
                });
            });

            await user.save();
            return `All timers turned \`${args.options[0].value}\``;

        case "category":
            Object.keys(user.timers[args.options[0].value]).forEach(timer => {
                if (args.options[1].value === "on") {
                    if (user.timers[args.options[0].value][timer] !== "ready") {
                        user.timers[args.options[0].value][timer] = "ready";
                    }
                } else {
                    user.timers[args.options[0].value][timer] = "off"
                }
            });

            await user.save();
            return `\`${args.options[0].value}\` turned \`${args.options[1].value}\``;

        case "timer":
            for (const category of Object.keys(user.timers)) {
                for (const timer of Object.keys(user.timers[category])) {
                    if (args.options[0].value === timer) {
                        if (args.options[1].value === "on") {
                            if (user.timers[category][timer] !== "ready") {
                                user.timers[category][timer] = "ready";
                            }
                        } else {
                            user.timers[category][timer] = "off"
                        }

                        await user.save();
                        return `\`${args.options[0].value}\` turned \`${args.options[1].value}\``;
                    }
                }
            }

            return `:no_entry_sign: \`${args.options[0].value}\` is not a valid"
            +" timer name!`;

        case "huntcd":
            if (
                args.options[0].value >= 10 &&
                args.options[0].value <= 600 &&
                Number.isInteger(args.options[0].value)
            ) {
                user.settings[args.name] = args.options[0].value;

                await user.save();
                return `\`${args.name}\` set to \`${args.options[0].value}s\``;
            }

            return "Please enter a valid setting (`huntcd` must be an integer "
                + "between 10 and 600)";

        case "boostercd":
            if (
                args.options[0].value >= 0 &&
                args.options[0].value <= 60 &&
                Number.isInteger(args.options[0].value)
            ) {
                user.settings[args.name] = args.options[0].value;

                await user.save();
                return `\`${args.name}\` set to \`${args.options[0].value}s\``;
            }

            return "Please enter a valid setting (`boostercd` must be an "
                + "integer between 1 and 60)";

        case "pkit":
            if (
                args.options[0].value >= 0 &&
                args.options[0].value <= 6 &&
                Number.isInteger(args.options[0].value)
            ) {
                user.settings[args.name] = args.options[0].value;

                await user.save();
                return `\`${args.name}\` set to level \`${args.options[0].value}\``;
            }

            return "Please enter a valid setting (`pkit` must be an"
                + " integer between 1 and 6. If your prestige kit "
                + "level is higher than 6, just enter 6 since the "
                + "cooldowns are the same)";

        default:
            return errorMessage;
    }
}
