// WARNING:
// HORRIBLE MESSY CODE AHEAD
// ENTER AT YOUR OWN RISK

// Constants
const http = require("http");
const path = require("path");
const fs = require("fs");
const WebSocket = require("ws");

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
            }
            res.writeHead(200, { "Content-Type": contentType });
            res.end(content);
        }
    });
});

// More constants
const wss = new WebSocket.Server({ server });
const time = {};
const rooms = {};
const frame = 1000 / 25;
const friction = 5;
const acc = { flower: 2.5 };
const diag = 1 / Math.SQRT2;
const wasdSmooth = 0.076;
const petalLag = 0.35;
const petalSmooth = 3.5;
const normal = 70, attack = 100, defend = 38; // petal positions
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
    "PUS ABOVE ALL"
];
const directions = [
    "up",
    "right",
    "down",
    "left"
];

// Classes
class Petal {
    constructor(id, degree, coordR, centre) {
        this.id = id;
        this.degree = degree;
        this.coordR = coordR;
        this.x = centre.x + Math.sin(degree) * this.coordR;
        this.y = centre.y + Math.cos(degree) * this.coordR;
        this.change = 2.5 / (1000 / frame);
        switch (this.id) {
            case 1: 
                this.radius = 10;
                break;
        }
    }

    update(centre, degree) {
        this.degree = degree;
        this.x = centre.x + Math.sin(degree) * this.coordR;
        this.y = centre.y + Math.cos(degree) * this.coordR;
    }
}

// Functions
function getID(array) {
    let ID;
    do {
        ID = Math.round(Math.random() * 10);
    } while (array[ID] !== undefined);
    return ID;
}

