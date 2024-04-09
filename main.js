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
});

// Deals with any rejected Promises that haven't been handled
process.on('unhandledRejection', error => {
    rbr.error("Unhandled Promise Rejection", error);
});
