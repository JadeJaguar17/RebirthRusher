// Discord
const { Client, Collection } = require("eris");
const MessageEmbed = require("./MessageEmbed.js");
const { Webhook } = require("@top-gg/sdk");
const app = require("express")();

// Database
const mongoose = require("mongoose");
const Timer = require("./Timer.js");
const UserDB = require("../database/controllers/userController.js");
const TimerDB = require("../database/controllers/timerController.js");

// JS libraries
const fs = require("fs")
const path = require("path");
const schedule = require("node-schedule");

// Config
const dotenv = require("dotenv");
dotenv.config()

const { ERROR, RBR, SUCCESS } = require("../config/embedColors.json");
const { DEV_SERVER_ID } = require("../config/discordIds.json");
const { token } = require("../config/emojis.json");

class RebirthRusher extends Client {
    constructor(token) {
        super(token, { restMode: true });
        this.commands = new Collection();
        this.timers = new Collection();
        this.scanners = new Collection();
        this.errorCase = 0;
    }

    async init() {
        try {
            console.log("Connecting to API...");
            await this.connect();
        } catch (error) {
            console.error(error);
            process.exit();
        }

        this.once("ready", async () => {
            try {
                const promises = [];

                this.initTopGG();
                this.loadAllFiles();
                await this.loadApplicationCommands();

                await this.initDB();
                await this.resetTimers();
                console.log("Loading timers...")
                await this.loadTimers();
                await this.loadEvents();

                this.initDailies();
                setInterval(this.loadTimers, 60000);

                this.editStatus("online", { name: "/help", type: 3 });

                if (process.env.NODE_ENV !== "development") {
                    const startEmbed = new MessageEmbed()
                        .setTitle("Started")
                        .setColor(SUCCESS)
                        .setTimestamp();

                    this.log("startup", startEmbed);
                }
                console.log("Bot launch succesful");
                console.log("=========================");
            } catch (error) {
                console.error(error);
                process.exit();
            }
        });
    }

    initDailies() {
        console.log("Starting up dailies schedule...");

        const rule = new schedule.RecurrenceRule();
        rule.hour = 0;
        rule.minute = 0;
        rule.tz = 'Etc/UTC';

        schedule.scheduleJob(rule, async function () {
            const allUsers = await UserDB.getAllUsers();
            for (const user of allUsers) {
                if (user.timers.kits.daily === "ready" && user.settings.daily) {
                    await bot.send(
                        {
                            channel: {
                                id: user.settings.daily,
                                guild: { id: null }
                            },
                            author: { id: user._id }
                        },
                        `<@${user._id}> </daily:968186102622077019> ready`
                    );
                }
            }
        });
    }

    async loadEvents() {
        console.log("Loading events...")
        this.removeAllListeners();
        const eventFiles = fs.readdirSync(`./events`).filter(file => file.endsWith(".js"));
        for (const file of eventFiles) {
            const resolve = require.resolve(`../events/${file}`);
            delete require.cache[resolve];
            const event = require(`../events/${file}`);
            this.on(file.split(".")[0], await event.bind(null, this));
        }
    }

    loadAllFiles() {
        console.log("Loading files...");

        // load commands
        const commands = fs.readdirSync("./commands");
        commands
            .filter(f => !f.includes("."))
            .forEach(subFolder => {
                this.loadFolder("commands", `../commands/${subFolder}`)
            });

        // load timers
        const timers = fs.readdirSync("./timers/");
        timers
            .filter(f => !f.includes("."))
            .forEach(subFolder => {
                this.loadFolder("timers", `../timers/${subFolder}`)
            });

        // load scanners
        this.loadFolder("scanners", "../scanners")
    }

    // folderPath is relative
    loadFolder(collectionName, folderPath) {
        const folder = fs
            .readdirSync(path.resolve(__dirname, folderPath))
            .filter(file => file.endsWith(".js"));

        for (const fileName of folder) {
            try {
                const filePath = `${folderPath}/${fileName}`;
                delete require.cache[require.resolve(filePath)];
                const scanner = require(filePath);
                this[collectionName].set(scanner.name, scanner);
            } catch (error) {
                console.error(error);
                process.exit();
            }
        }
    }

