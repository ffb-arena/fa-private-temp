// WARNING:
// HORRIBLE MESSY CODE AHEAD
// ENTER AT YOUR OWN RISK

// Constants
const Flower = require("./flower.js");
const Room = require("./room.js");

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
    const es5Code = require("@babel/core").transform(fs.readFileSync(file, "utf-8"), {
        presets: ["@babel/preset-env"],
    }).code
    var minifiedScript = require("uglify-js").minify(es5Code, {
        mangle: {
            toplevel: true,
        },
        keep_fnames: false
    }).code;
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

// More constants
const wss = new WebSocket.Server({ server });
const time = {};
let rooms = new Map().set("", new Room(20, 20));
const frame = 1000 / 25;
const names = [
    "John",
    "Milk&Cookies",
    "Jeff",
    "THISGAMSUX",
    "DEVUPDATEDIEP",
    "[KH]shift2team",
    "poopsock",
    "IMPROE",
    "Im haxin",
    "BAXTRIX[EN]",
    "dunked on yt",
    "[MG]MasterOv",
    "GebitDiver",
    "no mates :(((",
    "PUS ABOVE ALL",
    "SaloonTerror"
];

// Functions

function getID(map) {
    let ID;

    do ID = Math.round(Math.random() * 10);
    while (map.has(ID));

    return ID;
}

