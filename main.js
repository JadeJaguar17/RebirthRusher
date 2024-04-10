const RebirthRusher = require("./system/RebirthRusher");
require("dotenv").config();

const AUTH_TOKEN = process.env.NODE_ENV === "development"
    ? process.env.DEVTOKEN
    : process.env.TOKEN;

// log which version of bot is being run
if (AUTH_TOKEN === process.env.DEVTOKEN) {
    console.info("Starting up dev bot");
}
else if (AUTH_TOKEN === process.env.TOKEN) {
    console.info("Starting up main bot");
}
else {
    console.info("Unknown auth token, terminating...");
    exit();
}

// create RebirthRusher bot and start it up
const rbr = new RebirthRusher(AUTH_TOKEN);
rbr.init();

global.bot = rbr;

// handle errors
// rbr.on("error", error => {
//     rbr.error("Error event", error);
//     console.error(error)
// });

// handle any uncaught exceptions
process.on("uncaughtException", (error) => {
    rbr.error("Uncaught Exception", error);
});

// deals with any undhandled rejected Promises
process.on('unhandledRejection', error => {
    rbr.error("Unhandled Promise Rejection", error);
});
