// lerps a certain percent between 2 numbers
// amount = 0 - 1
function lerp(begin, end, amount) {
    return begin + ((end - begin) * amount);
}

// farthest right corner on a side (see hotbarReload._whichSide())
// relative to the middle, using canvas coords
const corners = [
    { x: 0.5, y: -0.5 }, // 0
    { x: 0.5, y: 0.5 }, // 1
    { x: -0.5, y: 0.5 }, // 2
    { x: -0.5, y: -0.5 } // 3
];

// angles to corners above
const angles = [
    2 * Math.PI * 1/8, // 0
    2 * Math.PI * 3/8, // 1
    2 * Math.PI * 5/8, // 2
    2 * Math.PI * 7/8 // 3
];

// rendering reloading hotbar slots
class hotbarReload {
	constructor(timeUntilReloadFinished, pos, width) {
		this._totalTime = timeUntilReloadFinished;
		this._time = timeUntilReloadFinished;
		this._percent = 0;
		this._pos = {
			x: pos.x + width / 2,
			y: pos.y + width / 2
		}; 
		this._width = width;
		this._angle = 0;
        this._angleToSecondLine = 0;
        this._angleAddPerMs = (2 * Math.PI) / timeUntilReloadFinished;
		this._timePerRotation = this._totalTime / 5; // 5 rotations in total
        this._lastUpdateTime = Date.now();
	}

    // how far a line will go from the centre of a square to an edge
    static lineSquare(angle, squareWidth) {
        const adjacent = squareWidth / 2;
        let modAngle = angle % (Math.PI / 2);
        if (modAngle > Math.PI / 4) modAngle = Math.PI / 2 - modAngle;
        const opposite = adjacent * Math.tan(modAngle);
        return Math.sqrt(opposite * opposite + adjacent * adjacent); 
    }

    // what side of a square an angle is on
    // top is 0, right is 1 etc.
    static whichSide(angle) {
        let side = angle + (Math.PI / 4);
        return Math.floor(side / (Math.PI / 2)) % 4;
    }

	update(c) {
		if (this._totalTime === 0) return;
        if (this._time <= 0) return;

        const timeSinceLastFrame = Date.now() - this._lastUpdateTime;
		this._time -= timeSinceLastFrame;
		this._angle = (this._angle + (timeSinceLastFrame / this._timePerRotation * 2 * Math.PI)) % (2 * Math.PI);
        this._angleToSecondLine += this._angleAddPerMs * timeSinceLastFrame;
        this._lastUpdateTime = Date.now();

        const angle2 = this._angle + this._angleToSecondLine;
		const length = hotbarReload.lineSquare(this._angle, this._width);
        const length2 = hotbarReload.lineSquare(angle2, this._width);

        c.fillStyle = "#000000";
        c.globalAlpha = 0.4;

        let angleChecking = angle2;

		c.beginPath();
        c.moveTo(this._pos.x, this._pos.y);
        c.moveTo(this._pos.x + Math.cos(angle2 - Math.PI / 2) * length2, this._pos.y + Math.sin(angle2 - Math.PI / 2) * length2);

        c.lineTo(
            this._pos.x + corners[hotbarReload.whichSide(angleChecking)].x * this._width, 
            this._pos.y + corners[hotbarReload.whichSide(angleChecking)].y * this._width);

        if (this._angleToSecondLine < Math.PI) {
            const side = hotbarReload.whichSide(angleChecking);
            c.lineTo(
                this._pos.x + corners[side].x * this._width, 
                this._pos.y + corners[side].y * this._width);
            
            angleChecking = angles[side];
        }
        while (hotbarReload.whichSide(this._angle) !== hotbarReload.whichSide(angleChecking)) {
            const side = hotbarReload.whichSide(angleChecking);
            c.lineTo(
                this._pos.x + corners[side].x * this._width, 
                this._pos.y + corners[side].y * this._width);
            
            angleChecking = angles[side];
        }
        
		c.lineTo(this._pos.x + Math.cos(this._angle - Math.PI / 2) * length, this._pos.y + Math.sin(this._angle - Math.PI / 2) * length);
        c.lineTo(this._pos.x, this._pos.y);
		c.closePath();
		c.fill();

        c.globalAlpha = 1;
	}
}


// for inventory icons that are moving from a place to another
class slidingPetal {
    constructor(time, startingPos, targetPos, startingWidth, targetWidth, petalID) {
        this._totalTime = time;
        this._timeRemaining = time;
        this.targetPos = targetPos;
        this.startingPos = startingPos;
        this._startingWidth = startingWidth;
        this._targetWidth = targetWidth;
        this.petalID = petalID;
        this._lastUpdateTime = Date.now();
    }

    update(c) {
        let returnValue;
        const timeSinceLastFrame = Date.now() - this._lastUpdateTime;
        this._lastUpdateTime = Date.now();

        this._timeRemaining -= timeSinceLastFrame;
        if (this._timeRemaining <= 0) {
            this._timeRemaining = 0;
            returnValue = true;
        } else returnValue = false;

        const colours = rarityColours[rarities[this.petalID]];
        if (!colours) return;

        const amount = 1 - this._timeRemaining / this._totalTime;

        const width = lerp(this._startingWidth, this._targetWidth, amount);
        const x = lerp(this.startingPos.x, this.targetPos.x, amount);
        const y = lerp(this.startingPos.y, this.targetPos.y, amount);

        drawPetalIcon({ x: x, y: y }, petalNames[this.petalID], this.petalID, width,
            colours.bg, colours.fg, 0.9, c);

        return returnValue;
    }
}


let hotbarReloads = [];
let belowSlidingPetals = [];
let aboveSlidingPetals = [];

