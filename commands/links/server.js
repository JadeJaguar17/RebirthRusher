const { server } = require("../../config/links.json");

module.exports.name = "server"
module.exports.description = "Sends server invite link"
module.exports.syntax = "`/server`"

module.exports.execute = async function () {
    return `Need help? Have a suggestion? Found a bug?\n`
        + `Whatever the reason, you're always welcome to our support server!\n`
        + `${server}`;
}
