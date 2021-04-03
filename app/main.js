const { app, BrowserWindow } = require("electron");

const fs = require("fs");
const path = require("path");
const files = require("../lib/files.js");


function copyFolder(pathToFolder, outputPath) {
    fs.mkdirSync(outputPath);
    fs.readdirSync(pathToFolder).forEach(file => {
        const filePath = path.join(
            pathToFolder,
            file
        );
        const pathToWrite = path.join(
            outputPath,
            file
        );
        let type = path.extname(filePath);
        if (type) {
            fs.writeFile(
                pathToWrite, 
                fs.readFileSync(filePath, "utf-8"),
                err => { if (err) throw err; }
            ); 
        } else {
            copyFolder(filePath, pathToWrite);
        }
    });
}

let jsFile = "{";
files.forEach(file => {
    const filePath = path.join(
        __dirname,
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


if (fs.existsSync("./src")) fs.rmdirSync("./src", { recursive: true });
copyFolder(
    path.join(__dirname, "..", "public"),
    path.join(__dirname, "src")
);
fs.rmdirSync(path.join(__dirname, "src", "lib"), { recursive: true });
fs.writeFile(
    "./src/index.js", 
    jsFile,
    err => { if (err) throw err; }
);

// actual app stuff
function createWindow() {
    let win = new BrowserWindow({
        icon: "../public/images/icons/favicon.png",
        webPreferences: {
            nodeIntegration: true
        }
    });

    // win.removeMenu();
    win.maximize();

    win.loadFile("./src/stuff.html");
    win.on('close', () => {
        fs.rmdirSync(path.join(
            __dirname,
            "src"
        ), { recursive: true });
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