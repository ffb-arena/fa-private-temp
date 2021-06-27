// constants
const join = document.getElementById("join");
const make = document.getElementById("make");
const inputCreate = document.getElementById("input-create");
const inputJoin = document.getElementById("input-join");
const joinSubmit = document.getElementById("join-submit");

const createSubmit = document.getElementById("create-submit");
const changelog = document.getElementById("changelog-btn")
const gallery = document.getElementById("gallery-btn")

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

roomSettingsContainer.hidden = true;
settingsContainer.hidden = true;
changelogContainer.hidden = true;

inputX.hidden = true;
inputY.hidden = true;
by.hidden = true;
units.hidden = true;

inputX.value = 20;
inputY.value = 20;

levelInput.value = 45;


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

nname.addEventListener("keydown", (key) => {
    if (key.code === "Enter") {

        // You join game
        cancelAnimationFrame(background); // from src/petal-background.js
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

        document.getElementById("Discord").hidden = true;
        document.getElementById("Github").hidden = true;
        document.getElementById("Florr").hidden = true;
        changelogContainer.hidden = true;
        changelog.hidden = true;
        gallery.hidden = true;
        make.hidden = true;
        join.hidden = true;
        document.getElementById("level").hidden = true;
        document.getElementById("level-btn").hidden = true;
        ws.send(JSON.stringify(["b", nname.value, levelInput.value]));
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
    ctx.font = "1.5vw Ubuntu";

    let text = `Level ${level}`;
    let width = ctx.measureText(text).width;

    levelText.innerHTML = text;
    levelText.style.width = `${width}px`;

    ctx.font = "1.1vw Ubuntu";
    text = `# of petals: ${5 + Math.floor(level / 15)}`;
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
}
setLevelText();

function drawGallery(radii) {
	if (!radii) return;
	const galleryCanvasWidth = 260; 
	const galleryIconWidth = 50;
	const galleryIconsPerRow = 4;
	const galleryCanvas = document.getElementById("gallery-canvas");
	const spaceBetweenGalleryIcons = (galleryCanvasWidth - (galleryIconWidth * galleryIconsPerRow)) / galleryIconsPerRow;
	const galleryCtx = galleryCanvas.getContext("2d")
	
	// drawing the gallery
	let biggestPetalIndex = 0;
	for (let key in petalNames) {
		key = +key;
		if (key < 0 || 100 < key) continue;
		biggestPetalIndex = Math.max(biggestPetalIndex, key);
	}
	galleryCanvas.height = Math.floor((biggestPetalIndex - 1) / 3 + 1) * (galleryIconWidth + spaceBetweenGalleryIcons);
	galleryCtx.textAlign = "center";
	for (let key in petalNames) {
		key = +key;
		// dev petals
		if (key < 0 || 100 < key) continue;
	
		const row = (key - 1) % galleryIconsPerRow;
		const column = Math.floor((key - 1) / 3);
		const x = spaceBetweenGalleryIcons / 2 + row * (galleryIconWidth + spaceBetweenGalleryIcons);
		const y = spaceBetweenGalleryIcons / 2 + column * (galleryIconWidth + spaceBetweenGalleryIcons);
	
		const colours = rarityColours[rarities[key]];
		drawPetalIcon({ x: x, y: y }, petalNames[key], key, galleryIconWidth, 
			colours.fg, colours.bg, 1, galleryCtx);
	}
}




// returning to menu stuff
// returning to menu from death screen
function returnToMenu() {
    background = requestAnimationFrame(drawBackground);
    justUnpaused = true;
    canvas.hidden = true;
    document.getElementById("body").style.backgroundColor = "#1ea761";
    document.getElementById("title").hidden = false;
    document.getElementById("subtitle").hidden = false;
    document.getElementById("noobs").hidden = false;
    systemText.hidden = false;
    nname.hidden = false;
    roomID.hidden = false;

    document.getElementById("Discord").hidden = false;
    document.getElementById("Github").hidden = false;
    document.getElementById("Florr").hidden = false;
    changelog.hidden = false;
    gallery.hidden = false;
    make.hidden = false;
    join.hidden = false;
    document.getElementById("level").hidden = levelOn;
    document.getElementById("level-btn").hidden = false;
}
