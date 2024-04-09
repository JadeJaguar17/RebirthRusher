const timers = require("../models/timerModel.js");
const UserDB = require("./userController.js");

/**
 * Name of corresponding MongoDB collection
 */
module.exports.collectionName = timers.collection.collectionName;

/**
 * Creates a new timer
 * @param {string} name name of timer
 * @param {string} category category of timer
 * @param {Date} endTime date when timer expires
 * @param {string} userID Discord ID of user to ping
 * @param {channel} channelID Discord ID of channelt to ping
 * @param {*} guildID Discord ID of guild/server where channel is located
 * @returns the newly created timer
 */
module.exports.createTimer = async function (name, category, endTime, userID, channelID, guildID) {
    return await timers.create({
        message: {
            author: {
                id: userID
            },
            channel: {
                id: channelID,
                guild: {
                    id: guildID
                }
            }
        },
        timerName: name,
        timerCategory: category,
        endTime: endTime
    });
}

/**
 * Get all timers that exist in database
 * @returns list of all timers
 */
module.exports.getAllTimers = async function () {
    return await timers.find();
}

/**
 * Deletes an existing timer
 * @param {string} timerID ID of timer to delete
 */
module.exports.deleteTimer = async function (timerID) {
    await timers.findByIdAndDelete(timerID);
}

/**
 * Deletes all occurences of timers that matches provided owner ID and name
 * @param {string} userID timer owner's Discord snowflake ID
 * @param {string} timerName name of timer to delete
 */
module.exports.deleteTimerForUser = async function (userID, timerName) {
    const user = await UserDB.getUserById(userID);
    const query = { "message.author.id": userID, "timerName": timerName };

    let hasHarvestTimer = false;
    timers.find(query, async function (_, docs) {
        await Promise.all(docs.map(async (timer) => {
            await timers.findByIdAndDelete(timer._id);
            user.timers[timer.timerCategory][timer.timerName] = "ready";
            hasHarvestTimer = true;
        }))
    });

    if (hasHarvestTimer) {
        await user.save();
    }
}
