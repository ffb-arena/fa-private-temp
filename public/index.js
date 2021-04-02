// Constants
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const perf = document.getElementById("performance");

const gridSpace = 50;
const performance = {
    pingCalc: undefined,
    ping: undefined
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.textAlign = "center";

window.onbeforeunload = () => { return "Are you sure you want to leave this page?" };
ctx.lineJoin = "bevel";
ctx.miterLimit = 2;

// Variables
let me, res, gridSetter, extraInfo, allPlayers, mms, mmHeight, mmWidth, circleRadius, circlePlane;
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

// calculates position relative to you
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
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight;
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