// WARNING:
// HORRIBLE MESSY CODE AHEAD
// ENTER AT YOUR OWN RISK

// Constants
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
const rooms = {
    "": {
        info: {
            // 200x200 units (unit = 50px)
            x: 10000,
            y: 10000
        },
        connected: 0,
        inGame: 0,
        players: {}
    }
};
const frame = 1000 / 25;
const friction = 5;
const acc = { flower: 2.5 };
const diag = 1 / Math.SQRT2;
const wasdSmooth = 0.1;
const petalLag = 0.35;
const petalSmooth = 1.5;
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
limit = {
    "1": "min",
    "-1": "max"
}

// Classes
class Petal {
    constructor(id, degree, coordR, centre) {
        this.id = id;
        this.degree = degree;
        this.x = centre.x + Math.sin(degree) * coordR;
        this.y = centre.y + Math.cos(degree) * coordR;
        this.change = 2.5 / (1000 / frame);
        switch (this.id) {
            case 1: 
                this.radius = 10;
                break;
        }
    }

    update(centre, degree, distance) {
        this.degree = degree;
        this.x = centre.x + Math.sin(degree) * distance;
        this.y = centre.y + Math.cos(degree) * distance;
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
    let myRoom = "";
    let bruh;
    let myName;
    bruh = false;

    rooms[""].connected++;
    ws.send(JSON.stringify(["a", "b", "a", "", rooms[""].info]));

    // Closed tab or reloading
    ws.on("close", () => {
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
        if (!rooms[myRoom].connected && myRoom !== "") delete rooms[myRoom];
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
                        for (const prop in rooms) if (prop === msg[2]) exists = true;
                        if (exists)  ws.send(JSON.stringify(["a", "a", "b", msg[2]]));
                        else {

                            if (myID !== undefined) {
                                rooms[myRoom].inGame--;
                                for (const p in rooms[myRoom].players) {
                                    rooms[myRoom].players[p].distances.delete(myID);
                                }
                                delete rooms[myRoom].players[myID];
                                myID = undefined;
                            }
                            rooms[myRoom].connected--;
                            if (!rooms[myRoom].connected && myRoom !== "") delete rooms[myRoom];

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
                        for (const prop in rooms) if (prop === msg[2]) exists = true;
                        if (exists) {

                            if (myID !== undefined) {
                                rooms[myRoom].inGame--;
                                for (const p in rooms[myRoom].players) {
                                    rooms[myRoom].players[p].distances.delete(myID);
                                }
                                delete rooms[myRoom].players[myID];
                                myID = undefined;
                            }
                            rooms[myRoom].connected--;
                            if (!rooms[myRoom].connected && myRoom !== "") delete rooms[myRoom];

                            ws.send(JSON.stringify(["a", "b", "a", msg[2], rooms[msg[2]].info]));
                            myRoom = msg[2];
                            rooms[msg[2]].connected++;
                        } else ws.send(JSON.stringify(["a", "b", "b", msg[2]]));
                        break;
                }
                break;

            // Spawning
            case "b":
                if (myID !== undefined) return;
                let newID = getID(rooms[myRoom].players);
                let x = Math.random() * rooms[myRoom].info.x;
                let y = Math.random() * rooms[myRoom].info.y;
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

                        upArrow: false,
                        downArrow: false,
                        rightArrow: false,
                        leftArrow: false,

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
                            x: 0,
                            y: 0
                        },
                        speed: undefined,
                        xToAdd: undefined,
                        yToAdd: undefined
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

                            case "ArrowUp":
                                rooms[myRoom].players[myID].keys.upArrow = true;
                                break;
                            case "ArrowDown":
                                rooms[myRoom].players[myID].keys.downArrow = true;
                                break;
                            case "ArrowLeft":
                                rooms[myRoom].players[myID].keys.leftArrow = true;
                                break;
                            case "ArrowRight":
                                rooms[myRoom].players[myID].keys.rightArrow = true;
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

                            case "ArrowUp":
                                rooms[myRoom].players[myID].keys.upArrow = false;
                                break;
                            case "ArrowDown":
                                rooms[myRoom].players[myID].keys.downArrow = false;
                                break;
                            case "ArrowLeft":
                                rooms[myRoom].players[myID].keys.leftArrow = false;
                                break;
                            case "ArrowRight":
                                rooms[myRoom].players[myID].keys.rightArrow = false;
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

                    const up = rooms[room].players[p].keys.upDown || rooms[room].players[p].keys.upArrow;
                    const down = rooms[room].players[p].keys.downDown || rooms[room].players[p].keys.downArrow;
                    const left = rooms[room].players[p].keys.leftDown || rooms[room].players[p].keys.leftArrow;
                    const right = rooms[room].players[p].keys.rightDown || rooms[room].players[p].keys.rightArrow;

                    // Updating acceleration
                    
                    // x axis
                    if (right !== left) {
                        const sign = right ? 1 : -1;
                        if (up !== down) {
                            // diagonal
                            if (rooms[room].players[p].movement.acc.x > diag * sign) {
                                rooms[room].players[p].movement.acc.x -= wasdSmooth * mul;
                            } else {
                                rooms[room].players[p].movement.acc.x += wasdSmooth * mul;
                            }
                        } else {
                            rooms[room].players[p].movement.acc.x = Math[limit[sign]](rooms[room].players[p].movement.acc.x + wasdSmooth * mul * sign, 1 * sign);
                        }
                    } else if (rooms[room].players[p].movement.acc.x) {
                        const oldAccel = rooms[room].players[p].movement.acc.x;
                        rooms[room].players[p].movement.acc.x -= wasdSmooth * mul * (oldAccel / Math.abs(oldAccel));
                        if (oldAccel && ((oldAccel <= 0) !== (rooms[room].players[p].movement.acc.x <= 0))) {
                            rooms[room].players[p].movement.acc.x = 0;
                        }
                    }

                    // y axis
                    if (up !== down) {
                        const sign = up ? 1 : -1;
                        if (right !== left) {
                            // diagonal
                            if (rooms[room].players[p].movement.acc.y > diag * sign) {
                                rooms[room].players[p].movement.acc.y -= wasdSmooth * mul;
                            } else {
                                rooms[room].players[p].movement.acc.y += wasdSmooth * mul;
                            }
                        } else {
                            rooms[room].players[p].movement.acc.y = Math[limit[sign]](rooms[room].players[p].movement.acc.y + wasdSmooth * mul * sign, 1 * sign);
                        }
                    } else if (rooms[room].players[p].movement.acc.y) {
                        const oldAccel = rooms[room].players[p].movement.acc.y;
                        rooms[room].players[p].movement.acc.y -= wasdSmooth * mul * (oldAccel / Math.abs(oldAccel));
                        if (oldAccel && ((oldAccel <= 0) !== (rooms[room].players[p].movement.acc.y <= 0))) {
                            rooms[room].players[p].movement.acc.y = 0;
                        }
                    }

                    rooms[room].players[p].movement.direction.x = rooms[room].players[p].movement.acc.x;
                    rooms[room].players[p].movement.direction.y = rooms[room].players[p].movement.acc.y;
                }

                if (rooms[room].players[p].movement.speed) {
                    rooms[room].players[p].movement.xToAdd = Math.max(
                        Math.min(
                            rooms[room].players[p].pubInfo.x + rooms[room].players[p].movement.direction.x * rooms[room].players[p].movement.speed,
                            rooms[room].info.x
                        ),
                        0
                    ) - rooms[room].players[p].pubInfo.x;
                    rooms[room].players[p].movement.yToAdd = Math.max(
                        Math.min(
                            rooms[room].players[p].pubInfo.y + rooms[room].players[p].movement.direction.y * rooms[room].players[p].movement.speed,
                            rooms[room].info.y
                        ),
                        0
                    ) - rooms[room].players[p].pubInfo.y;
                    rooms[room].players[p].pubInfo.x += rooms[room].players[p].movement.xToAdd;
                    rooms[room].players[p].pubInfo.y += rooms[room].players[p].movement.yToAdd;
                    for (const n in rooms[room].players) {
                        if (rooms[room].players[n].id !== rooms[room].players[p].id) {
                            rooms[room].players[n].distances.get(rooms[room].players[p].id).x += rooms[room].players[p].movement.xToAdd;
                            rooms[room].players[n].distances.get(rooms[room].players[p].id).y += rooms[room].players[p].movement.yToAdd;
                            rooms[room].players[p].distances.get(rooms[room].players[n].id).x -= rooms[room].players[p].movement.xToAdd;
                            rooms[room].players[p].distances.get(rooms[room].players[n].id).y -= rooms[room].players[p].movement.yToAdd;
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
                            rooms[room].players[p].petalDist = Math.min(attack, rooms[room].players[p].petalDist + petalSmooth * mul);
                        }
                    else if (rooms[room].players[p].keys.shiftLeft 
                        || rooms[room].players[p].keys.shiftRight 
                        || rooms[room].players[p].keys.rightMouse) {
                            rooms[room].players[p].petalDist = Math.max(defend, rooms[room].players[p].petalDist - petalSmooth * mul);
                        }
                    else {
                        (rooms[room].players[p].petalDist < normal)
                            ? rooms[room].players[p].petalDist = Math.min(rooms[room].players[p].petalDist + petalSmooth * mul)
                            : rooms[room].players[p].petalDist = Math.max(normal, rooms[room].players[p].petalDist - petalSmooth * mul);
                    }
                    let change = petal.change * mul;
                    let nextPetalDegree = petal.degree + change;
                    if (nextPetalDegree > 2 * Math.PI) nextPetalDegree %= (2 * Math.PI);
                    petal.update({
                        x: rooms[room].players[p].petalCentre.x,
                        y: rooms[room].players[p].petalCentre.y
                    }, nextPetalDegree, rooms[room].players[p].petalDist
                    );
                });
            }

            // Checking collisions
            const players = Object.values(rooms[room].players);
            players.forEach((player, i) => {
                players.forEach((p, n) => {
                    if (n <= i) return;
                    let d = player.distances.get(p.id);
                    if (
                        Math.pow(Math.round(d.x * 100) / 100, 2) + Math.pow(Math.round(d.y * 100) / 100, 2)
                        <=
                        (Math.pow(Math.max(rooms[room].players[p.id].petalDist + rooms[room].players[player.id].petalDist + 20, 90), 2))
                    ) {
                        // p.id and player.id collide

                        // checking if the bodies collide (2500 = 50^2)
                        if (Math.pow(Math.round(d.x * 100) / 100, 2) + Math.pow(Math.round(d.y * 100) / 100, 2) <= 2500) {
                            console.log("body collision")
                            console.log("-")
                        }
                    }
                });
            });

            // Sending data
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
                        (Math.abs(reciever.get(players[index].id).x) <= 960 + Math.max(players[index].petalDist, 45))
                        &&
                        (Math.abs(reciever.get(players[index].id).y) <= 540 + Math.max(players[index].petalDist, 45))
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
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));