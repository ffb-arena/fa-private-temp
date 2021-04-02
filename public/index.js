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
let me, res, gridSetter, showPerformance, allPlayers, mms, mmHeight, mmWidth, circleRadius, circlePlane;
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
allPlayers = [];
res = (window.innerWidth / 1920 > window.innerHeight / 1080) ? window.innerWidth / 1920 : window.innerHeight / 1080;
showPerformance = false;


// Event Listeners
window.addEventListener("contextmenu", c => {
    c.preventDefault();
});

window.addEventListener("resize", () => {
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    res = (window.innerWidth / 1920 > window.innerHeight / 1080) ? window.innerWidth / 1920 : window.innerHeight / 1080;
    ctx.textAlign = "center";
    if (title.hidden) { // if in game
        drawMap();
        drawGrid();
        allPlayers.forEach((data, i) => renderPlayer(data, i));
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

// event listeners only get added when ws opens
function addEventListeners() {
    document.addEventListener("keydown", (key) => {
        ws.send(JSON.stringify(`ca${key.code}`));
        if (key.code === "Semicolon") {
            if (showPerformance) {
                perf.hidden = true
                showPerformance = false;
                performance.ping = undefined;
            } else {
                perf.hidden = false;
                showPerformance = true;
                performing();
            }
        }
    });
    document.addEventListener("keyup", key => ws.send(JSON.stringify(`cb${key.code}`)));
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
}

let loop;
function mainLoop() {
    // Clearing canvas
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    drawMap();
    drawGrid();

    // Drawing players
    allPlayers.forEach((data, i) => renderPlayer(data, i));

    drawHelper();
    drawMinimap();
    loop = requestAnimationFrame(mainLoop);
}