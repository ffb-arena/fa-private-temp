// Constants
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let levelHidden = true;
let galleryHidden = true;
let loadoutHidden = true;
function toggleFunc(element) {
    const x = document.getElementById(element);
    x.hidden = !x.hidden;
    switch (element) {
        case "level":
            levelHidden = !levelHidden;
            break;
		case "gallery-container":
			galleryHidden = !galleryHidden;
			break;
		case "loadout-container":
			loadoutHidden = !loadoutHidden;
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


window.onbeforeunload = () => "Are you sure you want to leave this page?";
ctx.lineJoin = "bevel";
ctx.miterLimit = 2;

// Variables
let me, res, gridSetter, allPlayers, mms, mmHeight, mmWidth, circleRadius, circlePlane, debug, deadPetals, radii, loadout, nOfPetals;
me = {
	swapCooldown: undefined,
    roomInfo: {
        x: 0,
        y: 0
    },
    info: {
        x: 0,
        y: 0,
        mouseX: 0,
        mouseY: 0,
		leftMouseDown: false,
		justClicked: false,
        level: undefined,
        hotbar: [],
        inventory: [],
		hotbarCooldowns: [],
		inventoryCooldowns: []
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
radii = {};
loadout = {
	hb: [1, 1, 1, 1, 1, 1, 1, 1],
	inv: [2, 1, 0, 0, 0, 0, 0, 0]
};

stopText = "Move mouse here to disable movement";

function pointInBox(point, box) {
	return (
		box.x < point.x && point.x < box.x + box.width
		&&
		box.y < point.y && point.y < box.y + (box.height || box.width)
	);
}

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

// checkCurrent is optional param
// if present (and truthy), it means to check
// whatever selectedPetal currently is
// otherwise, it starts checking at selectedPetal + 1
function updateSelectedPetal(interval, checkCurrent) {
	numInfo = true;
	if (checkCurrent) {
		if (me.info.inventory[selectedPetal] !== 0) return;
	}
	for (let i = 0; i < 8; i++) {
		selectedPetal += interval;
		if (selectedPetal >= 8) selectedPetal %= 8;
		while (selectedPetal < 0) selectedPetal += 8;
		if (me.info.inventory[selectedPetal] !== 0) return;
	}
	
	// if the hotbar is completely empty
	numInfo = false;
}

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

		// swapping all petals
		if (key.code === "KeyX") {
			unselectTime = Date.now() + 5000;
			for (let i = 0; i < me.info.hotbar.length; i++) {
				const inventoryCooldown = me.info.inventoryCooldowns[i] < Date.now();
				const hotbarCooldown = me.info.hotbarCooldowns[i] < Date.now();
				const isDiffPetals = me.info.hotbar[i] !== me.info.inventory[i];	
				if (inventoryCooldown && hotbarCooldown && isDiffPetals) {
					swapPetals(i, i);
					updateSelectedPetal(1, true);
				}
			}
		}

		// hiding numbers
		if (key.code === "Escape") {
			numInfo = false;
		}	
		// going into key inventory mode
		if (key.code === "KeyQ" || key.code === "KeyE") {
			if (!numInfo) {
				numInfo = true;
				selectedPetal = 0;
				updateSelectedPetal(1, true);
			} else {
				if (key.code === "KeyQ") {
					updateSelectedPetal(-1);
				} else {
					updateSelectedPetal(1);
				}	
			}
			unselectTime = Date.now() + 5000; // unselect in 5000 ms
		}

		// switching petals
		for (let i = 1; i < me.info.hotbar.length + 1; i++) {
			if (key.code === `Digit${i}`) {
				const hotbarSlot = i - 1;
				if (!numInfo) {
					numInfo = true;
					selectedPetal = 0;
				}
				const inventoryCooldown = me.info.inventoryCooldowns[selectedPetal] < Date.now();
				const hotbarCooldown = me.info.hotbarCooldowns[hotbarSlot] < Date.now();
				const isDiffPetals = me.info.hotbar[hotbarSlot] !== me.info.inventory[selectedPetal];	
				if (inventoryCooldown && hotbarCooldown && isDiffPetals) {
					swapPetals(selectedPetal, hotbarSlot);
					updateSelectedPetal(1, true);
				}
				unselectTime = Date.now() + 5000;
			}
		}
    });
    document.addEventListener("keyup", key => ws.send(JSON.stringify(`cb${key.code}`)));
    window.addEventListener("mousedown", click => {
        if (click.button === 1) click.preventDefault();
        ws.send(JSON.stringify(`ca${click.button}`));
		if (click.button === 0) {
			me.info.leftMouseDown = true;
			me.info.justClicked = true;
		}
    });
    window.addEventListener("mouseup", click => {
		ws.send(JSON.stringify(`cb${click.button}`));
		if (click.button === 0) me.info.leftMouseDown = false;
	});


    document.addEventListener("mousemove", pos => {
        me.info.mouseX = pos.x;
        me.info.mouseY = pos.y;
        if (!title.hidden) {
            setLevelText(); // from src/menu.js

			// inventory dragging stuff
			let galleryCoords = galleryCanvas.getBoundingClientRect();
			let loadoutCoords = loadoutCanvas.getBoundingClientRect();
			let pointerCursor = false;
			if (pointInBox(pos, galleryCoords)) {
				const XOffset = spaceBetweenGalleryIcons / 2 + galleryCoords.x;
				const YOffset = spaceBetweenGalleryIcons / 2 + galleryCoords.y;
				if (
					((pos.x - XOffset) % (galleryIconWidth + spaceBetweenGalleryIcons)) < galleryIconWidth 
					&& 
					((pos.y - YOffset) % (galleryIconWidth + spaceBetweenGalleryIcons)) < galleryIconWidth
				) {
					const row = Math.floor((pos.y - YOffset) / (galleryIconWidth + spaceBetweenGalleryIcons));
					const column = Math.floor((pos.x - XOffset) / (galleryIconWidth + spaceBetweenGalleryIcons));
					if (row < 0 || column < 0) return;
					const index = row * galleryIconsPerRow + column;
					if (index >= sorted.length) return;
	
					console.log(`Hovering over ${petalNames[sorted[index]]}`);
					pointerCursor = true;
				}
			} else if (pointInBox(pos, loadoutCoords)) {
				console.log("in loadout");
			}
			if (pointerCursor) {
				body.style.cursor = "pointer";
			} else {
				body.style.cursor = "auto";
			}
        } else {
			ws.send(JSON.stringify([
				"c", 
				"d", 
				me.info.mouseX - window.innerWidth / 2, 
				window.innerHeight - ((me.info.mouseY - window.innerHeight / 2) + window.innerHeight / 2) - window.innerHeight / 2, 
				res
			]));    
		}
    });
}

let loop;
let deathScreen = [];
function mainLoop() {
    performance.fps.newTime = Date.now();
    performance.fps.fpsArray.push(1 / (((performance.fps.newTime - performance.fps.oldTime) / 1000) || 1));

    // Clearing canvas
    clear(ctx);

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

    // if not on menu
    if (title.hidden) {
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
			numInfo = false;
			drawDeathScreen(ctx, deathScreen[0], deathScreen[1]);
        }
    }

    performance.fps.oldTime = performance.fps.newTime;

    loop = requestAnimationFrame(mainLoop);
}
