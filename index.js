// WARNING:
// HORRIBLE MESSY CODE AHEAD
// ENTER AT YOUR OWN RISK

// Constants
const Room = require("./lib/room.js");
const C = require("./lib/consts.js");

const http = require("http");
const path = require("path");
const fs = require("fs");
const WebSocket = require("ws");

// minifying
const minify = false;

if (minify) {
    console.log("Minifying code...");
    const file = path.join(
        __dirname,
        "public",
        "stuff.js"
    );
    var minifiedScript = require("@babel/core").transform(fs.readFileSync(file, "utf-8"), {
        presets: ["minify"],
        comments: false 
    }).code
    console.log("Minification complete!");
}

// Server
const server = http.createServer((req, res) => {
    let contentType;
    let file = path.join(
        __dirname,
        "public",
        req.url === "/" ? "stuff.html" 
            : req.url === "/credits" ? "credits.html" 
            : req.url === "/changelog" ? "changelog.html"
            : req.url
    );
    fs.readFile(file, (err, content) => {
        if (err) {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end("<h1>page not found nub</h1>", "utf8");
        } else {
            switch (path.extname(file)) {
                case ".html": 
                    contentType = "text/html";
                    break;
                case ".js":
                    contentType = "text/javascript";
                    break;
                case ".ico":
                    contentType = "image/x-icon";
                    break;
                case ".css":
                    contentType = "text/css";
                    break;
                case ".png":
                    contentType = "img/png";
                    break;
                case ".svg":
                    contentType = "image/svg+xml";
                    break;
            }
            if (minify && req.url === "/stuff.js") content = minifiedScript;
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content);
        }
    });
});

// variables
const wss = new WebSocket.Server({ server });
const time = {};
let rooms = new Map().set("", new Room(20, 20));

// When a websocket connects
wss.on('connection', function connection(ws) {

    ws.on('error', console.error);

    let myID;
    let myRoom = "";
    let bruh;
    let myName;
    bruh = false;

    rooms.get("").connected++;
    ws.send(JSON.stringify(["a", "b", "a", "", rooms.get("").info, true]));

    // Closed tab or reloading
    ws.on("close", () => {
        myName = undefined;
        if (myID !== undefined) {
            rooms.get(myRoom).players[myID] = undefined;
            myID = undefined;
        }
        rooms.get(myRoom).connected--;
        if (!rooms.get(myRoom).connected && myRoom !== "") rooms.delete(myRoom);
        myRoom = undefined;
    });

    // Messages being received from that socket
    ws.on('message', function incoming(message) {

        let msg = JSON.parse(message);
        switch (msg[0]) {

            // Creating/joining rooms
            case "a":
                switch (msg[1]) {

                    // Creating a room
                    case "a":
                        if (rooms.has(msg[2])) ws.send(JSON.stringify(["a", "a", "b", msg[2]]));
                        else {
                            if (myID !== undefined) {
                                rooms.get(myRoom).players[myID] = undefined;
                                myID = undefined;
                            }
                            rooms.get(myRoom).connected--;
                            if (!rooms.get(myRoom).connected && myRoom !== "") rooms.delete(myRoom);
                            rooms.set(msg[2], 
                                new Room(
                                    parseInt(msg[3]) === NaN ? 20 : Math.round(parseInt(msg[3])) - 1,
                                    parseInt(msg[4]) === NaN ? 20 : Math.round(parseInt(msg[4])) - 1
                                )
                            );
                            myRoom = msg[2];
                            ws.send(JSON.stringify(["a", "a", "a", msg[2], rooms.get(msg[2]).info]));
                        }
                        break;

                    // Joining a room
                    case "b":
                        if (rooms.has(msg[2])) {
                            if (myID !== undefined) {
                                rooms.get(myRoom).players[myID] = undefined;
                                myID = undefined;
                            }
                            rooms.get(myRoom).connected--;
                            if (!rooms.get(myRoom).connected && myRoom !== "") rooms.delete(myRoom);

                            ws.send(JSON.stringify(["a", "b", "a", msg[2], rooms.get(msg[2]).info]));
                            myRoom = msg[2];
                            rooms.get(msg[2]).connected++;
                        } else ws.send(JSON.stringify(["a", "b", "b", msg[2]]));
                        break;
                }
                break;

            // Spawning
            case "b":
                if (myID !== undefined) return;
                const spawnReturn = rooms.get(myRoom).spawnPlayer(myName, msg.slice(1, 21), bruh, ws);
                myID = spawnReturn[0];
                myName = spawnReturn[1];
                break;

            // Button pressed or movement stuff
            case "c": 
                switch (msg[1]) {

                    // keyup
                    case "a":
                        if (myID === undefined) return;
                        rooms.get(myRoom).players[myID].keyDown(msg.slice(2, msg.length));
                        break;

                    // keydown
                    case "b":
                        if (myID === undefined) return;
                        rooms.get(myRoom).players[myID].keyUp(msg.slice(2, msg.length))
                        break;

                    // changing movement settings
                    case "c":
                        bruh = !bruh;
                        if (myID !== undefined) rooms.get(myRoom).players[myID].keyboard = !rooms.get(myRoom).players[myID].keyboard;
                        break;

                    // moving mouse
                    case "d":
                        if (myID === undefined) return;
                        rooms.get(myRoom).players[myID].mouse.mouseX = msg[2];
                        rooms.get(myRoom).players[myID].mouse.mouseY = msg[3];
                        rooms.get(myRoom).players[myID].res = msg[4];
                }
                break;

            // Ping
            case "p":
                if (msg === "ping") ws.send(JSON.stringify("pong"));
                break;
        }
    });
});

// Main loop
function mainloop() {
    time.last = Date.now() - time.old;
    const mul = time.last / C.frame;
    rooms.forEach(room => {
        room.update(mul);
    });
    time.old = Date.now();
}

time.old = Date.now();
setInterval(mainloop, C.frame);

const PORT = process.env.PORT || 9700;
server.listen(PORT, console.log(`Server running on port ${PORT}`));