    async loadApplicationCommands() {
        console.log("Loading application commands...");
        const updatedCommands = require("../config/updatedCommands.json");

        for (const commandPath of updatedCommands) {
            // specific command file
            if (commandPath.includes("/")) {
                const command = require(`../commands/${commandPath}.js`);

                const category = commandPath.split("/")[0];
                await this.createApplicationCommand(
                    command,
                    category === "dev"
                );
            }

            // whole subdirectory
            else {
                const subfolder = fs.readdirSync(`./commands/${commandPath}`);
                for (const file of subfolder) {
                    const command = require(`../commands/${commandPath}/${file}`);

                    await this.createApplicationCommand(
                        command,
                        commandPath === "dev"
                    );
                }
            }
        }
        console.log("Loading application commands done");
    }

    async createApplicationCommand(commandConfig, isDev) {
        if (isDev) {
            await this.createGuildCommand(DEV_SERVER_ID, {
                name: commandConfig.name,
                description: commandConfig.description,
                options: commandConfig.options || []
            }, 1);
        }
        else {
            await this.createCommand({
                name: commandConfig.name,
                description: commandConfig.description,
                options: commandConfig.options || []
            }, 1);
        }

        console.log(`  Updated command '${commandConfig.name}'`);
    }

    async initDB() {
        console.log("Connecting to MongoDB...");
        try {
            await mongoose.connect(process.env.SRV);
            console.log(` - Users: [${UserDB.collectionName}]`);
            console.log(` - Timers: [${TimerDB.collectionName}]`)
        } catch (error) {
            console.error(error);
            process.exit();
        }
    }

    async resetTimers() {
        console.log("Resetting timers...");
        const allUsers = await UserDB.getAllUsers();
        for (const user of allUsers) {
            let hasChanged = false;
            for (const category of Object.keys(user.timers)) {
                for (const timer of Object.keys(user.timers[category])) {
                    if (user.timers[category][timer] === "running") {
                        user.timers[category][timer] = "ready";
                        hasChanged = true;
                    }
                }
            }

            if (hasChanged) await user.save();
        }
    }

    async loadTimers() {
        const allTimers = await TimerDB.getAllTimers();
        for (const timer of allTimers) {
            const user = await UserDB.getUserById(timer.message.author.id)

            const now = new Date();
            const end = new Date(timer.endTime);
            const duration = (end - now) / 1000;

            if (duration <= -5 || !user) {
                await TimerDB.deleteTimer(timer._id);
            } else if (duration <= 60) {
                if (user.timers[timer.timerCategory][timer.timerName] !== "off") {
                    await new Timer().startTimer(
                        timer.message,
                        user,
                        timer.timerName,
                        timer.timerCategory,
                        Math.max(duration, 0),
                        timer._id
                    );
                }
                await TimerDB.deleteTimer(timer._id);
            } else if (user.timers[timer.timerCategory][timer.timerName] === "ready") {
                user.timers[timer.timerCategory][timer.timerName] = "running";
                await user.save();
            }
        }
    }

    initTopGG() {
        console.log("Connecting to TopGG...");
        const webhook = new Webhook(process.env.TOPGG_SECRET);
        const PORT = 80;

        app.post("/dblwebhook", webhook.listener(vote => {
            this.rewardVote(vote.user);
        }));

        app.listen(PORT);

        console.log(`Connected to TopGG (port ${PORT})`);
    }

