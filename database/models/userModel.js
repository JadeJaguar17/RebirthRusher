const mongoose = require("mongoose");

function getDates() {
    const dates = [];
    for (let i = 0; i < 14; i++) {
        let date = new Date();
        date.setDate(date.getDate() + i);

        dates.push(`${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`);
    }

    return dates;
}

const userSchema = new mongoose.Schema({
    _id: String,
    inventory: {
        tokens: { type: Number, default: 0 },
        graphColors: { type: [], default: [] },
        hasDarkMode: { type: Boolean, default: false },
        subscriptions: { type: [], default: [] },
        hasClaimed: { type: Boolean, default: true }
    },
    graph: {
        tracker: {
            dates: { type: [String], default: getDates() },
            rebirths: { type: [Number], default: [null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
            prestiges: { type: [Number], default: [null, null, null, null, null, null, null, null, null, null, null, null, null, null] },
            rbDay: { type: [Number], default: [null, null, null, null, null, null, null, null, null, null, null, null, null, null] }
        },
        personalBests: {
            rb: { type: Number, default: 0 },
            pr: { type: Number, default: 0 },
            rbDay: { type: Number, default: 0 }
        },
        rbLevel: { type: Number, default: null },
        prLevel: { type: Number, default: null },
    },
    pets: {
        shards: { type: Number, default: 0 },

        common: { type: Number, default: 0 },
        uncommon: { type: Number, default: 0 },
        rare: { type: Number, default: 0 },
        epic: { type: Number, default: 0 },

        "★ common": { type: Number, default: 0 },
        "★ uncommon": { type: Number, default: 0 },
        "★ rare": { type: Number, default: 0 },
        "★ epic": { type: Number, default: 0 },

        "zombie-horse": { type: Number, default: 0 },
        "spider-jockey": { type: Number, default: 0 },
        "skeleton-horse": { type: Number, default: 0 },

        wither: { type: Number, default: 0 },
        giant: { type: Number, default: 0 },
        "ender-dragon": { type: Number, default: 0 }
    },
    timers: {
        kits: {
            commoner: { type: String, default: "off" },
            hourly: { type: String, default: "off" },
            daily: { type: String, default: "off" },
            prestigekit: { type: String, default: "off" },
            backpack: { type: String, default: "off" },
            supporter: { type: String, default: "off" }
        },
        games: {
            hunt: { type: String, default: "off" },
            fish: { type: String, default: "off" },
            harvest: { type: String, default: "off" }
        },
        abilities: {
            wings: { type: String, default: "off" },
            rage: { type: String, default: "off" },
            earthquake: { type: String, default: "off" }
        },
        boosters: {
            size: { type: String, default: "off" },
            speed: { type: String, default: "off" },
            sell: { type: String, default: "off" }
        }
    },
    settings: {
        huntcd: { type: Number, default: 300 },
        pkit: { type: Number, default: 0 },
        boostercd: { type: Number, default: 10 },
        rbColor: { type: String, default: "#E67E22" },
        prColor: { type: String, default: "#A84300" },
        rbDayColor: { type: String, default: "#E74C3C" },
        theme: { type: Number, default: 1 },
        isPrivate: { type: Boolean, default: false },
        voteDisabled: { type: Boolean, default: false },
        daily: { type: String },
        timezone: { type: String, default: "-0" },
        autoPet: { type: Boolean, default: false },
        dateFormat: { type: String, default: "mm/dd" },
        petPerks: { type: Number, default: 0 }
    }
});

// ensure I'm not modifying the actual database
const collectionName = process.env.NODE_ENV === "development"
    ? "users.test"
    : "users"

module.exports = mongoose.models[collectionName] || mongoose.model(collectionName, userSchema);
