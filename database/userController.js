const users = require("./models/userModel.js");

/**
 * Get user document count
 * @returns count of all user documents
 */
module.exports.getUserCount = async function () {
    return await users.countDocuments();
}

/**
 * Fetch user by ID
 * @param {string} userID user's Discord snowflake ID
 * @returns user object
 */
module.exports.getUserById = async function (userID) {
    return await getUserById(userID);
}

/**
 * Create new User in database. If user already exists, it throws an error
 * @param {string} userID user's Discord snowflake ID
 * @returns the newly created user
 */
module.exports.createUser = async function (userID) {
    try {
        const newUser = await users.create({
            _id: userID
        });
        return newUser;
    } catch (error) {
        throw new Error("User with this ID already exists!");
    }
}

/**
 * Checks if a user with the provided ID exists in database
 * @param {string} userID user's Discord snowflake ID
 * @returns boolean whether user exists
 */
module.exports.checkUserExists = async function (userID) {
    return await users.exists({ _id: userID });
}

/**
 * Get top 10 users with the most RbR tokens
 * @returns top 10 users
 */
module.exports.getTopTenTokens = async function () {
    return await users
        .find()
        .sort({ "inventory.tokens": -1 })
        .limit(10);
}

/**
 * Get all users that exist in database
 * @returns list of all users
 */
module.exports.getAllUsers = async function () {
    return await users.find();
}

/**
 * Name of corresponding MongoDB collection
 */
module.exports.collectionName = users.collection.collectionName;