    async rewardVote(userID) {
        try {
            const user = await UserDB.getUserById(userID);

            if (user) {
                const today = new Date();
                const isWeekend = [0, 5, 6].includes(today.getDay());

                const reward = ((isWeekend && 2) || 1) * 5;
                user.inventory.tokens += reward;
                await user.save();

                if (!user.settings.voteDisabled) {
                    try {
                        const DMChannel = await this.getDMChannel(userID);
                        await this.createMessage(
                            DMChannel.id,
                            `:ballot_box: **Thanks for the vote!**\n`
                            + `You have received ${reward} ${token}`
                            + `${(isWeekend && `\n(It's the weekend so you got *double*)`) || ""}\n\n`
                            + `You now have \`${user.inventory.tokens}\` ${token}`);
                    } catch (error) { }
                }

                const discordUser = this.users.get(userID) || await this.getRESTUser(userID);

                const voteEmbed = new MessageEmbed()
                    .setTitle("Vote received")
                    .setColor(RBR)
                    .setDescription(`${discordUser.username} (${userID})`);

                this.log("votes", voteEmbed);
            }
        } catch (error) {
            this.error("rewardVote()", error);
        }
    }

    async send(interaction, content, file) {
        if (!interaction || (!content && !file)) {
            return this.error(
                "bot.send()",
                new TypeError("Message and/or content isn't provided")
            );
        }

        try {
            return await this.createMessage(interaction.channel.id, content, file);
        } catch (error) {
            if (["Missing Permissions", "Missing Access"].includes(error.message)) {
                return interaction.channel.guild
                    && this.missingPermissions(
                        (interaction.author || interaction.member.user).id,
                        interaction.channel.id,
                        interaction.channel.guild.id
                    );
            }

            if (["Unknown User", "Unknown Channel"].includes(error.message)) {
                return;
            }

            return this.error("bot.send()", error);
        }
    }

    async missingPermissions(authorID, channelID, guildID) {
        try {
            if (this.guilds.has(guildID)) {
                const DMChannel = await this.getDMChannel(authorID);
                const message =
                    "Hello, I don't have sufficient permissions in"
                    + `<#${channelID}>. Please make sure I have the following`
                    + " permissions:\n\n"
                    + ":eyes: Read Messages\n"
                    + ":writing_hand: Send Messages\n"
                    + ":globe_with_meridians: Embed Links\n"
                    + ":file_folder: Attach Files\n"
                    + ":fire: Use External Emojis\n"
                    + ":ballot_box_with_check: Add Reactions\n"
                    + ":scroll: Read Message History"
                await this.createMessage(DMChannel.id, message);
            }
        } catch (error) { }
    }

    async error(source, error, trigger) {
        try {
            this.errorCase++;

            fs.appendFileSync(
                "./logs/errors.log",
                `Case ${this.errorCase}: ${new Date()}\n${error.stack}\n\n`
            );

            // create embed for webhook logging
            const errorEmbed = new MessageEmbed()
                .setTitle(`CASE ${this.errorCase}`)
                .setDescription(source)
                .setColor(ERROR)
                .addFields({ name: "Error", value: error.toString() })
                .setTimestamp();

            await this.log("errors", errorEmbed);

            // if a Discord message triggered the error, include it in the
            // webhook logs
            if (trigger) {
                const triggerEmbed = trigger.embeds[0]
                    ? trigger.embeds[0]
                    : new MessageEmbed()
                        .setTitle("MESSAGE")
                        .setDescription(trigger.content)

                await this.log("errors", triggerEmbed);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async log(type, embed) {
        await this.executeWebhook(
            process.env[`WEBHOOK_${type.toUpperCase()}_ID`],
            process.env[`WEBHOOK_${type.toUpperCase()}_TOKEN`],
            {
                embeds: [embed],
                avatarURL: this.user.avatarURL
            }
        );
    }

    stringToTime(timeString) {
        if (!timeString || timeString === "**FULL**" || timeString === "<1s") {
            return undefined;
        } else if (timeString.includes("h")) {
            if (timeString.includes("m")) {
                const [hours, minutes] = timeString.replace("h", ":").replace("m", ":").split(":");
                return Number(hours) * 3600 + Number(minutes) * 60;
            } else {
                return Number(timeString.replace("h", "")) * 3600;
            }
        } else if (timeString.includes("m")) {
            if (timeString.includes("s")) {
                const [minutes, seconds] = timeString.replace("m", ":").replace("s", ":").split(":");
                return Number(minutes) * 60 + Number(seconds);
            } else {
                return Number(timeString.replace("m", "")) * 60;
            }
        }

        return Number(timeString.replace("s", ""));
    }
}

module.exports = RebirthRusher;
