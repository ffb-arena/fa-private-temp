// Constants
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let levelOn = true;
function toggleFunc(element) {
    const x = document.getElementById(element);
    x.hidden = !x.hidden;
    switch (element) {
        case "level":
            levelOn = !levelOn;
            break;
        case "settings-container":
            changelogContainer.hidden = true;
            break;
        case "changelog-container":
            settingsContainer.hidden = true;
            break;
    }
}

const gridSpace = 50;
const spaceBetweenPingUpdates = 1000; // ms
const performance = {
    ping: {
        pings: [],
        ping: [],
    },
    lastChecked: Date.now() + spaceBetweenPingUpdates,
    hidden: true,
    fps: {
        fpsArray: [],
        fps: [],
        oldTime: Date.now(),
        newTime: undefined
    }
};

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.textAlign = "center";

window.onbeforeunload = () => { return "Are you sure you want to leave this page?" };
ctx.lineJoin = "bevel";
ctx.miterLimit = 2;

// Variables
let me, res, gridSetter, allPlayers, mms, mmHeight, mmWidth, circleRadius, circlePlane, debug, deadPetal;
me = {
    roomInfo: {
        x: 0,
        y: 0
    },
    info: {
        x: 0,
        y: 0,
        mouseX: 0,
        mouseY: 0,
        level: undefined,
        hotbar: [],
        inventory: []
    },
    settings: {
        keyboard: false,
        helper: false
    }
};
allPlayers = [];
debug = [];
res = (window.innerWidth / 1920 > window.innerHeight / 1080) ? window.innerWidth / 1920 : window.innerHeight / 1080;
deadPetals = [];

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
    document.addEventListener("keydown", key => {
        ws.send(JSON.stringify(`ca${key.code}`));
        // stopping the tab selecting stuff
        if (key.code === "Tab") {
            key.preventDefault();
        }

        // showing/hiding performance stats
        if (key.code === "Semicolon") {
            performance.hidden = !performance.hidden;
        }

        // if on death screen and enter is pressed
        if (key.code === "Enter" && deathScreen.length) {
            returnToMenu();
            deathScreen = [];
        }
    });
    document.addEventListener("keyup", key => ws.send(JSON.stringify(`cb${key.code}`)));
    window.addEventListener("mousedown", click => {
        if (click.button === 1) click.preventDefault();
        ws.send(JSON.stringify(`ca${click.button}`));
    });
    window.addEventListener("mouseup", click => ws.send(JSON.stringify(`cb${click.button}`)));


    document.addEventListener("mousemove", pos => {
        if (title.hidden) {
            if (
                window.innerWidth / 2 - inventoryWidth / 2 < pos.x && pos.x < window.innerWidth / 2 + inventoryWidth / 2
                &&
                window.innerHeight - inventoryHeight < pos.y && pos.y < window.innerHeight
            ) {
                ws.send(JSON.stringify(["c", "d", 0, 0, res]));
                stopText.innerHTML = "You can also use [Q] and [E] to modify the inventory";
            } else {
                stopText.innerHTML = "Move mouse here to disable movement";
                ws.send(JSON.stringify([
                    "c", 
                    "d", 
                    pos.x - window.innerWidth / 2, 
                    window.innerHeight - ((pos.y - window.innerHeight / 2) + window.innerHeight / 2) - window.innerHeight / 2, 
                    res
                ]));    
            }
        } else {
            setLevelText(); // from src/menu.js
        }
        me.info.mouseX = pos.x;
        me.info.mouseY = pos.y;
    });
}

let loop;
let deathScreen = [];
function mainLoop() {
    performance.fps.newTime = Date.now();
    performance.fps.fpsArray.push(1 / (((performance.fps.newTime - performance.fps.oldTime) / 1000) || 1));

    // Clearing canvas
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // ping stuff
    ws.send(JSON.stringify(["ping", Date.now()]));
    if (performance.lastChecked < Date.now()) {
        performance.lastChecked = Date.now() + spaceBetweenPingUpdates;

        if (performance.ping.pings.length) {
            performance.ping.ping[0] = performance.ping.pings.reduce((a, b) => (a + b)) / performance.ping.pings.length;
            performance.ping.ping[1] = Math.min(...performance.ping.pings);
            performance.ping.ping[2] = Math.max(...performance.ping.pings);
            performance.ping.pings = [];
        }

        performance.fps.fps[0] = performance.fps.fpsArray.reduce((a, b) => (a + b)) / performance.fps.fpsArray.length;
        performance.fps.fps[1] = Math.min(...performance.fps.fpsArray);
        performance.fps.fps[2] = Math.max(...performance.fps.fpsArray);
        performance.fps.fpsArray = [];
    }

    drawMap();
    drawGrid();

    // Drawing players
    allPlayers.forEach((data, i) => renderPlayer(data, i));

    drawHelper();
    drawMinimap();
    drawPerformance();
    drawDebug();

    // drawing dead petals
    let deadDeadPetals = [];
    deadPetals.forEach((deadPetal, i) => {
        if (deadPetal.update()) {
            deadDeadPetals.push(i);
        }
    });
    deadDeadPetals.forEach((i, n) => {
        deadPetals.splice(i - n, 1);
    });

    // drawing death screen
    if (!deathScreen.length) {
        drawInventory();
    } else {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.globalAlpha = 1;

        ctx.lineWidth = 7 * res;
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#ffffff";
        ctx.font = "30px Ubuntu"
        ctx.strokeText("You died : (", window.innerWidth / 2, window.innerHeight * 4/10);
        ctx.fillText("You died : (", window.innerWidth / 2, window.innerHeight * 4/10);

        ctx.lineWidth = 3 * res;
        ctx.strokeStyle = "#000000";
        ctx.font = "15px Ubuntu"
        
        ctx.strokeText(`Time alive: ${deathScreen[0]}ms`, window.innerWidth / 2, window.innerHeight * 6/10);
        ctx.fillText(`Time alive: ${deathScreen[0]}ms`, window.innerWidth / 2, window.innerHeight * 6/10);

        ctx.strokeText(`Level: ${deathScreen[1]}`, window.innerWidth / 2, window.innerHeight * 6.5/10);
        ctx.fillText(`Level: ${deathScreen[1]}`, window.innerWidth / 2, window.innerHeight * 6.5/10);

        ctx.strokeText("(press enter to return to menu)", window.innerWidth / 2, window.innerHeight * 7/10);
        ctx.fillText("(press enter to return to menu)", window.innerWidth / 2, window.innerHeight * 7/10);
    }

    performance.fps.oldTime = performance.fps.newTime;

    loop = requestAnimationFrame(mainLoop);
}