// constants
const join = document.getElementById("join");
const make = document.getElementById("make");
const inputCreate = document.getElementById("input-create");
const inputJoin = document.getElementById("input-join");
const joinSubmit = document.getElementById("join-submit");

const createSubmit = document.getElementById("create-submit");
const changelog = document.getElementById("changelog-btn")
const gallery = document.getElementById("gallery-btn")
const levelBtn = document.getElementById("level-btn");
const level = document.getElementById("level");
const loadoutBtn = document.getElementById("loadout-btn");
const galleryContainer = document.getElementById("gallery-container");
const loadoutContainer = document.getElementById("loadout-container");

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
const changelogContainer = document.getElementById("changelog-container");
const keyboard = document.getElementById("keyboard");
const helper = document.getElementById("helper");

const levelInput = document.getElementById("level-input");
const levelText = document.getElementById("level-display");
const health = document.getElementById("health");
const bodyDamage = document.getElementById("body-damage");
const petalNum = document.getElementById("petal-num");

// icon links
const github = document.getElementById("Github");
const discord = document.getElementById("Discord");
const florr = document.getElementById("Florr");

roomSettingsContainer.hidden = true;
settingsContainer.hidden = true;
changelogContainer.hidden = true;

inputX.hidden = true;
inputY.hidden = true;
by.hidden = true;
units.hidden = true;

inputX.value = 20;
inputY.value = 20;

levelInput.value = window.localStorage.level || 45;

// stuff to do once fonts have loaded
window.addEventListener("load", () => {
	setLevelText();
});

// setting popup event listeners
changelog.addEventListener("click", () => toggleFunc("changelog-container"));
gallery.addEventListener("click", () => toggleFunc("gallery-container"));
document.getElementById("settings-btn").addEventListener("click", () => toggleFunc("settings-container"));
levelBtn.addEventListener("click", () => toggleFunc("level"));
loadoutBtn.addEventListener("click", () => toggleFunc("loadout-container"));


// Creating Games
make.addEventListener("click", () => {
    join.hidden = true;
    make.hidden = true;
    nname.hidden = true;
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
    nname.hidden = true;
    inputJoin.hidden = false;
    joinSubmit.hidden = false;
    back.hidden = false;
});
joinSubmit.addEventListener("click", () => {
    ws.send(JSON.stringify(["a", "b", inputJoin.value]));
});

nname.value = window.localStorage.name || "";
nname.addEventListener("keydown", (key) => {
    if (key.code === "Enter") {
		window.localStorage.name = nname.value;

        // You join game
		cancelAnimationFrame(menuLoopVar); // from index.js
        clearInterval(background); // from src/petal-background.js
        loop = requestAnimationFrame(mainLoop); // from index.js

        canvas.hidden = false;
        allPlayers = [];

        document.getElementById("body").style.backgroundColor = "transparent";
        document.getElementById("title").hidden = true;
        document.getElementById("subtitle").hidden = true;
        document.getElementById("noobs").hidden = true;
        systemText.hidden = true;
        nname.hidden = true;
        back.hidden = true;
        roomID.hidden = true;
		
		discord.hidden = true;
		github.hidden = true;
		florr.hidden = true;
        changelogContainer.hidden = true;
        changelog.hidden = true;
        gallery.hidden = true;
        make.hidden = true;
        join.hidden = true;
		loadoutBtn.hidden = true;
        level.hidden = true;
        levelBtn.hidden = true;
		galleryContainer.hidden = true;
		loadoutContainer.hidden = true;

        ws.send(JSON.stringify(["b", nname.value, levelInput.value, loadout.inv, loadout.hb]));
        ws.send(JSON.stringify(["c", "d", me.info.mouseX - window.innerWidth / 2, window.innerHeight - ((me.info.mouseY - window.innerHeight / 2) + window.innerHeight / 2) - window.innerHeight / 2, res]));
    }
});

