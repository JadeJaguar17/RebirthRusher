const RebirthRusher = require("./system/RebirthRusher");
require("dotenv").config();

const AUTH_TOKEN = process.env.NODE_ENV === "development"
    ? process.env.DEVTOKEN
    : TOKEN;

const rbr = new RebirthRusher(AUTH_TOKEN);
rbr.init();

rbr.on("error", error => {
    rbr.error("Error event", error);
    console.error(error)
});

global.bot = rbr;

process.on("uncaughtException", (error) => {
    rbr.error("Uncaught Exception", error);
})

// Top.gg
const { AutoPoster } = require("topgg-autoposter");
const poster = AutoPoster(process.env.TOPGG_TOKEN, rbr);

poster.on('posted', () => {
    console.info('Posted stats to Top.gg!');
});

// Deals with any rejected Promises that haven't been handled
process.on('unhandledRejection', error => {
    rbr.error("Unhandled Promise Rejection", error);
});
