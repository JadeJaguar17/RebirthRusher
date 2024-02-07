const mongoose = require("mongoose");

const timerSchema = new mongoose.Schema({
    message: {
        author: {
            id: { type: String }
        },
        channel: {
            id: { type: String },
            guild: {
                id: { type: String }
            }
        }
    },
    timerName: { type: String },
    timerCategory: { type: String },
    endTime: { type: Date }
});

// ensure I'm not modifying the actual database
const collectionName = "testTimers"

if (collectionName !== "testTimers" && process.env.NODE_ENV === "development") {
    console.error(new mongoose.MongooseError("Collection name needs to be changed"));
    process.exit()
}

module.exports = mongoose.models[collectionName] || mongoose.model(collectionName, timerSchema);
