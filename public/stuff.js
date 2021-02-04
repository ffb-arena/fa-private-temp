// Constants
const body = document.getElementById("body");
const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle")
const join = document.getElementById("join");
const make = document.getElementById("make");
const inputCreate = document.getElementById("input-create");
const inputJoin = document.getElementById("input-join");
const joinSubmit = document.getElementById("join-submit");
const createSubmit = document.getElementById("create-submit");

const discord = document.getElementById("Discord");
const github = document.getElementById("Github");
const florr = document.getElementById("Florr");

const nname = document.getElementById("name");
const back = document.getElementById("back");
const systemText = document.getElementById("system-text");
const roomID = document.getElementById("room-ID");
const roomContainer = document.getElementById("room-container");

const roomSettingsContainer = document.getElementById("room-settings-container");
const inputX = document.getElementById("x");
const inputY = document.getElementById("y");
const by = document.getElementById("by");
const units = document.getElementById("units");

const settingsContainer = document.getElementById("settings-container");
const keyboard = document.getElementById("keyboard");
const helper = document.getElementById("helper");
const perf = document.getElementById("performance");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const ws = new WebSocket(`ws://${window.location.hostname}${window.location.port ? ":" : ""}${window.location.port}`);

const gridSpace = 50;
const performance = {
    pingCalc: undefined,
    ping: undefined
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.textAlign = "center";

inputCreate.hidden = true;
inputJoin.hidden = true;
joinSubmit.hidden = true;
createSubmit.hidden = true;
nname.hidden = true;
back.hidden = true;
roomID.hidden = true;
roomContainer.hidden = true;
perf.hidden = true;

roomSettingsContainer.hidden = true;
inputX.hidden = true;
inputY.hidden = true;
by.hidden = true;
units.hidden = true;

inputX.value = 20;
inputY.value = 20;

window.onbeforeunload = () => { return "Are you sure you want to leave this page?" };
ctx.lineJoin = "bevel";
ctx.miterLimit = 2;

// Variables
var me, res, gridSetter, extraInfo, allPlayers, mms, mmHeight, mmWidth, circleRadius, circlePlane;
me = {
    roomInfo: {
        x: 0,
        y: 0
    },
    info: {
        x: 0,
        y: 0,
        mouseX: 0,
        mouseY: 0
    },
    settings: {
        keyboard: false,
        helper: false
    },
    face: 0
};
res = (window.innerWidth / 1920 > window.innerHeight / 1080) ? window.innerWidth / 1920 : window.innerHeight / 1080;
extraInfo = false;

// Classes
class Player {
    constructor(name, x, y, r) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.r = r;
    }

    draw(isntMe) {
        // Circle
        ctx.fillStyle = "#beb951";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = "#ffe763";
        ctx.arc(this.x, this.y, this.r - 3 * res, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        
        // Eyes
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.ellipse(this.x - 7 * res, this.y - 5 * res, 2.75 * res, 6 * res, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.ellipse(this.x + 7 * res, this.y - 5 * res, 2.75 * res, 6 * res, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath()

        // Mouth
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.25 * res;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 12 * res, 9 * res, 0.5 * Math.PI, 0.7, 2 * Math.PI - 0.7, true);
        ctx.stroke();

        // Name
        if (isntMe) {
            ctx.lineWidth = 4 * res;
            ctx.font = "18px Ubuntu"
            ctx.strokeText(this.name, this.x, this.y - 35 * res);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(this.name, this.x, this.y - 35 * res);
        }
    }
}

// Functions
// ~~Stole~~ borrowed this from stackoverflow.
// Thanks
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    return this;
}

function performing() {
    ws.send(JSON.stringify("ping"));
    performance.pingCalc = new Date().getTime();
}

function drawGrid() {
    ctx.strokeStyle = "#000000";
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 0.5;
    let bruh = gridSpace * res;

    gridSetter = (window.innerWidth / 2 - me.info.x * res % bruh) % bruh - 25 * res;
    while (gridSetter <= window.innerWidth) {
        ctx.beginPath();
        ctx.moveTo(gridSetter, 0);
        ctx.lineTo(gridSetter, window.innerHeight);
        ctx.stroke();
        gridSetter += bruh;
    }
    gridSetter = (window.innerHeight / 2 + me.info.y * res % bruh) % bruh - 25 * res;
    while (gridSetter <= window.innerHeight) {
        ctx.beginPath();
        ctx.moveTo(0, gridSetter);
        ctx.lineTo(window.innerWidth, gridSetter);
        ctx.stroke();
        gridSetter += bruh;
    }
    ctx.globalAlpha = 1;
}

function drawMap() {
    ctx.fillStyle = "#1ea761";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = "#1b9657";
    if (me.info.x < window.innerWidth / 2 / res) ctx.fillRect(0, 0, (window.innerWidth / 2 / res - me.info.x - 25) * res, window.innerHeight);
    if (me.info.y < window.innerHeight / 2 / res) ctx.fillRect(0, window.innerHeight - ((window.innerHeight / 2 / res - me.info.y - 25) * res), window.innerWidth, (window.innerHeight / 2 / res - me.info.y - 25) * res);
    if (me.info.x > me.roomInfo.x - window.innerWidth / 2 / res) ctx.fillRect(window.innerWidth - ((window.innerWidth / 2 / res - 25 - (me.roomInfo.x - me.info.x)) * res), 0, (window.innerWidth / 2 / res + 25 - (me.roomInfo.x - me.info.x)) * res, window.innerHeight)
    if (me.info.y > me.roomInfo.y - window.innerHeight / 2 / res) ctx.fillRect(0, 0, window.innerWidth, (me.info.y - 25 - (me.roomInfo.y - window.innerHeight / 2 / res)) * res);
}

function drawHelper() {
    if (!(me.settings.helper && !me.settings.keyboard)) return;
    let d = Math.sqrt(
        Math.pow(me.info.mouseX - window.innerWidth / 2, 2) + 
        Math.pow(me.info.mouseY - window.innerHeight / 2, 2)
    )
    ctx.globalAlpha = 0.2 * ((d / res / 200 > 1) ? 1 : (d / res / 200));
    ctx.lineWidth = 17.5 * res;

    let start = {
        x: me.info.mouseX - window.innerWidth / 2,
        y: me.info.mouseY - window.innerHeight / 2
    };
    if (start.x === 0) {
        start.y /= Math.abs(me.info.mouseY - window.innerHeight / 2);
    } else {
        start.x /= Math.abs(me.info.mouseX - window.innerWidth / 2);
        start.y /= Math.abs(me.info.mouseX - window.innerWidth / 2);
    }

    let distance = Math.sqrt(Math.pow(start.x, 2) + Math.pow(start.y, 2));
    start.x /= distance;
    start.y /= distance;
    start.x *= 30;
    start.y *= 30;

    ctx.beginPath();
    ctx.moveTo(window.innerWidth / 2 + start.x, window.innerHeight / 2 + start.y);
    ctx.lineTo(me.info.mouseX, me.info.mouseY);
    ctx.stroke();

    ctx.globalAlpha = 1;
}

function drawMinimap() {
    ctx.globalAlpha = 0.25;

    // Border
    ctx.fillStyle = "#30443a";
    ctx.beginPath();
    ctx.roundRect(
        window.innerWidth - mmWidth - 56 * res, 
        window.innerHeight - mmHeight - 56 * res,
        mmWidth + 12 * res, 
        mmHeight + 12 * res, 
        6
    )
    ctx.fill();

    // Interior
    ctx.fillStyle = "#1ea660";
    ctx.roundRect(
        window.innerWidth - mmWidth - 50 * res, 
        window.innerHeight - mmHeight - 50 * res, 
        mmWidth, 
        mmHeight, 
        6
    );
    ctx.fill();
    ctx.closePath();

    // Yellow circle
    let circlePos = {
        x: (window.innerWidth - 50 * res - (mmWidth + circlePlane.x) / 2) + (me.info.x / me.roomInfo.x * circlePlane.x),
        y: (window.innerHeight - 50 * res - (mmHeight + circlePlane.y) / 2) + (circlePlane.y - me.info.y / me.roomInfo.y * circlePlane.y)
    }

    ctx.beginPath();
    ctx.fillStyle = "#dddc62";
    ctx.arc(circlePos.x, circlePos.y, circleRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath()

    ctx.fillStyle = "#dddd63";
    ctx.beginPath();
    if (circleRadius - 4 > 0) {
        ctx.arc(circlePos.x, circlePos.y, circleRadius - 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.closePath();

    ctx.globalAlpha = 1;
}

function calculateRelPos(pos, axis) {
    if (axis === "x") return window.innerWidth / 2 + pos * res - me.info.x * res;
    else return window.innerHeight / 2 - pos * res + me.info.y * res;
}

function render(data, i) {
    data.petals.forEach(p => {
        ctx.beginPath();
        switch (p.id) {
            case 1:
                ctx.fillStyle = "#afc3b6";
                ctx.arc(
                    calculateRelPos(p.x, "x"),
                    calculateRelPos(p.y, "y"),
                    p.radius * res, 0, 2 * Math.PI
                );
                ctx.fill();
                ctx.closePath();

                ctx.beginPath();
                ctx.fillStyle = "#ffffff";
                ctx.arc(
                    calculateRelPos(p.x, "x"),
                    calculateRelPos(p.y, "y"),
                    (p.radius - 2) * res, 0, 2 * Math.PI
                );
                ctx.fill();
        }
        ctx.closePath()
    });
    if (!i) {
        let p = new Player(data.name, window.innerWidth / 2, window.innerHeight / 2, gridSpace / 2 * res);
        p.draw(false);
    } else {
        let p = new Player(data.name, calculateRelPos(data.x, "x"), calculateRelPos(data.y, "y"), gridSpace / 2 * res);
        p.draw(true);
    }
}

// Event Listeners

// Creating Games
make.addEventListener("click", () => {
    join.hidden = true;
    make.hidden = true;
    inputCreate.hidden = false;
    createSubmit.hidden = false;
    back.hidden = false;

    roomSettingsContainer.hidden = false;
    inputX.hidden = false;
    inputY.hidden = false;
    by.hidden = false;
    units.hidden = false;
});
createSubmit.addEventListener("click", () => {
    ws.send(JSON.stringify(["a", "a", inputCreate.value, inputX.value, inputY.value]));
});

// Joining games
join.addEventListener("click", () => {
    join.hidden = true;
    make.hidden = true;
    inputJoin.hidden = false;
    joinSubmit.hidden = false;
    back.hidden = false;
});
joinSubmit.addEventListener("click", () => {
    ws.send(JSON.stringify(["a", "b", inputJoin.value]));
});

nname.addEventListener("keydown", (key) => {
    if (key.code === "Enter") {

        // You join game
        body.style.backgroundColor = "transparent";
        title.hidden = true;
        subtitle.hidden = true;
        systemText.hidden = true;
        nname.hidden = true;
        back.hidden = true;
        nname.hidden = true;
        roomID.hidden = true;
        discord.hidden = true;
        github.hidden = true;
        florr.hidden = true;
        ws.send(JSON.stringify(`b${nname.value}`));
        ws.send(JSON.stringify(["c", "d", me.info.mouseX - window.innerWidth / 2, window.innerHeight - ((me.info.mouseY - window.innerHeight / 2) + window.innerHeight / 2) - window.innerHeight / 2, res]));
    }
});

back.addEventListener("click", () => {
    systemText.hidden = true;
    if (!nname.hidden) {
        nname.hidden = true;
        roomID.hidden = true;
        roomContainer.hidden = true;
        back.style.top = "auto";
        back.style.bottom = "11.5vh";
        back.style.right = "auto";
        back.style.width = "80px";
        back.innerHTML = "back";
        ws.send(JSON.stringify("ac"));
    }
    systemText.style.bottom = "28.5vh";
    systemText.style.width = "160px";
    back.hidden = true;
    inputCreate.hidden = true;
    createSubmit.hidden = true;
    inputJoin.hidden = true;
    joinSubmit.hidden = true;

    roomSettingsContainer.hidden = true;
    inputX.hidden = true;
    inputY.hidden = true;
    by.hidden = true;
    units.hidden = true;

    join.hidden = false;
    make.hidden = false;
});

keyboard.addEventListener("click", () => {
    ws.send(JSON.stringify("cc"));
    if (me.settings.keyboard) {
        keyboard.style.backgroundColor = "#666666";
    } else {
        keyboard.style.backgroundColor = "#dddddd";
    }
    me.settings.keyboard = !me.settings.keyboard;
});
helper.addEventListener("click", () => {
    if (me.settings.helper) {
        helper.style.backgroundColor = "#666666";
    } else {
        helper.style.backgroundColor = "#dddddd";
    }
    me.settings.helper = !me.settings.helper;
});

document.addEventListener("keydown", (key) => {
    ws.send(JSON.stringify(`ca${key.code}`));
    if (key.code === "Semicolon") {
        if (extraInfo) {
            perf.hidden = true
            extraInfo = false;
            performance.ping = undefined;
        } else {
            perf.hidden = false;
            extraInfo = true;
            performing();
        }
    }
});
document.addEventListener("keyup", key => ws.send(JSON.stringify(`cb${key.code}`)));
window.addEventListener("contextmenu", c => {
    c.preventDefault();
});
window.addEventListener("mousedown", click => {
    if (click.button === 1) click.preventDefault();
    ws.send(JSON.stringify(`ca${click.button}`));
});
window.addEventListener("mouseup", click => ws.send(JSON.stringify(`cb${click.button}`)));
document.addEventListener("mousemove", (pos) => {
    if (title.hidden) ws.send(JSON.stringify(["c", "d", pos.x - window.innerWidth / 2, window.innerHeight - ((pos.y - window.innerHeight / 2) + window.innerHeight / 2) - window.innerHeight / 2, res]));
    me.info.mouseX = pos.x;
    me.info.mouseY = pos.y;
});

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    res = (window.innerWidth / 1920 > window.innerHeight / 1080) ? window.innerWidth / 1920 : window.innerHeight / 1080;
    ctx.textAlign = "center";
    if (title.hidden) {
        drawMap();
        drawGrid();
        allPlayers.forEach((data, i) => render(data, i));
        drawHelper();

        mms = (me.roomInfo.x > me.roomInfo.y) ? [me.roomInfo.y / me.roomInfo.x, "x"] : [me.roomInfo.x / me.roomInfo.y, "y"];
        mmWidth = (mms[1] === "x") ? 260 * res : mms[0] * 260 * res;
        mmHeight = (mms[1] === "y") ? 260 * res : mms[0] * 260 * res;
        circleRadius = Math.max((mmWidth > mmHeight) ? mmHeight / 15 : mmWidth / 15, 5);
        circlePlane = {
            x: Math.max(mmWidth - (circleRadius * 2), 2),
            y: Math.max(mmHeight - (circleRadius * 2), 2)
        }
        drawMinimap();
    }
});

ws.onopen = () => console.log("Websocket Sucessfully Opened");

// When messages are recieved
ws.onmessage = message => {
    let msg = JSON.parse(message.data);
    // console.log(msg);
    switch (msg[0]) {

        // Creating/joining rooms
        case "a":
            let msgRoom = msg[3];
            switch (msg[1]) {

                // Creating rooms
                case "a":
                    if (msg[2] === "a") {
                        systemText.innerHTML = `room created`;
                        roomID.innerHTML = `current room is ${msgRoom}`;

                        me.roomInfo = msg[4];
                        mms = (msg[4].x > msg[4].y) ? [msg[4].y / msg[4].x, "x"] : [msg[4].x / msg[4].y, "y"];
                        mmWidth = (mms[1] === "x") ? 260 * res : mms[0] * 260 * res;
                        mmHeight = (mms[1] === "y") ? 260 * res : mms[0] * 260 * res;
                        circleRadius = Math.max((mmWidth > mmHeight) ? mmHeight / 15 : mmWidth / 15, 5);
                        circlePlane = {
                            x: mmWidth - (circleRadius * 2),
                            y: mmHeight - (circleRadius * 2)
                        }
                        if (circlePlane.x < 2) circlePlane.x = 2;
                        if (circlePlane.y < 2) circlePlane.y = 2;

                        inputCreate.hidden = true;
                        createSubmit.hidden = true;

                        roomSettingsContainer.hidden = true;
                        inputX.hidden = true;
                        inputY.hidden = true;
                        by.hidden = true;
                        units.hidden = true;

                        nname.hidden = false;
                        systemText.hidden = false;
                        roomID.hidden = false;
                        roomContainer.hidden = false;

                        back.style.bottom = "0vh";
                        back.style.top = "59.3vh";
                        back.innerHTML = "leave room"
                        back.style.width = "140px";
                        back.style.right = "10vh";

                        systemText.style.bottom = "14vh";
                        systemText.style.width = "140px";
                    } else {
                        systemText.innerHTML = `room ${msgRoom} already exists`;
                        systemText.hidden = false;
                        systemText.style.bottom = "11vh";
                        systemText.style.width = "200px";
                    }
                    break;

                // Joining rooms    
                case "b":
                    if (msg[2] === "a") {
                        systemText.innerHTML = `room joined`;
                        roomID.innerHTML = `current room is ${msgRoom}`;

                        me.roomInfo = msg[4];
                        mms = (msg[4].x > msg[4].y) ? [msg[4].y / msg[4].x, "x"] : [msg[4].x / msg[4].y, "y"];
                        mmWidth = (mms[1] === "x") ? 260 * res : mms[0] * 260 * res;
                        mmHeight = (mms[1] === "y") ? 260 * res : mms[0] * 260 * res;
                        circleRadius = Math.max((mmWidth > mmHeight) ? mmHeight / 15 : mmWidth / 15, 5);
                        circlePlane = {
                            x: mmWidth - circleRadius * 2,
                            y: mmHeight - circleRadius * 2
                        }
                        if (circlePlane.x < 2) circlePlane.x = 2;
                        if (circlePlane.y < 2) circlePlane.y = 2;
                        
                        inputJoin.hidden = true;
                        joinSubmit.hidden = true;
                        nname.hidden = false;
                        systemText.hidden = false;
                        roomID.hidden = false;
                        roomContainer.hidden = false;

                        back.style.bottom = "0vh";
                        back.style.top = "59.3vh";
                        back.innerHTML = "leave room"
                        back.style.width = "140px";
                        back.style.right = "10vh";

                        systemText.style.bottom = "14vh";
                        systemText.style.width = "140px";
                    } else {
                        systemText.innerHTML = `room ${msgRoom} does not exist`;
                        systemText.hidden = false;
                        systemText.style.bottom = "11vh";
                        systemText.style.width = "200px";
                    }
                    break;
            }
            break;

        // Game data
        case "b":

            // Clearing canvas
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            // Getting your coordinates
            me.info.x = msg[1][0].x;
            me.info.y = msg[1][0].y;

            drawMap();
            drawGrid();

            // Drawing players
            allPlayers = msg[1];
            msg[1].forEach((data, i) => {
                render(data, i);
            });
            drawHelper();
            drawMinimap();
            break;

        // Ping
        case "p":
            if (msg === "pong") {
                performance.ping = new Date().getTime() - performance.pingCalc;
                perf.innerHTML = `${performance.ping} ms ping`;
                if (extraInfo) window.setTimeout(performing, 300);
            }
            break;
    }
}