const { app, BrowserWindow } = require('electron');
const ejse = require('ejs-electron');
const path = require("path");

let mainWindow;

// The absolute path of current this directory.
const dataDir = path.join(__dirname, 'site');

// Absolute path of ./templates directory.
const templateDir = path.join(dataDir, 'templates');

const renderTemplate = (mainWindow, template, data = {}) => {
    // Default base data which passed to the ejs template by default.
    ejse.data({
        path: path.join(templateDir, template),
    });

    // Load the template
    mainWindow.loadFile(path.join(templateDir, template));

    // Show the window after the template is loaded
    mainWindow.webContents.on('ready-to-show', async () => mainWindow.show());
};

app.on('ready', () => {
    mainWindow = new BrowserWindow({ show: false });
    renderTemplate(mainWindow, 'index.ejs');
});