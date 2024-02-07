const { server } = require("../../config/links.json");

module.exports = {
    name: "server",
    description: "Sends server invite link",
    syntax: "`/server`",
    execute: async function () {
        return `Need help? Have a suggestion? Found a bug?\n`
            + `Whatever the reason, you're always welcome to our support server!\n`
            + `${server}`;
    },
    options: []
}
