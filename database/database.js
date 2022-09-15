const sqlite3 = require('sqlite3');
const { PENDING_WEBHOOK, APPROVED_WEBHOOK } = require("../config.json");
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const pendingHook = new Webhook(PENDING_WEBHOOK);
const approvedHook = new Webhook(APPROVED_WEBHOOK);
const database = {};
database.db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    database.createPresetTable();
    database.createPendingTable();
    console.log('Connected to the database.');
});

database.createPresetTable = () => {
    database.db.run(`CREATE TABLE IF NOT EXISTS presets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        author TEXT NOT NULL,
        authorid TEXT NOT NULL,
        data TEXT NOT NULL,
        date TEXT NOT NULL
    )`, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });
};

database.createPendingTable = () => {
    database.db.run(`CREATE TABLE IF NOT EXISTS pending (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        author TEXT NOT NULL,
        authorid TEXT NOT NULL,
        data TEXT NOT NULL,
        date TEXT NOT NULL
    )`, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });
};

database.createBlacklistTable = () => {
    database.db.run(`CREATE TABLE IF NOT EXISTS blacklist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userid TEXT NOT NULL,
        reason TEXT NOT NULL
    )`, (err) => {
        if (err) {
            return console.error(err.message);
        }
    });
};

database.getBlacklist = function getBlacklist() {
    return new Promise((resolve, reject) => {
        database.db.all(`SELECT * FROM blacklist`, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
};

database.addBlacklist = function addBlacklist(userid, reason) {
    return new Promise((resolve, reject) => {
        database.db.run(`INSERT INTO blacklist (userid, reason) VALUES (?, ?)`, [userid, reason], function (err) {
            if (err) {
                reject(err);
            }
            resolve(this.lastID);
        });
    });
};

database.deleteBlacklist = function deleteBlacklist(id) {
    return new Promise((resolve, reject) => {
        database.db.run(`DELETE FROM blacklist WHERE id = ?`, [id], function (err) {
            if (err) {
                reject(err);
            }
            resolve(this.lastID);
        });
    });
};

database.getPending = function getPending() {
    return new Promise((resolve, reject) => {
        database.db.all(`SELECT * FROM pending`, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
};

database.deletePending = function deletePending(id) {
    return new Promise((resolve, reject) => {
        database.db.run(`DELETE FROM pending WHERE id = ?`, [id], (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};

database.deletePreset = function deletePreset(id) {
    return new Promise((resolve, reject) => {
        database.db.run(`DELETE FROM presets WHERE id = ?`, [id], (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};

database.getSinglePreset = function getSinglePreset(id) {
    return new Promise((resolve, reject) => {
        database.db.all(`SELECT * FROM presets WHERE id = ?`, [id], (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
};

database.getPresets = function getPresets() {
    return new Promise((resolve, reject) => {
        database.db.all(`SELECT * FROM presets`, (err, rows) => {
            if (err) {
                reject(err);
            }
            resolve(rows);
        });
    });
};

database.addPreset = function addPreset(name, description, author, authorid, data, date) {
    return new Promise((resolve, reject) => {
        database.db.run(`INSERT INTO presets (name, description, author, authorid, data, date) VALUES (?, ?, ?, ?, ?, ?)`, [name, description, author, authorid, data, date], (err) => {
            if (err) {
                reject(err);
            }
            const embed = new MessageBuilder()
                .setTitle('New Preset Approved')
                .addField('Name', name)
                .addField('Description', description)
                .addField('Author', author)
                .addField('Date', date)
                .setColor('#00ff00');
            approvedHook.send(embed);
            resolve();
        });
    });
};

database.addPending = function addPending(name, description, author, authorid, data, date) {
    return new Promise((resolve, reject) => {
        database.db.run(`INSERT INTO pending (name, description, author, authorid, data, date) VALUES (?, ?, ?, ?, ?, ?)`, [name, description, author, authorid, data, date], (err) => {
            if (err) {
                reject(err);
            }
            const embed = new MessageBuilder()
                .setTitle('New Preset Pending')
                .addField('Name', name)
                .addField('Description', description)
                .addField('Author', author)
                .addField('Date', date)
                .setColor('#ffff00');
            pendingHook.send(embed);
            resolve();
        });
    });
};

module.exports = database;