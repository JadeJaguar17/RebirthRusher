// Discord
const Eris = require("eris");
const MessageEmbed = require("./MessageEmbed.js");
const { Webhook } = require("@top-gg/sdk");
const express = require("express");

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

class RebirthRusher extends Eris.Client {
    constructor(token) {
        super(token, { restMode: true });
        this.commands = new Eris.Collection();
        this.timers = new Eris.Collection();
        this.scanners = new Eris.Collection();
        this.errorCase = 0;
    }

    /**
     * Fires up the bot
     */
    async init() {
        try {
            console.info("Connecting to API...");
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
                await this.loadTimers(true);
                await this.loadEvents();

                this.initDailies();
                setInterval(this.loadTimers, 60000);

                this.editStatus("online", { name: "/help", type: 3 });

                if (process.env.NODE_ENV === "production") {
                    const startEmbed = new MessageEmbed()
                        .setTitle("Started")
                        .setColor(SUCCESS)
                        .setTimestamp();

                    this.log("startup", startEmbed);
                }
                console.info("Bot launch successful");
                console.info("=========================");
            } catch (error) {
                console.error(error);
                process.exit();
            }
        });
    }

    /**
     * Creates daily timers for users that have it enabled
     */
    initDailies() {
        console.info("Starting up dailies schedule...");

        const rule = new schedule.RecurrenceRule();
        rule.hour = 0;
        rule.minute = 0;
        rule.tz = 'Etc/UTC';

        schedule.scheduleJob(rule, async function () {
            const allUsers = await UserDB.getAllUsers();
            allUsers.forEach(async (user) => {
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
            });
        });
    }

    /**
     * Load event files and start up listeners
     */
    async loadEvents() {
        console.info("Loading events...")
        this.removeAllListeners();
        const eventFiles = fs.readdirSync(`./events`).filter(file => file.endsWith(".js"));
        eventFiles.forEach(async (file) => {
            const resolve = require.resolve(`../events/${file}`);
            delete require.cache[resolve];
            const event = require(`../events/${file}`);
            this.on(file.split(".")[0], await event.bind(null, this));
        });
    }

    /**
     * Load command, timer, and scanner files
     */
    loadAllFiles() {
        console.info("Loading files...");

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

    /**
     * Loads a folder of files into a bot collection
     * @param {*} collectionName bot collection name
     * @param {*} folderPath relative directory path
     */
    loadFolder(collectionName, folderPath) {
        const folder = fs
            .readdirSync(path.resolve(__dirname, folderPath))
            .filter(file => file.endsWith(".js"));

        folder.forEach(fileName => {
            try {
                const filePath = `${folderPath}/${fileName}`;
                delete require.cache[require.resolve(filePath)];
                const scanner = require(filePath);
                this[collectionName].set(scanner.name, scanner);
            } catch (error) {
                console.error(error);
                process.exit();
            }
        });
    }

    /**
     * Loads slash commands when applicable. Slash commands only need to be
     * created if they're new or their command structure (command.options) has
     * changed. Otherwise, it's a waste of API calls to create slash commands
     * that haven't changed. Therefore we use a config file to indicate which
     * slash commands have changed and need to be reloaded in the API.
     */
    async loadApplicationCommands() {
        console.info("Loading application commands...");
        const updatedCommands = require("../config/updatedCommands.json");

        await Promise.all(updatedCommands.map(async (commandPath) => {
            // specific command file
            if (commandPath.includes("/")) {
                const command = require(`../commands/${commandPath}.js`);

                const category = commandPath.split("/")[0];
                await this.createApplicationCommand(
                    command,
                    category === "dev" || process.env.NODE_ENV !== "production"
                );
            }

            // whole subdirectory
            else {
                const subfolder = fs.readdirSync(`./commands/${commandPath}`);
                subfolder.forEach(async (file) => {
                    const command = require(`../commands/${commandPath}/${file}`);

                    await this.createApplicationCommand(
                        command,
                        commandPath === "dev" || process.env.NODE_ENV !== "production"
                    );
                });
            }
        }));
        console.info("Loading application commands done");
    }

    /**
     * 
     * @param {any} commandConfig command config to load in (determined by each
     * property in module.exports)
     * @param {boolean} isDev whether or not to create command only in dev server
     */
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

        console.info(` - Updated command [${commandConfig.name}]`);
    }

    /**
     * Connects to MongoDB
     */
    async initDB() {
        console.info("Connecting to MongoDB...");
        try {
            await mongoose.connect(process.env.SRV);
            console.info(` - Users: [${UserDB.collectionName}]`);
            console.info(` - Timers: [${TimerDB.collectionName}]`)
        } catch (error) {
            console.error(error);
            process.exit();
        }
    }

    /**
     * Resets timer states to "ready" to prevent locking
     */
    async resetTimers() {
        console.info("Resetting timers...");
        const allUsers = await UserDB.getAllUsers();
        await Promise.all(allUsers.map(async (user) => {
            let hasChanged = false;
            Object.keys(user.timers).forEach(category => {
                Object.keys(user.timers[category]).forEach(timer => {
                    if (user.timers[category][timer] === "running") {
                        user.timers[category][timer] = "ready";
                        hasChanged = true;
                    }
                });
            });

            if (hasChanged) await user.save();
        }));
    }

    /**
     * Starts up timers in the timer database
     * @param sendLog whether to send a log
     */
    async loadTimers(sendLog = false) {
        sendLog && console.info("Loading timers...");

        const allTimers = await TimerDB.getAllTimers();
        const usersToSave = [];
        await Promise.all(allTimers.map(async (timer) => {
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
                if (!usersToSave.includes(user)) usersToSave.push(user);
            }
        }));

        await Promise.all(usersToSave.map(async (user) => await user.save()));
    }

    /**
     * Connects to Top.gg
     */
    initTopGG() {
        console.info("Connecting to TopGG...");
        const app = express();
        const webhook = new Webhook(process.env.TOPGG_AUTH);
        const PORT = process.env.NODE_ENV === "production"
	    ? 1717
	    : 3000;

        app.post("/dblwebhook", webhook.listener(vote => {
            this.rewardVote(vote.user);
        }));

        app.listen(PORT);

        console.info(`Connected to TopGG (port ${PORT})`);
    }

    /**
     * Rewards a user when they vote
     * @param {string} userID user's Discord snowflake ID
     */
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

    /**
     * Sends a message
     * @param {Eris.Interaction} interaction interaction storing necessary info
     * like guild and channel IDs
     * @param {Eris.MessageContent} content content of message to send
     * @param {Eris.FileContent} file (optional) files to attach to message
     * @returns Eris awaitable action or error
     */
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

    /**
     * DM's a user letting them know a particular channel is missing permissions
     * @param {string} authorID Discord ID of user to DM
     * @param {string} channelID channel where permissions are missing
     * @param {string} guildID guild where permissions are missing
     */
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

    /**
     * Handles errors in the bot and logs it in a webhook channel
     * @param {string} source string to indicate file source of error
     * @param {Error} error error to handle
     * @param {Eris.Message} trigger Idle Miner message that triggered the error
     */
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
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Sends a log entry to a webhook channel
     * @param {string} type type of log
     * @param {Eris.Embed} embed embed to send in log channel
     */
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

    /**
     * Converts a time's string representation to seconds
     * @param {string} timeString time in string format
     * @returns time in seconds
     */
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
