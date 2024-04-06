const users = require("../models/userModel.js");

/**
 * Get user document count
 * @returns count of all user documents
 */
module.exports.getAllUsers = async function() {
    return await users.countDocuments();
}

/**
 * Fetch user by ID
 * @param {string} userID user's Discord snowflake ID
 * @returns user object
 */
module.exports.getUserById = async function(userID) {
    return await users.findById(userID);
}
