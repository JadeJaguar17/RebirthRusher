const dotenv = require("dotenv");
dotenv.config()

const RebirthRusher = require("./system/RebirthRusher");
const rbr = new RebirthRusher(process.env.DEVTOKEN);
rbr.init()

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
const poster = AutoPoster(process.env.TOPGG_TOKEN, new Eris.Client(process.env.TOKEN));

poster.on('posted', () => {
    console.info('Posted stats to Top.gg!');
});

// Deals with any rejected Promises that haven't been handled
process.on('unhandledRejection', error => {
    rbr.error("Unhandled Promise Rejection", error);
});