// When a websocket connects
wss.on('connection', function connection(ws) {

    ws.on('error', console.error);

    let myID;
    let myRoom;
    let bruh;
    let myName;
    bruh = false;

    // Closed tab or reloading
    ws.on("close", () => {
        if (myRoom !== undefined) {
            myName = undefined;
            if (myID !== undefined) {
                rooms[myRoom].inGame--;
                for (const p in rooms[myRoom].players) {
                    rooms[myRoom].players[p].distances.delete(myID);
                }
                delete rooms[myRoom].players[myID];
                myID = undefined;
            }
            rooms[myRoom].connected--;
            if (!rooms[myRoom].connected) delete rooms[myRoom];
            myRoom = undefined;
        }
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
                        if (myRoom !== undefined) return;
                        for (const prop in rooms) if (prop === msg[2]) exists = true;
                        if (exists)  ws.send(JSON.stringify(["a", "a", "b", msg[2]]));
                        else {
                            let roomX, roomY;
                            roomX = Math.min(
                                299, 
                                Math.max(
                                    1, 
                                    parseInt(msg[3]) === NaN ? 20 : Math.round(parseInt(msg[3])) - 1
                                )
                            );
                            roomY = Math.min(
                                299, 
                                Math.max(
                                    1, 
                                    parseInt(msg[4]) === NaN ? 20 : Math.round(parseInt(msg[4])) - 1
                                )
                            );
                            rooms[msg[2]] = {
                                info: {
                                    x: roomX * 50,
                                    y: roomY * 50
                                },
                                connected: 1,
                                inGame: 0,
                                players: {}
                            };
                            myRoom = msg[2];
                            ws.send(JSON.stringify(["a", "a", "a", msg[2], rooms[msg[2]].info]));
                        }
                        break;

                    // Joining a room
                    case "b":
                        if (myRoom !== undefined) return;
                        for (const prop in rooms) if (prop === msg[2]) exists = true;
                        if (exists) {
                            ws.send(JSON.stringify(["a", "b", "a", msg[2], rooms[msg[2]].info]));
                            myRoom = msg[2];
                            rooms[msg[2]].connected++;
                        } else ws.send(JSON.stringify(["a", "b", "b", msg[2]]));
                        break;

                    // Disconnecting from room
                    case "c":
                        if (myRoom === undefined) return;
                        if (myID !== undefined) {
                            delete rooms[myRoom].players[myID];
                            myID = undefined;
                            rooms[myRoom].inGame--;
                        }
                        rooms[myRoom].connected--;
                        if (!rooms[myRoom].connected) delete rooms[myRoom];
                        myRoom = undefined;
                        break;
                }
                break;

            // Spawning
            case "b":
                if (myID !== undefined) return;
                let newID = getID(rooms[myRoom].players);
                let x = Math.random() * 100;
                let y = Math.random() * 100;
                let n = 5;
                if (!myName) myName = names[Math.abs(Math.round(Math.random() * names.length) - 1)];
                rooms[myRoom].players[newID] = {
                    pubInfo: {
                        name: msg.slice(1, 21) || myName,
                        x: x,
                        y: y,
                        health: 100,
                        petals: [
                            new Petal(1, 0, normal, { x: x, y: y }),
                            new Petal(1, 2 * Math.PI / n, normal, { x: x, y: y }),
                            new Petal(1, 2 * Math.PI / n * 2, normal, { x: x, y: y }),
                            new Petal(1, 2 * Math.PI / n * 3, normal, { x: x, y: y }),
                            new Petal(1, 2 * Math.PI / n * 4, normal, { x: x, y: y })
                        ],
                        face: 0
                    },
                    petalNum: n,
                    id: newID,
                    res: undefined,
                    keyboard: bruh,
                    mouse: {
                        mouseX: undefined,
                        mouseY: undefined
                    },
                    keys: {
                        upDown: false,
                        downDown: false,
                        rightDown: false,
                        leftDown: false,
                        space: false,
                        shiftLeft: false,
                        shiftRight: false,
                        leftMouse: false,
                        rightMouse: false
                    },
                    movement: {
                        direction: {
                            x: 0,
                            y: 0
                        },
                        acc: {
                            up: 0,
                            down: 0,
                            right: 0,
                            left: 0
                        },
                        speed: undefined
                    },
                    petalCentre: {
                        x: x, 
                        y: y
                    },
                    distances: new Map(),
                    petalDist: normal,
                    client: ws
                };
                for (const p in rooms[myRoom].players) {
                    if (rooms[myRoom].players[p].id !== newID) {
                        rooms[myRoom].players[newID].distances.set(
                            rooms[myRoom].players[p].id, 
                            { 
                                x: rooms[myRoom].players[p].pubInfo.x - x, 
                                y: rooms[myRoom].players[p].pubInfo.y - y, 
                            }
                        );
                        rooms[myRoom].players[p].distances.set(
                            newID, 
                            { 
                                x: x - rooms[myRoom].players[p].pubInfo.x, 
                                y: y - rooms[myRoom].players[p].pubInfo.y, 
                            }
                        );
                    }
                }
                myID = newID;
                rooms[myRoom].inGame++;
                break;


            // Button pressed or movement stuff
            case "c": 
                switch (msg[1]) {
                    case "a":
                        if (myID === undefined) return;
                        switch (msg.slice(2, msg.length)) {
                            case "KeyW":
                                rooms[myRoom].players[myID].keys.upDown = true;
                                break;
                            case "KeyS":
                                rooms[myRoom].players[myID].keys.downDown = true;  
                                break;
                            case "KeyD":
                                rooms[myRoom].players[myID].keys.rightDown = true;
                                break;
                            case "KeyA":
                                rooms[myRoom].players[myID].keys.leftDown = true;
                                break;
                            case "Space":
                                rooms[myRoom].players[myID].keys.spaceDown = true;
                                break;
                            case "ShiftLeft":
                                rooms[myRoom].players[myID].keys.shiftLeft = true;
                                break;
                            case "ShiftRight":
                                rooms[myRoom].players[myID].keys.shiftRight = true;
                                break;
                            case "0": 
                                rooms[myRoom].players[myID].keys.leftMouse = true;
                                break;
                            case "2": 
                                rooms[myRoom].players[myID].keys.rightMouse = true;
                                break;
                        }
                        break;
                    case "b":
                        if (myID === undefined) return;
                        switch (msg.slice(2, msg.length)) {
                            case "KeyW":
                                rooms[myRoom].players[myID].keys.upDown = false;
                                break;
                            case "KeyS":
                                rooms[myRoom].players[myID].keys.downDown = false;
                                break;
                            case "KeyD":
                                rooms[myRoom].players[myID].keys.rightDown = false;
                                break;
                            case "KeyA":
                                rooms[myRoom].players[myID].keys.leftDown = false;
                                break;
                            case "Space":
                                rooms[myRoom].players[myID].keys.spaceDown = false;
                                break;
                            case "ShiftLeft":
                                rooms[myRoom].players[myID].keys.shiftLeft = false;
                                break;
                            case "ShiftRight":
                                rooms[myRoom].players[myID].keys.shiftRight = false;
                                break;
                            case "0": 
                                rooms[myRoom].players[myID].keys.leftMouse = false;
                                break;
                            case "2": 
                                rooms[myRoom].players[myID].keys.rightMouse = false;
                                break;
                        }
                        break;
                    case "c":
                        bruh = !bruh;
                        if (myID !== undefined) rooms[myRoom].players[myID].keyboard = !rooms[myRoom].players[myID].keyboard;
                        break;
                    case "d":
                        if (myID === undefined) return;
                        rooms[myRoom].players[myID].mouse.mouseX = msg[2];
                        rooms[myRoom].players[myID].mouse.mouseY = msg[3];
                        rooms[myRoom].players[myID].res = msg[4];
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
    for (const room in rooms) {
        const mul = time.last / frame;
        if (rooms[room].inGame) {

            // Updating positions
            for (const p in rooms[room].players) {
                if (!rooms[room].players[p].keyboard && (rooms[room].players[p].mouse.mouseX || rooms[room].players[p].mouseY)) {
                    let totalDistance = Math.sqrt(Math.pow(rooms[room].players[p].mouse.mouseX, 2) + Math.pow(rooms[room].players[p].mouse.mouseY, 2));
                    rooms[room].players[p].movement.speed = ((totalDistance / rooms[room].players[p].res / 200 > 1) ? 1 : totalDistance / rooms[room].players[p].res / 200);
                    rooms[room].players[p].movement.speed *= acc.flower * friction * mul;
                    rooms[room].players[p].movement.direction.x = rooms[room].players[p].mouse.mouseX;
                    rooms[room].players[p].movement.direction.y = rooms[room].players[p].mouse.mouseY;

                    let distance = Math.sqrt(Math.pow(rooms[room].players[p].movement.direction.x, 2) + Math.pow(rooms[room].players[p].movement.direction.y, 2));
                    rooms[room].players[p].movement.direction.x /= distance;
                    rooms[room].players[p].movement.direction.y /= distance;
                } else {
                    rooms[room].players[p].movement.speed = acc.flower * friction * mul;

                    // Updating acceleration
                    directions.forEach((d, i) => {
                        if (rooms[room].players[p].keys[`${d}Down`]) {
                            if (rooms[room].players[p].keys[`${directions[(i + 2) % 4]}Down`]) {
                                rooms[room].players[p].movement.acc[d] = Math.max(rooms[room].players[p].movement.acc[d] - wasdSmooth * mul, 0);
                            } else if (rooms[room].players[p].keys[`${directions[(i + 1) % 4]}Down`] !== rooms[room].players[p].keys[`${directions[(i + 3) % 4]}Down`]) {
                                if (rooms[room].players[p].movement.acc[d] > diag) {
                                    rooms[room].players[p].movement.acc[d] = Math.max(rooms[room].players[p].movement.acc[d] - wasdSmooth * mul, diag);
                                } else {
                                    rooms[room].players[p].movement.acc[d] = Math.min(rooms[room].players[p].movement.acc[d] + wasdSmooth * mul, diag);
                                }
                            } else {
                                rooms[room].players[p].movement.acc[d] = Math.min(rooms[room].players[p].movement.acc[d] + wasdSmooth * mul, 1);
                            }
                        } else {
                            rooms[room].players[p].movement.acc[d] = Math.max(rooms[room].players[p].movement.acc[d] - wasdSmooth * mul, 0);
                        }
                    });
                    rooms[room].players[p].movement.direction.x = rooms[room].players[p].movement.acc.right - rooms[room].players[p].movement.acc.left;
                    rooms[room].players[p].movement.direction.y = rooms[room].players[p].movement.acc.up - rooms[room].players[p].movement.acc.down;
                }

                if (rooms[room].players[p].movement.speed) {
                    const xToAdd = Math.max(
                        Math.min(
                            rooms[room].players[p].pubInfo.x + rooms[room].players[p].movement.direction.x * rooms[room].players[p].movement.speed,
                            rooms[room].info.x
                        ),
                        0
                    ) - rooms[room].players[p].pubInfo.x;
                    const yToAdd = Math.max(
                        Math.min(
                            rooms[room].players[p].pubInfo.y + rooms[room].players[p].movement.direction.y * rooms[room].players[p].movement.speed,
                            rooms[room].info.y
                        ),
                        0
                    ) - rooms[room].players[p].pubInfo.y;
                    rooms[room].players[p].pubInfo.x += xToAdd;
                    rooms[room].players[p].pubInfo.y += yToAdd;
                    for (const n in rooms[room].players) {
                        if (rooms[room].players[n].id !== rooms[room].players[p].id) {
                            rooms[room].players[n].distances.get(rooms[room].players[p].id).x += xToAdd;
                            rooms[room].players[n].distances.get(rooms[room].players[p].id).y += yToAdd;
                            rooms[room].players[p].distances.get(rooms[room].players[n].id).x -= xToAdd;
                            rooms[room].players[p].distances.get(rooms[room].players[n].id).y -= yToAdd;
                        }
                    }
                }

                rooms[room].players[p].movement.direction.x = 0;
                rooms[room].players[p].movement.direction.y = 0;
                rooms[room].players[p].movement.speed = 0;

                rooms[room].players[p].petalCentre.x += petalLag * (rooms[room].players[p].pubInfo.x - rooms[room].players[p].petalCentre.x);
                rooms[room].players[p].petalCentre.y += petalLag * (rooms[room].players[p].pubInfo.y - rooms[room].players[p].petalCentre.y);

                rooms[room].players[p].pubInfo.petals.forEach(petal => {
                    if (rooms[room].players[p].keys.spaceDown 
                        || rooms[room].players[p].keys.leftMouse) {
                            rooms[room].players[p].petalDist = attack;
                            petal.coordR = Math.min(attack, petal.coordR + petalSmooth * mul);
                        }
                    else if (rooms[room].players[p].keys.shiftLeft 
                        || rooms[room].players[p].keys.shiftRight 
                        || rooms[room].players[p].keys.rightMouse) {
                            rooms[room].players[p].petalDist = defend;
                            petal.coordR = Math.max(defend, petal.coordR - petalSmooth * mul);
                        }
                    else {
                        rooms[room].players[p].petalDist = normal;
                        (petal.coordR < normal)
                            ? petal.coordR = Math.min(normal, petal.coordR + petalSmooth * mul)
                            : petal.coordR = Math.max(normal, petal.coordR - petalSmooth * mul);
                    }
                    let change = petal.change * mul;
                    petal.update({
                        x: rooms[room].players[p].petalCentre.x,
                        y: rooms[room].players[p].petalCentre.y
                    }, (petal.degree + change > 2 * Math.PI) ? (petal.degree + change) % 360 : petal.degree + change);
                });
            }


            // Sending data
            const players = Object.values(rooms[room].players);
            players.forEach((player, i) => {
                let reciever, send;
                send = [];
                reciever = {};
                for (let n = 0; n < players.length; n++) {
                    let index = (n + i) % players.length;
                    if (!n) {
                        reciever = players[index].distances;
                        send.push(players[index].pubInfo);
                    } else if (
                        // maximum is 1920 x 1080 (add petal distance for players partially on screen)
                        (Math.abs(reciever.get(players[index].id).x) <= 1920 / 2 + players[index].petalDist)
                        &&
                        (Math.abs(reciever.get(players[index].id).y) <= 1080 / 2 + players[index].petalDist)
                    ) send.push(players[index].pubInfo);
                }
                player.client.send(JSON.stringify(["b", send]));
            });
        }
    }
    time.old = Date.now();
}

time.old = Date.now();
setInterval(mainloop, frame);

const PORT = process.env.PORT || 9700;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});