// gives a coordinate from an angle
function coord(angle, length) {
    let initialObject = {
        x: Math.sin(angle),
        y: Math.cos(angle)
    };
    let distance = Math.sqrt(initialObject.x * initialObject.x + initialObject.y * initialObject.y);
    initialObject.x /= distance;
    initialObject.y /= distance;
    initialObject.x *= length;
    initialObject.y *= length;
    return initialObject;
}


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
            rooms.get(myRoom).players.forEach(p => p.distances.delete(myID));
            rooms.get(myRoom).players.delete(myID);
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
                let exists;
                exists = false;
                switch (msg[1]) {

                    // Creating a room
                    case "a":
                        if (rooms.has(msg[2])) ws.send(JSON.stringify(["a", "a", "b", msg[2]]));
                        else {
                            if (myID !== undefined) {
                                rooms.get(myRoom).players.forEach(p => p.distances.delete(myID));
                                rooms.get(myRoom).players.delete(myID);
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
                                rooms.get(myRoom).players.forEach(p => p.distances.delete(myID));
                                rooms.get(myRoom).players.delete(myID);
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
                const newID = getID(rooms.get(myRoom).players);
                const x = Math.random() * rooms.get(myRoom).info.x;
                const y = Math.random() * rooms.get(myRoom).info.y;
                const n = 5;
                if (!myName) myName = names[Math.abs(Math.round(Math.random() * names.length) - 1)];
                const name = msg.slice(1, 21) || myName;
                rooms.get(myRoom).players.set(newID, new Flower(newID, x, y, n, name, bruh, 1, ws));
                rooms.get(myRoom).players.forEach((p, id) => {
                    if (p.id === newID) return;
                    rooms.get(myRoom).players.get(newID).distances.set(
                        id, 
                        { 
                            x: rooms.get(myRoom).players.get(id).pubInfo.x - x, 
                            y: rooms.get(myRoom).players.get(id).pubInfo.y - y, 
                        }
                    );
                    p.distances.set(
                        newID,
                        {
                            x: x - rooms.get(myRoom).players.get(id).pubInfo.x, 
                            y: y - rooms.get(myRoom).players.get(id).pubInfo.y, 
                        }
                    )
                })
                myID = newID;
                break;


            // Button pressed or movement stuff
            case "c": 
                switch (msg[1]) {

                    // keyup
                    case "a":
                        if (myID === undefined) return;
                        rooms.get(myRoom).players.get(myID).keyDown(msg.slice(2, msg.length));
                        break;

                    // keydown
                    case "b":
                        if (myID === undefined) return;
                        rooms.get(myRoom).players.get(myID).keyUp(msg.slice(2, msg.length))
                        break;

                    // changing movement settings
                    case "c":
                        bruh = !bruh;
                        if (myID !== undefined) rooms.get(myRoom).players.get(myID).keyboard = !rooms.get(myRoom).players.get(myID).keyboard;
                        break;

                    // moving mouse
                    case "d":
                        if (myID === undefined) return;
                        rooms.get(myRoom).players.get(myID).mouse.mouseX = msg[2];
                        rooms.get(myRoom).players.get(myID).mouse.mouseY = msg[3];
                        rooms.get(myRoom).players.get(myID).res = msg[4];
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
    const mul = time.last / frame;
    rooms.forEach(room => {
        if (room.players.size) {

            // Updating positions
            room.players.forEach(player => player.update(mul, room.info.x, room.info.y));

            // Updating distances between players
            room.players.forEach((player, id) => {
                room.players.forEach((p, otherID) => {
                    if (id !== otherID) {
                        p.distances.get(id).x += player.movement.xToAdd;
                        p.distances.get(id).y += player.movement.yToAdd;
                        player.distances.get(otherID).x -= player.movement.xToAdd;
                        player.distances.get(otherID).y -= player.movement.yToAdd;
                    }
                })
            });

            // Checking collisions
            room.players.forEach((player, i) => {
                room.players.forEach((p, n) => {
                    if (!(n <= i)) {
                        const d = player.distances.get(p.id);
                        if (Math.pow(Math.round(d.x * 100) / 100, 2) + Math.pow(Math.round(d.y * 100) / 100, 2)
                            <=
                            (Math.pow(Math.max(room.players.get(p.id).petalDist + room.players.get(p.id).petalDist + 20, 90), 2))) {

                            // p.id and player.id collide

                            // checking if the bodies collide (2500 = 50^2)
                            if (Math.pow(Math.round(d.x * 100) / 100, 2) + Math.pow(Math.round(d.y * 100) / 100, 2) <= 2500) {  

                                // knockback between 2 players
                                const playerAcc = {
                                    x: -player.movement.acc.x,
                                    y: -player.movement.acc.y
                                };
                                const pAcc = {
                                    x: -p.movement.acc.x,
                                    y: -p.movement.acc.y
                                };
                                let notMoving;
                                if (!player.movement.xToAdd && !player.movement.yToAdd) notMoving = player.id;
                                else if (!p.movement.xToAdd && !p.movement.yToAdd) notMoving = p.id;

                                const playerInitialAngle = Math.atan2(playerAcc.x, playerAcc.y);
                                const pInitialAngle = Math.atan2(pAcc.x, pAcc.y);

                                const avg = 2 * Math.PI - (playerInitialAngle + pInitialAngle) / 2;

                                const playerAccToAdd = notMoving ? coord(notMoving === player.id ? pInitialAngle + Math.PI : playerInitialAngle, 1)
                                    : coord(avg + (Math.PI * (playerInitialAngle < pInitialAngle)), 0.5);
                                const pAccToAdd = notMoving ? coord(notMoving === p.id ? playerInitialAngle + Math.PI : pInitialAngle, 1)
                                    : coord(avg + (Math.PI * (playerInitialAngle > pInitialAngle)), 0.5);

                                const overlapX = Math.abs(player.pubInfo.x - p.pubInfo.x) * 0.5; // actually half of overlap 
                                const overlapY = Math.abs(player.pubInfo.y - p.pubInfo.y) * 0.5; // because makes it less bouncy
                                
                                const total = p.movement.xToAdd * p.movement.xToAdd
                                    + p.movement.yToAdd * p.movement.yToAdd
                                    + player.movement.xToAdd * player.movement.xToAdd
                                    + player.movement.yToAdd * player.movement.yToAdd;
                                const playerPart = (player.movement.xToAdd * player.movement.xToAdd
                                    + player.movement.yToAdd * player.movement.yToAdd) / total;
                                const pPart = 1 - playerPart;

                                let x = overlapX * playerPart * (-(playerAccToAdd.x / Math.abs(playerAccToAdd.x) || 0));
                                let y = overlapY * playerPart * (-(playerAccToAdd.y / Math.abs(playerAccToAdd.y) || 0));
                                player.pubInfo.x -= x;
                                player.pubInfo.y -= y;
                                room.players.forEach((otherP, id) => {
                                    if (id !== player.id) {
                                        otherP.distances.get(player.id).x -= x;
                                        otherP.distances.get(player.id).y -= y;
                                        player.distances.get(otherP.id).x += x;
                                        player.distances.get(otherP.id).y += y;
                                    }
                                });

                                x = overlapX * pPart * -(pAccToAdd.x / Math.abs(pAccToAdd.x));
                                y = overlapY * pPart * -(pAccToAdd.y / Math.abs(pAccToAdd.y));
                                p.pubInfo.x -= x;
                                p.pubInfo.y -= y;
                                room.players.forEach((otherP, id) => {
                                    if (id !== p.id) {
                                        otherP.distances.get(p.id).x -= x;
                                        otherP.distances.get(p.id).y -= y;
                                        p.distances.get(otherP.id).x += x;
                                        p.distances.get(otherP.id).y += y;
                                    }
                                });

                                player.movement.accOffset.x += playerAccToAdd.x;
                                player.movement.accOffset.y += playerAccToAdd.y;
                                p.movement.accOffset.x += pAccToAdd.x;
                                p.movement.accOffset.y += pAccToAdd.y;
                            }
                        }
                    }
                });
                // for if you need to log acceleration values
                // if (player.pubInfo.name === "a" && (player.movement.acc.x || player.movement.acc.y)) console.log({
                //     x: Math.round(player.movement.acc.x * 100) / 100,
                //     y: Math.round(player.movement.acc.y * 100) / 100
                // });
            });

            // Sending data
            room.players.forEach((player, i) => {
                let reciever, send;
                send = [];
                reciever = {};
                reciever = room.players.get(i).distances;
                send.push(room.players.get(i).pubInfo);
                room.players.forEach((p, n) => {
                    if (n !== i &&
                        // maximum is 1920 x 1080 (add petal distance for players partially on screen)
                        (Math.abs(reciever.get(n).x) <= 960 + Math.max(p.petalDist, 45))
                        &&
                        (Math.abs(reciever.get(n).y) <= 540 + Math.max(p.petalDist, 45))
                    ) send.push(p.pubInfo);
                });
                player.client.send(JSON.stringify(["b", send]));
            });
        }
    });
    time.old = Date.now();
}

time.old = Date.now();
setInterval(mainloop, frame);

const PORT = process.env.PORT || 9700;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));