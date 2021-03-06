// Constants
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const gridSpace = 50;
const spaceBetweenPingUpdates = 1000; // ms
const perf = {
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

canvas.width = ww;
canvas.height = wh + 10; // add extra because doesn't seem to be all height?
ctx.textAlign = "center";


window.onbeforeunload = () => "Are you sure you want to leave this page?";
ctx.lineJoin = "bevel";
ctx.miterLimit = 2;

// Variables
let me, res, gridSetter, allPlayers, mms, mmHeight, mmWidth, circleRadius, circlePlane, debug, deadPetals, radii, loadout, nOfPetals, playerR, loads;
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
    },
	mouseMenu: {
		id: undefined,
		onAnIcon: false
	}
};
allPlayers = [];
debug = [];
res = (ww / 1920 > wh / 1080) ? ww / 1920 : wh / 1080;
deadPetals = [];
radii = {};
loadout = window.localStorage.loadout
		? JSON.parse(window.localStorage.loadout)
		: { hb: [1, 1, 1, 1, 1, 1, 1, 1], inv: [2, 1, 0, 0, 0, 0, 0, 0] };
stopText = "Move mouse here to disable movement";
loads = [false, false];

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
    backgroundCanvas.width = ww;
    backgroundCanvas.height = wh;
    canvas.width = ww;
    canvas.height = wh + 10; // needs a bit extra for some reason, otherwise isn't high enough
	petalDraggingCanvas.width = ww;
	petalDraggingCanvas.height = wh;
    res = (ww / 1920 > wh / 1080) ? ww / 1920 : wh / 1080;
    ctx.textAlign = "center";
	petalCtx.textAlign = "center";

    if (menuDiv.hidden) { // if in game
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
    } else {
		drawBackground();
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

function finishLoad() {
	if (!(loads[0] && loads[1])) return; // [0] is ws open, [1] is all HTML loaded
    document.getElementById("loading").remove();
	addEventListeners();
	startBackground();
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
            perf.hidden = !perf.hidden;
        }

        // if on death screen and enter is pressed
        if (key.code === "Enter" && deathScreen.length) {
            returnToMenu();
            deathScreen = [];
			menuLoopVar = requestAnimationFrame(menuLoop);
        }

		// swapping all petals
		if (key.code === "KeyX") {
			for (let i = 0; i < me.info.hotbar.length; i++) {
				const inventoryCooldown = me.info.inventoryCooldowns[i] < Date.now();
				const hotbarCooldown = me.info.hotbarCooldowns[i] < Date.now();
				const isDiffPetals = me.info.hotbar[i] !== me.info.inventory[i];	
				if (inventoryCooldown && hotbarCooldown && isDiffPetals) {
					swapPetals(i, i);
					if (numInfo) {
						updateSelectedPetal(1, true);
						unselectTime = Date.now() + 5000;
					}
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
			if (me.mouseMenu.onAnIcon) {
				menuHoldingPetal.canvas.hidden = false;
				menuHoldingPetal.setPetal(me.mouseMenu.id);
				if (menuHoldingPetal.fromLoadout) {
					// make petal not render in loadout (it's being held)
					let loadoutColumn = menuHoldingPetal.column === 0 ? loadout.hb : loadout.inv;
					loadoutColumn[menuHoldingPetal.row] = 0;
					drawLoadout();
				}
			}
		}
    });
    window.addEventListener("mouseup", click => {
		ws.send(JSON.stringify(`cb${click.button}`));
		if (click.button === 0) {
			if (menuHoldingPetal.id) {
				if (menuHoldingPetal.snapping) {
					// move (snapping) holding petal to new spot
					if (menuHoldingPetal.fromLoadout) {
						// swap holding petal and whatever it's snapping with
						let snapColumn = menuHoldingPetal.snapColumn === 0 ? loadout.hb : loadout.inv;
						let fromColumn = menuHoldingPetal.column === 0 ? loadout.hb : loadout.inv;
						const snapID = snapColumn[menuHoldingPetal.snapRow];
						fromColumn[menuHoldingPetal.row] = snapID;
						snapColumn[menuHoldingPetal.snapRow] = menuHoldingPetal.id;
					} else {
						let loadoutColumn = menuHoldingPetal.snapColumn === 0 ? loadout.hb : loadout.inv;
						loadoutColumn[menuHoldingPetal.snapRow] = menuHoldingPetal.id;
					}	
				} else if (menuHoldingPetal.fromLoadout) {
					// "reset" petal to where it came from
					let loadoutColumn = menuHoldingPetal.column === 0 ? loadout.hb : loadout.inv;
					loadoutColumn[menuHoldingPetal.row] = menuHoldingPetal.id;
				}
				drawLoadout();
			}
			menuHoldingPetal.setPetal(0);
			menuHoldingPetal.canvas.hidden = true;
			me.info.leftMouseDown = false;
		}
	});


    document.addEventListener("mousemove", pos => {
        me.info.mouseX = pos.x;
        me.info.mouseY = pos.y;
        if (!menuDiv.hidden) { // if on menu
            setLevelText(); // from src/menu.js

			// inventory dragging stuff
			me.mouseMenu.onAnIcon = false;
			menuHoldingPetal.snapping = false;
			let galleryCoords = galleryCanvas.getBoundingClientRect();
			let loadoutCoords = loadoutCanvas.getBoundingClientRect();
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
	
					me.mouseMenu.id = sorted[index];
					if (!menuHoldingPetal.id) {
						menuHoldingPetal.fromLoadout = false;
						menuHoldingPetal.row = row;
						menuHoldingPetal.column = column;
					}
					me.mouseMenu.onAnIcon = true;
				}
			} else if (pointInBox(pos, loadoutCoords)) {
				const XOffset = ldIconXSpace / 2 + loadoutCoords.x;
				const YOffset = ldIconYSpace / 2 + loadoutCoords.y;
				if (
					((pos.x - XOffset) % (ldIconWidth + ldIconXSpace)) < ldIconWidth 
					&& 
					((pos.y - YOffset) % (ldIconWidth + ldIconYSpace)) < ldIconWidth
				) {
					const row = Math.floor((pos.y - YOffset) / (ldIconWidth + ldIconYSpace));
					const column = Math.floor((pos.x - XOffset) / (ldIconWidth + ldIconXSpace));
					if (row < 0 || column < 0) return;
					if (row >= 8 || column >= 2) return;
	
					let id;
					if (column === 0) {
						// hotbar
						if (row >= loadout.hb.length) return;
						id = loadout.hb[row];
					} else {
						// inventory
						id = loadout.inv[row];
					}
					me.mouseMenu.id = id;
					if (!menuHoldingPetal.id) {
						menuHoldingPetal.fromLoadout = true;
						menuHoldingPetal.row = row;
						menuHoldingPetal.column = column;
					} else if (
							(id !== menuHoldingPetal.id) &&
							( !(row === menuHoldingPetal.row && column === menuHoldingPetal.column) 
							|| menuHoldingPetal.fromLoadout === false )
						) {
						menuHoldingPetal.snapping = true;
						menuHoldingPetal.snapRow = row;
						menuHoldingPetal.snapColumn = column;
						menuHoldingPetal.snapPos.x = loadoutCoords.x + ldIconWidth * column + (column + 0.5) * ldIconXSpace;
						menuHoldingPetal.snapPos.y = loadoutCoords.y + ldIconWidth * row + (row + 0.5) * ldIconYSpace;
					}
					if (id === 0) return;
					me.mouseMenu.onAnIcon = true;
				}
			}
        } else {
			ws.send(JSON.stringify([
				"c", 
				"d", 
				me.info.mouseX - ww / 2, 
				wh - ((me.info.mouseY - wh / 2) + wh / 2) - wh / 2, 
				res
			]));    
		}
    });
}

