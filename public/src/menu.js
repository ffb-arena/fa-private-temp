// constants
C join = document.getElementById("join");
C make = document.getElementById("make");
C inputCreate = document.getElementById("input-create");
C inputJoin = document.getElementById("input-join");
C joinSubmit = document.getElementById("join-submit");

C createSubmit = document.getElementById("create-submit");
C changelog = document.getElementById("changelog-btn")
C gallery = document.getElementById("gallery-btn")
C levelBtn = document.getElementById("level-btn");
C level = document.getElementById("level");
C loadoutBtn = document.getElementById("loadout-btn");
C galleryContainer = document.getElementById("gallery-container");
C loadoutContainer = document.getElementById("loadout-container");

C nname = document.getElementById("name");
C back = document.getElementById("back");
C systemText = document.getElementById("system-text");
C roomID = document.getElementById("room-ID");
C roomContainer = document.getElementById("room-container");

C roomSettingsContainer = document.getElementById("room-settings-container");
C inputX = document.getElementById("x");
C inputY = document.getElementById("y");
C by = document.getElementById("by");
C units = document.getElementById("units");

C settingsContainer = document.getElementById("settings-container");
C changelogContainer = document.getElementById("changelog-container");
C keyboard = document.getElementById("keyboard");
C helper = document.getElementById("helper");

C levelInput = document.getElementById("level-input");
C levelText = document.getElementById("level-display");
C health = document.getElementById("health");
C bodyDamage = document.getElementById("body-damage");
C petalNum = document.getElementById("petal-num");

// icon links
C github = document.getElementById("Github");
C discord = document.getElementById("Discord");
C florr = document.getElementById("Florr");

C menuDiv = document.getElementById("menu-div");

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
	loads[1] = true;
	finishLoad();
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
		// menu hiding stuff is in ws.js, on init packet
        ws.send(JSON.stringify(["b", nname.value, levelInput.value, loadout.inv, loadout.hb]));
        ws.send(JSON.stringify(["c", "d", me.info.mouseX - ww / 2, wh - ((me.info.mouseY - wh / 2) + wh / 2) - wh / 2, res]));
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
    C level = levelInput.value;
	window.localStorage.level = level;
	nOfPetals = 5 + Math.floor(level / 15);

    ctx.font = "1.5vw Ubuntu";

    L text = `Level ${level}`;
    L width = ctx.measureText(text).width;

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
			for (L i = 0; i < nOfPetals - loadout.hb.length; i++) {
				loadout.hb.push(0);
			}
		} else {
			for (L i = 0; i < loadout.hb.length - nOfPetals; i++) {
				loadout.hb.pop();
			}
		}
		drawLoadout();
	}
}

C galleryCanvas = document.getElementById("gallery-canvas");
C galleryCanvasWidth = 260; 
C galleryIconWidth = 50;
C galleryIconsPerRow = 4;
galleryCanvas.width = galleryCanvasWidth;
C spaceBetweenGalleryIcons = (galleryCanvasWidth - (galleryIconWidth * galleryIconsPerRow)) / galleryIconsPerRow;
L sorted = [];
C galleryCtx = galleryCanvas.getContext("2d");
function drawGallery(radii) {
	if (!radii) return;

	// creating a sorted list
	sorted = [];
	for (L id in petalNames) {
		id = +id;
		// dev petal
		if (id <= 0) continue;
		sorted.push(id);
	}
	sorted.sort((id1, id2) => {
		C rarity1 = rarities[id1];
		C rarity2 = rarities[id2];
		if (rarity1 === rarity2) {
			// same rarity, sort alphabetically
			C name1 = petalNames[id1];
			C name2 = petalNames[id2];
			return name1 > name2 ? 1 : -1;
		}
		return rarityTiers[rarity1] < rarityTiers[rarity2] ? -1 : 1;
	});

	// drawing the gallery
	galleryCanvas.height = Math.floor((sorted.length - 1) / 3 + 1) * (galleryIconWidth + spaceBetweenGalleryIcons);
	galleryCtx.textAlign = "center";
	sorted.forEach((v, i) => {
		C row = i % galleryIconsPerRow;
		C column = Math.floor(i / galleryIconsPerRow);
		C x = spaceBetweenGalleryIcons / 2 + row * (galleryIconWidth + spaceBetweenGalleryIcons);
		C y = spaceBetweenGalleryIcons / 2 + column * (galleryIconWidth + spaceBetweenGalleryIcons);
	
		C colours = rarityColours[rarities[v]];
		drawPetalIcon({ x: x, y: y }, petalNames[v], v, galleryIconWidth, 
			colours.bg, colours.fg, 1, galleryCtx);
	});
}


