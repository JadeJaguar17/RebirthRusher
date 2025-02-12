const RebirthRusher = require("./RebirthRusher.js");
require("dotenv").config();

const AUTH_TOKEN = process.env.NODE_ENV === "production"
    ? process.env.TOKEN
    : process.env.DEVTOKEN;

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

// deals with any unhandled rejected Promises
process.on('unhandledRejection', error => {
    rbr.error("Unhandled Promise Rejection", error);
});
