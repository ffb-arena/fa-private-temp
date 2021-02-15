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
const rooms = {
    "": new Room(200, 200)
};
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
    "PUS ABOVE ALL"
];

// Functions
function getID(map) {
    let ID;
    do {
        ID = Math.round(Math.random() * 10);
    } while (map.has(ID));
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
    ws.send(JSON.stringify(["a", "b", "a", "", rooms[""].info, true]));

    // Closed tab or reloading
    ws.on("close", () => {
        myName = undefined;
        if (myID !== undefined) {
            rooms[myRoom].players.forEach(p => p.distances.delete(myID));
            rooms[myRoom].players.delete(myID);
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
                                rooms[myRoom].players.forEach(p => p.distances.delete(myID));
                                rooms[myRoom].players.delete(myID);
                                myID = undefined;
                            }
                            rooms[myRoom].connected--;
                            if (!rooms[myRoom].connected && myRoom !== "") delete rooms[myRoom];
                            rooms[msg[2]] = new Room(
                                parseInt(msg[3]) === NaN ? 20 : Math.round(parseInt(msg[3])) - 1,
                                parseInt(msg[4]) === NaN ? 20 : Math.round(parseInt(msg[4])) - 1
                            )
                            myRoom = msg[2];
                            ws.send(JSON.stringify(["a", "a", "a", msg[2], rooms[msg[2]].info]));
                        }
                        break;

                    // Joining a room
                    case "b":
                        for (const prop in rooms) if (prop === msg[2]) exists = true;
                        if (exists) {

                            if (myID !== undefined) {
                                rooms[myRoom].players.forEach(p => p.distances.delete(myID));
                                rooms[myRoom].players.delete(myID);
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
                const newID = getID(rooms[myRoom].players);
                const x = Math.random() * rooms[myRoom].info.x;
                const y = Math.random() * rooms[myRoom].info.y;
                const n = 5;
                if (!myName) myName = names[Math.abs(Math.round(Math.random() * names.length) - 1)];
                const name = msg.slice(1, 21) || myName;
                rooms[myRoom].players.set(newID, new Flower(newID, x, y, n, name, bruh, ws));
                rooms[myRoom].players.forEach((p, id) => {
                    if (p.id === id) return;
                    rooms[myRoom].players.get(newID).distances.set(
                        rooms[myRoom].players.get(id).id, 
                        { 
                            x: rooms[myRoom].players.get(id).pubInfo.x - x, 
                            y: rooms[myRoom].players.get(id).pubInfo.y - y, 
                        }
                    );
                    p.distances.set(
                        newID,
                        {
                            x: x - rooms[myRoom].players.get(id).pubInfo.x, 
                            y: y - rooms[myRoom].players.get(id).pubInfo.y, 
                        }
                    )
                })
                myID = newID;
                break;


            // Button pressed or movement stuff
            case "c": 
                switch (msg[1]) {
                    case "a":
                        if (myID === undefined) return;
                        rooms[myRoom].players.get(myID).keyDown(msg.slice(2, msg.length));
                        break;
                    case "b":
                        if (myID === undefined) return;
                        rooms[myRoom].players.get(myID).keyUp(msg.slice(2, msg.length))
                        break;
                    case "c":
                        bruh = !bruh;
                        if (myID !== undefined) rooms[myRoom].players.get(myID).keyboard = !rooms[myRoom].players.get(myID).keyboard;
                        break;
                    case "d":
                        if (myID === undefined) return;
                        rooms[myRoom].players.get(myID).mouse.mouseX = msg[2];
                        rooms[myRoom].players.get(myID).mouse.mouseY = msg[3];
                        rooms[myRoom].players.get(myID).res = msg[4];
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
    for (const room in rooms) {
        if (rooms[room].players.size) {

            // Updating positions
            rooms[room].players.forEach(player => {
                player.update(mul, rooms[room].info.x, rooms[room].info.y);
            });
            rooms[room].players.forEach((player, id) => {
                rooms[room].players.forEach((p, otherID) => {
                    if (id !== otherID) {
                        p.distances.get(id).x += player.movement.xToAdd;
                        p.distances.get(id).y += player.movement.yToAdd;
                        player.distances.get(otherID).x -= player.movement.xToAdd;
                        player.distances.get(otherID).y -= player.movement.yToAdd;
                    }
                })
            });

            // Checking collisions
            let players = [];
            rooms[room].players.forEach(value => players.push(value));
            players.forEach((player, i) => {
                players.forEach((p, n) => {
                    if (!(n <= i)) {
                        const d = player.distances.get(p.id);
                        if (Math.pow(Math.round(d.x * 100) / 100, 2) + Math.pow(Math.round(d.y * 100) / 100, 2)
                            <=
                            (Math.pow(Math.max(rooms[room].players.get(p.id).petalDist + rooms[room].players.get(p.id).petalDist + 20, 90), 2))) {
                            // p.id and player.id collide
                            // checking if the bodies collide (2500 = 50^2)
                            if (Math.pow(Math.round(d.x * 100) / 100, 2) + Math.pow(Math.round(d.y * 100) / 100, 2) <= 2500) {
                                console.log("body collision");
                                console.log("-");
                            }
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