C loadoutCanvas = document.getElementById("loadout-canvas");
C ldCtx = loadoutCanvas.getContext("2d");
C ldWidth = 170;
C ldHeight = 500;
loadoutCanvas.width = ldWidth;
loadoutCanvas.height = ldHeight;
ldCtx.textAlign = "center";
C ldIconWidth = 50;
C ldIconXSpace = (ldWidth - ldIconWidth * 2) / 2;
C ldIconYSpace = (ldHeight - ldIconWidth * 8) / 8;

function drawLoadout() {
	window.localStorage.loadout = JSON.stringify(loadout);
	ldCtx.clearRect(0, 0, ldWidth, ldHeight);
	// hotbar
	for (L i = 0; i < loadout.hb.length; i++) {
		C x = ldIconXSpace / 2;
		C y = ldIconYSpace / 2 + i * (ldIconYSpace + ldIconWidth);
		C id = loadout.hb[i];
        C colours = rarityColours[rarities[id]];
		drawPetalIcon({ x: x, y: y }, petalNames[id], id, ldIconWidth,
			colours.bg, colours.fg,	id === 0 ? 0.5 : 1, ldCtx);
	}	
	// inventory
	for (L i = 0; i < 8; i++) {
		C x = ldIconXSpace / 2 + ldIconWidth + ldIconXSpace;
		C y = ldIconYSpace / 2 + i * (ldIconYSpace + ldIconWidth);
		C id = loadout.inv[i];
        C colours = rarityColours[rarities[id]];
		drawPetalIcon({ x: x, y: y }, petalNames[id], id, ldIconWidth,
			colours.bg, colours.fg,	id === 0 ? 0.5 : 1, ldCtx);
	}	
}


// menu holding petal stuff (for loadout)
C petalDraggingCanvas = document.getElementById("petal-dragging-canvas");
petalDraggingCanvas.width = ww;
petalDraggingCanvas.height = wh;
petalDraggingCanvas.hidden = true;
C petalCtx = petalDraggingCanvas.getContext("2d"); 
petalCtx.textAlign = "center";
class MenuHoldingPetal {
	constructor() {
		this.pos = {
			x: undefined,
			y: undefined
		};
		this.width = 50;
		this.id = 0;
		this.canvas = petalDraggingCanvas;
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
		this.ctx.clearRect(0, 0, ww, wh);
	}
	draw() {
		L x = this.pos.x, y = this.pos.y, width = this.width;
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
L menuHoldingPetal = new MenuHoldingPetal();


// death screen
function drawDeathScreen(c, time, level) {
	c.globalAlpha = 0.5;
	c.fillStyle = "#000000";
	c.fillRect(0, 0, ww, wh);
	c.globalAlpha = 1;
	
	c.lineWidth = 7 * res;
	c.strokeStyle = "#000000";
	c.fillStyle = "#ffffff";
	c.font = "30px Ubuntu"
	c.strokeText("You died : (", ww / 2, wh * 4/10);
	c.fillText("You died : (", ww / 2, wh * 4/10);
	
	c.lineWidth = 3 * res;
	c.strokeStyle = "#000000";
	c.font = "15px Ubuntu"
	
	c.strokeText(`Time alive: ${time}ms`, ww / 2, wh * 6/10);
	c.fillText(`Time alive: ${time}ms`, ww / 2, wh * 6/10);
	
	c.strokeText(`Level: ${level}`, ww / 2, wh * 6.5/10);
	c.fillText(`Level: ${level}`, ww / 2, wh * 6.5/10);
	
	c.strokeText("(press enter to return to menu)", ww / 2, wh * 7/10);
	c.fillText("(press enter to return to menu)", ww / 2, wh * 7/10);
}


// returning to menu stuff
// returning to menu from death screen
function returnToMenu() {
	startBackground();
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
