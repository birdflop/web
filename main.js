const {app, BrowserWindow} = require('electron')
const ejse = require('ejs-electron')
const path = require("path");

let mainWindow
 
// The absolute path of current this directory.
const dataDir = path.resolve(`${__dirname}${path.sep}site`);

// Absolute path of ./templates directory.
const templateDir = path.resolve(`${dataDir}${path.sep}templates`);

const renderTemplate = (mainWindow, template, data = {}) => {
    // Default base data which passed to the ejs template by default.

    ejse.data({
        path: `file://${templateDir}${path.sep}${template}`,
    });
    mainWindow.loadURL(`${templateDir}${path.sep}${template}`);
};

app.on('ready', () => {
    mainWindow = new BrowserWindow({
    })
    renderTemplate(mainWindow, 'index.ejs')
})