back.addEventListener("click", () => {
    systemText.hidden = true;
    systemText.style.bottom = "28.5vh";
    systemText.style.width = "160px";
    inputCreate.hidden = true;
    createSubmit.hidden = true;
    inputJoin.hidden = true;
    joinSubmit.hidden = true;

    roomSettingsContainer.hidden = true;
    inputX.hidden = true;
    inputY.hidden = true;
    by.hidden = true;
    units.hidden = true;
    back.hidden = true;

    join.hidden = false;
    make.hidden = false;
    nname.hidden = false;
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



// level selector stuff
function setLevelText() {
    const level = levelInput.value;
	window.localStorage.level = level;
	nOfPetals = 5 + Math.floor(level / 15);

    ctx.font = "1.5vw Ubuntu";

    let text = `Level ${level}`;
    let width = ctx.measureText(text).width;

    levelText.innerHTML = text;
    levelText.style.width = `${width}px`;

    ctx.font = "1.1vw Ubuntu";
    text = `# of petals: ${nOfPetals}`;
    width = ctx.measureText(text).width + 1;
    petalNum.innerHTML = text;
    petalNum.style.width = `${width}px`;

    text = `health: ${round(100 + (level - 1) * 50/44, 2)}`;
    width = ctx.measureText(text).width + 1;
    health.innerHTML = text;
    health.style.width = `${width}px`;

    text = `body damage: ${round(Math.max(0, Math.min(25, (level - 8) * 25/7)), 2)}`;
    width = ctx.measureText(text).width + 1;
    bodyDamage.innerHTML = text;
    bodyDamage.style.width = `${width}px`;

	if (nOfPetals !== loadout.hb.length) {
		if (nOfPetals > loadout.hb.length) {
			for (let i = 0; i < nOfPetals - loadout.hb.length; i++) {
				loadout.hb.push(0);
			}
		} else {
			for (let i = 0; i < loadout.hb.length - nOfPetals; i++) {
				loadout.hb.pop();
			}
		}
		drawLoadout();
	}
}

const galleryCanvas = document.getElementById("gallery-canvas");
const galleryCanvasWidth = 260; 
const galleryIconWidth = 50;
const galleryIconsPerRow = 4;
galleryCanvas.width = galleryCanvasWidth;
const spaceBetweenGalleryIcons = (galleryCanvasWidth - (galleryIconWidth * galleryIconsPerRow)) / galleryIconsPerRow;
let sorted = [];
const galleryCtx = galleryCanvas.getContext("2d");
function drawGallery(radii) {
	if (!radii) return;

	// creating a sorted list
	sorted = [];
	for (let id in petalNames) {
		id = +id;
		// dev petal
		if (id <= 0) continue;
		sorted.push(id);
	}
	sorted.sort((id1, id2) => {
		const rarity1 = rarities[id1];
		const rarity2 = rarities[id2];
		if (rarity1 === rarity2) {
			// same rarity, sort alphabetically
			const name1 = petalNames[id1];
			const name2 = petalNames[id2];
			return name1 > name2 ? 1 : -1;
		}
		return rarityTiers[rarity1] < rarityTiers[rarity2] ? -1 : 1;
	});

	// drawing the gallery
	galleryCanvas.height = Math.floor((sorted.length - 1) / 3 + 1) * (galleryIconWidth + spaceBetweenGalleryIcons);
	galleryCtx.textAlign = "center";
	sorted.forEach((v, i) => {
		const row = i % galleryIconsPerRow;
		const column = Math.floor(i / galleryIconsPerRow);
		const x = spaceBetweenGalleryIcons / 2 + row * (galleryIconWidth + spaceBetweenGalleryIcons);
		const y = spaceBetweenGalleryIcons / 2 + column * (galleryIconWidth + spaceBetweenGalleryIcons);
	
		const colours = rarityColours[rarities[v]];
		drawPetalIcon({ x: x, y: y }, petalNames[v], v, galleryIconWidth, 
			colours.bg, colours.fg, 1, galleryCtx);
	});
}


const loadoutCanvas = document.getElementById("loadout-canvas");
const ldCtx = loadoutCanvas.getContext("2d");
const ldWidth = 170;
const ldHeight = 500;
loadoutCanvas.width = ldWidth;
loadoutCanvas.height = ldHeight;
ldCtx.textAlign = "center";
const ldIconWidth = 50;
const ldIconXSpace = (ldWidth - ldIconWidth * 2) / 2;
const ldIconYSpace = (ldHeight - ldIconWidth * 8) / 8;

function drawLoadout() {
	window.localStorage.loadout = JSON.stringify(loadout);
	ldCtx.clearRect(0, 0, ldWidth, ldHeight);
	// hotbar
	for (let i = 0; i < loadout.hb.length; i++) {
		const x = ldIconXSpace / 2;
		const y = ldIconYSpace / 2 + i * (ldIconYSpace + ldIconWidth);
		const id = loadout.hb[i];
        const colours = rarityColours[rarities[id]];
		drawPetalIcon({ x: x, y: y }, petalNames[id], id, ldIconWidth,
			colours.bg, colours.fg,	id === 0 ? 0.5 : 1, ldCtx);
	}	
	// inventory
	for (let i = 0; i < 8; i++) {
		const x = ldIconXSpace / 2 + ldIconWidth + ldIconXSpace;
		const y = ldIconYSpace / 2 + i * (ldIconYSpace + ldIconWidth);
		const id = loadout.inv[i];
        const colours = rarityColours[rarities[id]];
		drawPetalIcon({ x: x, y: y }, petalNames[id], id, ldIconWidth,
			colours.bg, colours.fg,	id === 0 ? 0.5 : 1, ldCtx);
	}	
}


// menu holding petal stuff (for loadout)
const petalCanvas = document.getElementById("petal-canvas");
petalCanvas.width = window.innerWidth;
petalCanvas.height = window.innerHeight;
petalCanvas.hidden = true;
const petalCtx = petalCanvas.getContext("2d"); 
petalCtx.textAlign = "center";
class MenuHoldingPetal {
	constructor() {
		this.pos = {
			x: undefined,
			y: undefined
		};
		this.width = 50;
		this.id = 0;
		this.canvas = petalCanvas;
		this.ctx = petalCtx;
		this.colours = {
			bg: undefined,
			fg: undefined
		};
		this.fromLoadout = undefined;
		this.row = undefined;
		this.column = undefined;
		this.snapping = false;
		this.snapRow = undefined;
		this.snapColumn = undefined;
		this.snapPos = { x: undefined, y: undefined };
	}
	setPetal(id) {
		this.id = id;
		this.colours = rarityColours[rarities[id]];
	}
	clear() {
		this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	}
	draw() {
		let x = this.pos.x, y = this.pos.y, width = this.width;
		if (this.snapping) {
			x = this.snapPos.x + width / 2;
			y = this.snapPos.y + width / 2;
			width += 10;
		}
		drawPetalIcon({ x: x - width / 2, y: y - width / 2}, 
			petalNames[this.id], this.id, width,
			this.colours.bg, this.colours.fg, 1, this.ctx);
	}
	setPos(x, y) {
		this.pos.x = x;
		this.pos.y = y;
	}
};
let menuHoldingPetal = new MenuHoldingPetal();


// death screen
function drawDeathScreen(c, time, level) {
	c.globalAlpha = 0.5;
	c.fillStyle = "#000000";
	c.fillRect(0, 0, window.innerWidth, window.innerHeight);
	c.globalAlpha = 1;
	
	c.lineWidth = 7 * res;
	c.strokeStyle = "#000000";
	c.fillStyle = "#ffffff";
	c.font = "30px Ubuntu"
	c.strokeText("You died : (", window.innerWidth / 2, window.innerHeight * 4/10);
	c.fillText("You died : (", window.innerWidth / 2, window.innerHeight * 4/10);
	
	c.lineWidth = 3 * res;
	c.strokeStyle = "#000000";
	c.font = "15px Ubuntu"
	
	c.strokeText(`Time alive: ${time}ms`, window.innerWidth / 2, window.innerHeight * 6/10);
	c.fillText(`Time alive: ${time}ms`, window.innerWidth / 2, window.innerHeight * 6/10);
	
	c.strokeText(`Level: ${level}`, window.innerWidth / 2, window.innerHeight * 6.5/10);
	c.fillText(`Level: ${level}`, window.innerWidth / 2, window.innerHeight * 6.5/10);
	
	c.strokeText("(press enter to return to menu)", window.innerWidth / 2, window.innerHeight * 7/10);
	c.fillText("(press enter to return to menu)", window.innerWidth / 2, window.innerHeight * 7/10);
}


// returning to menu stuff
// returning to menu from death screen
function returnToMenu() {
    background = setInterval(drawBackground, oneOverSixty);
    justUnpaused = true;
    canvas.hidden = true;
    document.getElementById("body").style.backgroundColor = "#1ea761";
    document.getElementById("title").hidden = false;
    document.getElementById("subtitle").hidden = false;
    document.getElementById("noobs").hidden = false;
    systemText.hidden = false;
    nname.hidden = false;
    roomID.hidden = false;
	
	discord.hidden = false;
	florr.hidden = false;
	github.hidden = false;
    changelog.hidden = false;
    gallery.hidden = false;
    make.hidden = false;
    join.hidden = false;
    level.hidden = levelHidden;
	galleryContainer.hidden = galleryHidden;
	loadoutContainer.hidden = loadoutHidden;
    levelBtn.hidden = false;
	loadoutBtn.hidden = false;
}