let loop;
let deathScreen = [];
function mainLoop() {
    perf.fps.newTime = Date.now();
    perf.fps.fpsArray.push(1 / (((perf.fps.newTime - perf.fps.oldTime) / 1000) || 1));

    clear(ctx);

    // ping stuff
    ws.send(JSON.stringify(["ping", Date.now()]));
    if (perf.lastChecked < Date.now()) {
        perf.lastChecked = Date.now() + spaceBetweenPingUpdates;

        if (perf.ping.pings.length) {
            perf.ping.ping[0] = perf.ping.pings.reduce((a, b) => (a + b)) / perf.ping.pings.length;
            perf.ping.ping[1] = Math.min(...perf.ping.pings);
            perf.ping.ping[2] = Math.max(...perf.ping.pings);
            perf.ping.pings = [];
        }

        perf.fps.fps[0] = perf.fps.fpsArray.reduce((a, b) => (a + b)) / perf.fps.fpsArray.length;
        perf.fps.fps[1] = Math.min(...perf.fps.fpsArray);
        perf.fps.fps[2] = Math.max(...perf.fps.fpsArray);
        perf.fps.fpsArray = [];
    }

    if (menuDiv.hidden) { // if in game
        drawMap(); drawGrid();
        allPlayers.forEach((data, i) => renderPlayer(data, i));
        drawHelper(); drawMinimap(); drawPerformance(); drawDebug();
		deadPetals = deadPetals.filter(p => p.update());
        // drawing death screen
        if (!deathScreen.length) {
            drawInventory();
        } else {
			numInfo = false;
			drawDeathScreen(ctx, deathScreen[0], deathScreen[1]);
        }
    }
    perf.fps.oldTime = perf.fps.newTime;
    loop = requestAnimationFrame(mainLoop);
}


let menuLoopVar;
function menuLoop() {
	menuHoldingPetal.clear();
	if (menuHoldingPetal.id) {
		menuHoldingPetal.setPos(me.info.mouseX, me.info.mouseY);
		menuHoldingPetal.draw();
	}
	if (menuHoldingPetal.id || me.mouseMenu.onAnIcon) {
		body.style.cursor = "pointer";
	} else body.style.cursor = "auto";

    menuLoopVar = requestAnimationFrame(menuLoop);
}
menuLoopVar = requestAnimationFrame(menuLoop);