// percent of the icon is foreground
const fgPercent = 13/16;
function drawPetalIcon(pos, name, id, width, backgroundColour, foregroundColour, globalAlpha, c, invSlot) {
    c.globalAlpha = globalAlpha;

    // background square
    c.fillStyle = backgroundColour;
    c.strokeStyle = backgroundColour;
    c.roundRect(pos.x, pos.y, width, width, width / 30);
    c.fill();

    // foreground square
    const newWidth = width * fgPercent;
    c.fillStyle = foregroundColour;
    c.strokeStyle = foregroundColour;
    c.roundRect(pos.x + (width - newWidth) / 2, pos.y + (width - newWidth) / 2, newWidth, newWidth, newWidth / 30);
    c.fill();

	if (invSlot !== undefined) {
		// reload (if there is one)
		hotbarReloads[invSlot].update(c);
		c.globalAlpha = globalAlpha;
	}

    // text
    florrText(name, width / 4.5, { x: pos.x + width / 2, y: pos.y + width * 0.7 }, 30, c);

    c.globalAlpha = 1;

    // image
    petals[id]({ x: pos.x + width / 2, y: pos.y + width * 2/5 }, c, 1, width / 6 * radii[id] / 10);
}


const changeSpeed = 0.08;

const minInventoryWidth = 240;
const minInventoryHeight = 28
// 530 and 160 are the maxes
// 508 in game, but too small here
// and I'm too lazy to go in game and see how it handles it
const maxInventoryWidthAdd = 530 - 240;
const maxOnventoryHeightAdd = 160 - 28;
let inventoryWidth = minInventoryWidth;
let inventoryHeight = minInventoryHeight;
let sizeMult = 0;

// inventory vars (petals not in use)
const outlineWidth = 40;
const spaceBetweenInvIcons = 8;

// hotbar vars (petals in use)
const hbOutline = 55;
const spaceBetweenHB = 8;


// draws inventory and stuff
function drawInventory() {

    // changes the size of stop moving rectangle
    if (stopText[0] === "M") {
        // player isn't stopped
        sizeMult = Math.max(sizeMult - changeSpeed, 0);
    } else {
        // player is stopped
        sizeMult = Math.min(sizeMult + changeSpeed, 1);
    }
    inventoryWidth = minInventoryWidth + (sizeMult * maxInventoryWidthAdd);
    inventoryHeight = minInventoryHeight + (sizeMult * maxOnventoryHeightAdd);

    // draws stop moving rectangle
    ctx.fillStyle = "#000000";
    ctx.globalAlpha = 0.4;
    ctx.roundRect(
        window.innerWidth / 2 - inventoryWidth / 2,
        window.innerHeight - inventoryHeight,
        inventoryWidth,
        inventoryHeight + 20,
        7
    );
    ctx.fill();

    // stop moving text
    florrText(stopText, 11.9,
        { x: window.innerWidth / 2, y: window.innerHeight - 15 }, 35, ctx);

    // inventory boxes
    let x;
    x = window.innerWidth / 2 - spaceBetweenInvIcons * 3.5 - outlineWidth * 4;

    if (me.info.inventory.length === 0) return;
    for (let i = 0; i < 8; i++) {
        switch (me.info.inventory[i]) {

            // petal is a slidingPetal
            case -1:

            // empty slot
            case 0:
                drawPetalIcon({ x: x, y: window.innerHeight - 81 },
                    "", 0, outlineWidth, "#dedede", "#ffffff", 0.5, ctx);
                break;
            
            // normal petal
            default: 
                const colours = rarityColours[rarities[me.info.inventory[i]]];
                drawPetalIcon({ x: x, y: window.innerHeight - 81 },
                    petalNames[me.info.inventory[i]], me.info.inventory[i], outlineWidth, colours.bg, colours.fg, 0.9, ctx);
                break;
        }

        x += spaceBetweenInvIcons + outlineWidth;
    }

    // hotbar
    x = window.innerWidth / 2 - hbOutline * me.info.hotbar.length / 2 - spaceBetweenHB * Math.ceil(me.info.hotbar.length - 1) / 2

    for (let i = 0; i < me.info.hotbar.length; i++) {
        switch (me.info.hotbar[i]) {

            // petal is a slidingPetal
            case -1:
        
            // empty slot
            case 0:
                drawPetalIcon({ x: x, y: window.innerHeight - 144 },
                    "", 0, hbOutline, "#dedede", "#ffffff", 0.5, ctx);
                break;

            // normal petal
            default: 
                const colours = rarityColours[rarities[me.info.hotbar[i]]];
                drawPetalIcon({ x: x, y: window.innerHeight - 144 },
                    petalNames[me.info.hotbar[i]], me.info.hotbar[i], hbOutline,
                    colours.bg, colours.fg, 0.9, ctx, i);
                break;
        }

        x += spaceBetweenHB + hbOutline;
    }

    // drawing the transisioning petals
    for (let i = 0; i < belowSlidingPetals.length; i++) {
        if (belowSlidingPetals[i]) {
            if (belowSlidingPetals[i].update(ctx)) {
                me.info.inventory[belowSlidingPetals[i].targetPos.n] = belowSlidingPetals[i].petalID;
                belowSlidingPetals[i] = undefined;
            }
        }
    }
    for (let i = 0; i < 8; i++) {
        if (aboveSlidingPetals[i]) {
            if (aboveSlidingPetals[i].update(ctx)) {
                me.info.hotbar[aboveSlidingPetals[i].targetPos.n] = aboveSlidingPetals[i].petalID;
                aboveSlidingPetals[i] = undefined;
            }
        }
    }
}
