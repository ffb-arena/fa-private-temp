const { app, BrowserWindow } = require("electron");

const fs = require("fs");
const path = require("path");
const C = require("../lib/consts.js");

let jsFile = "{";
C.files.forEach(file => {
    const filePath = path.join(
        process.cwd(),
        "..",
        "public",
        ...file
    );
    let fileCode = fs.readFileSync(filePath, "utf-8");
    if (fileCode[fileCode.length - 1] !== ";") {
        fileCode += ";";
    }
    jsFile += fileCode;
});
jsFile += "}";

fs.writeFile(
    "./src/test.html", 
    fs.readFileSync("../public/stuff.html", "utf-8"),
    err => { if (err) throw err; }
); 
fs.writeFile(
    "./src/styles.css", 
    fs.readFileSync("../public/styles.css", "utf-8"),
    err => { if (err) throw err; }
); 
fs.writeFile(
    "./src/index.js", 
    jsFile,
    err => { if (err) throw err; }
); 
fs.mkdirSync("./src/images");


function createWindow() {
    let win = new BrowserWindow({
        icon: "../public/images/icons/favicon.png",
        webPreferences: {
            nodeIntegration: true
        }
    });

    // win.removeMenu();
    win.maximize();

    win.loadFile("./src/test.html");
    win.on('close', () => {  
        fs.unlinkSync("./src/test.html");
        fs.unlinkSync("./src/index.js");
        fs.unlinkSync("./src/styles.css");
        fs.rmdirSync("./src/images");
        win.destroy();
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", app.quit);

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});