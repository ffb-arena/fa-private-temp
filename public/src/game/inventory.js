// lerps a certain percent between 2 numbers
// amount = number between 0 and 1
function lerp(begin, end, amount) {
    return begin + ((end - begin) * amount);
}

// farthest right corner on a side (see HotbarReload._whichSide())
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
class HotbarReload {
	constructor(timeUntilReloadFinished, pos, width) {
		this._totalTime = timeUntilReloadFinished;
		this._time = timeUntilReloadFinished;
		this._percent = 0;
		this._pos = pos;
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

	update(c, posParam, widthParam) {
		if (this._totalTime === 0) return;
        if (this._time <= 0) return;

        const timeSinceLastFrame = Date.now() - this._lastUpdateTime;
		this._time -= timeSinceLastFrame;
		this._angle = (this._angle + (timeSinceLastFrame / this._timePerRotation * 2 * Math.PI)) % (2 * Math.PI);
        this._angleToSecondLine += this._angleAddPerMs * timeSinceLastFrame;

		const pos = posParam || {
			x: this._pos.x() + this._width / 2,
			y: this._pos.y() + this._width / 2
		};
		const width = widthParam || this._width
        this._lastUpdateTime = Date.now();

        const angle2 = this._angle + this._angleToSecondLine;
		const length = HotbarReload.lineSquare(this._angle, width);
        const length2 = HotbarReload.lineSquare(angle2, width);

        c.fillStyle = "#000000";
        c.globalAlpha = 0.4;

        let angleChecking = angle2;

		c.beginPath();
        c.moveTo(pos.x, pos.y);
        c.moveTo(pos.x + Math.cos(angle2 - Math.PI / 2) * length2, 
			pos.y + Math.sin(angle2 - Math.PI / 2) * length2);

        c.lineTo(
            pos.x + corners[HotbarReload.whichSide(angleChecking)].x * width, 
            pos.y + corners[HotbarReload.whichSide(angleChecking)].y * width);

        if (this._angleToSecondLine < Math.PI) {
            const side = HotbarReload.whichSide(angleChecking);
            c.lineTo(
                pos.x + corners[side].x * width, 
                pos.y + corners[side].y * width);
            
            angleChecking = angles[side];
        }
        while (HotbarReload.whichSide(this._angle) !== HotbarReload.whichSide(angleChecking)) {
            const side = HotbarReload.whichSide(angleChecking);
            c.lineTo(
                pos.x + corners[side].x * width, 
                pos.y + corners[side].y * width);
            
            angleChecking = angles[side];
        }
        
		c.lineTo(pos.x + Math.cos(this._angle - Math.PI / 2) * length, 
			pos.y + Math.sin(this._angle - Math.PI / 2) * length);
        c.lineTo(pos.x, pos.y);
		c.closePath();
		c.fill();

        c.globalAlpha = 1;
	}
}


// for inventory icons that are moving from a place to another
class SlidingPetal {
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

    update(c, drawReload = false) {
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
        const x = lerp(this.startingPos.x(), this.targetPos.x(), amount);
        const y = lerp(this.startingPos.y(), this.targetPos.y(), amount);
		let reloadSettings, invSlot;

		if (drawReload) {
			reloadSettings = {
				pos: { x: x + width / 2, y: y + width / 2 },
				width: width * fgPercent
			};
			invSlot = this.targetPos.n;
		}

        drawPetalIcon({ x: x, y: y }, petalNames[this.petalID], this.petalID, width,
            colours.bg, colours.fg, 0.9, c, invSlot, reloadSettings);

        return returnValue;
    }
}


let hotbarReloads = [];
let belowSlidingPetals = [];
let aboveSlidingPetals = [];

// percent of petals icons that are foreground (not border)
const fgPercent = 13/16;
function drawPetalIcon(pos, name, id, width, backgroundColour, foregroundColour, globalAlpha, c, invSlot, reloadSettings) {
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
		if (!reloadSettings) {
			hotbarReloads[invSlot].update(c);
		} else {
			hotbarReloads[invSlot].update(c, reloadSettings.pos, reloadSettings.width);
		}
		c.globalAlpha = globalAlpha;
	}

    // text
    florrText(name, width / 4.5, { x: pos.x + width / 2, y: pos.y + width * 0.7 }, width / 120, c);

    c.globalAlpha = 1;

    // image
    petals[id]({ x: pos.x + width / 2, y: pos.y + width * 2/5 }, c, 1, width / 6 * radii[id] / 10);
}


const changeSpeed = 0.08;

const minBoxWidth = 240;
const minBoxHeight = 28
// 530 and 160 are the maxes
// 508 in game, but too small here
// and I'm too lazy to go in game and see how it handles it
const maxBoxWidthAdd = 530 - 240;
const maxBoxHeightAdd = 160 - 28;
let boxWidth = minBoxWidth;
let boxHeight = minBoxHeight;
let sizeMult = 0;

// whether to show the numbers above the petals
let numInfo = false;
let selectedPetal = 0;
let unselectTime = undefined;

// inventory vars (petals not in use)
const outlineWidth = 40;
const spaceBetweenInvIcons = 8;

// hotbar vars (petals in use)
const hbOutline = 55;
const spaceBetweenHB = 8;

const holdingWidth = 70; // width of petals being held

class HoldingPetal {
	constructor() {
		this.id = 0;
		this.pos = {
			x: undefined,
			y: undefined
		};
		this.width = holdingWidth;
		this.n = undefined;
		// whether the petal is from hotbar or inventory
		this.fromHotbar = undefined;
	}

	updatePos(x, y) {
		this.pos.x = x - this.width / 2;
		this.pos.y = y - this.width / 2;
	}
}
// petal that is being held
let holdingPetal = new HoldingPetal();

// if the player is stopped or not
let playerStopped = false;


// draws inventory and stuff
function drawInventory() {
	let pointerCursor = !!holdingPetal.id; // if the cursor should be a pointer or not

	// checks if should automatically unselect
	if (Date.now() > unselectTime) {
		numInfo = false;
	}	

	if (!me.settings.keyboard) {
    	// changes the size of stop moving rectangle
		if (
			(window.innerWidth / 2 - boxWidth / 2 < me.info.mouseX && me.info.mouseX < window.innerWidth / 2 + boxWidth / 2
			&&
			window.innerHeight - boxHeight < me.info.mouseY && me.info.mouseY < window.innerHeight)
			||
			(playerStopped && holdingPetal.id)
		) {
			if (!playerStopped) {
				ws.send(JSON.stringify("cea"));
				playerStopped = true;
			}
			stopText = "You can also use [Q] and [E] to modify the inventory";
    	    sizeMult = Math.min(sizeMult + changeSpeed, 1);
		} else {
			if (playerStopped) {
				playerStopped = false;
				ws.send(JSON.stringify("ceb"));
			}
			stopText = "Move mouse here to disable movement";
    	    sizeMult = Math.max(sizeMult - changeSpeed, 0);
		}
    	boxWidth = minBoxWidth + (sizeMult * maxBoxWidthAdd);
    	boxHeight = minBoxHeight + (sizeMult * maxBoxHeightAdd);

    	// draws stop moving rectangle
    	ctx.fillStyle = "#000000";
    	ctx.globalAlpha = 0.4;
    	ctx.roundRect(
    	    window.innerWidth / 2 - boxWidth / 2,
    	    window.innerHeight - boxHeight,
    	    boxWidth,
    	    boxHeight + 20,
    	    7
    	);
    	ctx.fill();

    	// stop moving text
    	florrText(stopText, 11.9,
    	    { x: window.innerWidth / 2, y: window.innerHeight - 15 }, 0.3, ctx);
	}

    // inventory boxes (+ detecting if cursor is hovering over them)
    let x;
    x = window.innerWidth / 2 - spaceBetweenInvIcons * 3.5 - outlineWidth * 4;

    if (me.info.inventory.length === 0) return;
	let y = window.innerHeight - 81;
    for (let i = 0; i < 8; i++) {
        switch (me.info.inventory[i]) {

			// petal is being dragged
			case -2:

            // petal is a slidingPetal
            case -1:

            // empty slot
            case 0:
                drawPetalIcon({ x: x, y: y },
                    "", 0, outlineWidth, "#dedede", "#ffffff", 0.5, ctx);
                break;
            
            // normal petal
            default: 
				if (
					x < me.info.mouseX && me.info.mouseX < (x + outlineWidth)
					&&
					y < me.info.mouseY && me.info.mouseY < (y + outlineWidth)
				) {
					pointerCursor = true;
					if (!holdingPetal.id && me.info.leftMouseDown) {
						holdingPetal.id = me.info.inventory[i];
						holdingPetal.n = i;
						holdingPetal.fromHotbar = false;
						holdingPetal.updatePos(me.info.mouseX, me.info.mouseY);
						me.info.inventory[i] = -2;
						break;
					}
				}
               	const colours = rarityColours[rarities[me.info.inventory[i]]];
               	drawPetalIcon({ x: x, y: y },
               		petalNames[me.info.inventory[i]], me.info.inventory[i], 
					outlineWidth, colours.bg, colours.fg, 0.9, ctx);
				// if the petal is selected in the inventory
				if (numInfo && selectedPetal === i) {	
					ctx.lineWidth = 1.6;
					ctx.strokeStyle = colours.fg;
					ctx.strokeRect(x, y, outlineWidth, outlineWidth);
				}
                break;
        }

        x += spaceBetweenInvIcons + outlineWidth;
    }

    // hotbar
    x = window.innerWidth / 2 - (hbOutline * me.info.hotbar.length / 2) - 
		(spaceBetweenHB * Math.ceil(me.info.hotbar.length - 1) / 2);
	y = window.innerHeight - 144;
    for (let i = 0; i < me.info.hotbar.length; i++) {
        switch (me.info.hotbar[i]) {

			// petal is being dragged
			case -2:

            // petal is a slidingPetal
            case -1:
        
            // empty slot
            case 0:
                drawPetalIcon({ x: x, y: y },
                    "", 0, hbOutline, "#dedede", "#ffffff", 0.5, ctx);
                break;

            // normal petal
            default: 
				if (
					x < me.info.mouseX && me.info.mouseX < (x + hbOutline)
					&&
					y < me.info.mouseY && me.info.mouseY < (y + hbOutline)
				) {
					pointerCursor = true;
					if (!holdingPetal.id && me.info.leftMouseDown) {
						holdingPetal.id = me.info.hotbar[i];
						holdingPetal.n = i;
						holdingPetal.fromHotbar = true;
						holdingPetal.updatePos(me.info.mouseX, me.info.mouseY);
						me.info.hotbar[i] = -2;
						break;
					}
				}
                const colours = rarityColours[rarities[me.info.hotbar[i]]];
                drawPetalIcon({ x: x, y: y },
                    petalNames[me.info.hotbar[i]], me.info.hotbar[i], hbOutline,
                    colours.bg, colours.fg, 0.9, ctx, i);
                break;
        }

        x += spaceBetweenHB + hbOutline;
    }

    // drawing the transitioning petals
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
			// updating with reload
            if (aboveSlidingPetals[i].update(ctx, true)) {
                me.info.hotbar[aboveSlidingPetals[i].targetPos.n] = aboveSlidingPetals[i].petalID;
                aboveSlidingPetals[i] = undefined;
            }
        }
    }

    // drawing numbers
    if (numInfo) {
        x = window.innerWidth / 2 - (hbOutline * me.info.hotbar.length / 2) - 
			(spaceBetweenHB * Math.ceil(me.info.hotbar.length - 1) / 2) + (hbOutline / 2);

        for (let i = 0; i < me.info.hotbar.length; i++) {
            florrText(`[${i + 1}]`, 14, { x: x, y: window.innerHeight - 157 }, 0.5, ctx);
            x += spaceBetweenHB + hbOutline;
        }
    }

	// updating petal that is being held
	if (!me.info.leftMouseDown && holdingPetal.id) {
		// TODO: make petal zoom back to its spot
		if (holdingPetal.fromHotbar) {
		 	me.info.hotbar[holdingPetal.n] = holdingPetal.id;
		} else {
		 	me.info.inventory[holdingPetal.n] = holdingPetal.id;
		}
		holdingPetal.id = 0;
	} else if (holdingPetal.id) {
		holdingPetal.updatePos(me.info.mouseX, me.info.mouseY);
	}
    // TODO: drawing petal that is being held
	if (holdingPetal.id) {
		const colours = rarityColours[rarities[holdingPetal.id]];
		drawPetalIcon({ x: holdingPetal.pos.x, y: holdingPetal.pos.y },
			petalNames[holdingPetal.id], holdingPetal.id, holdingPetal.width,
			colours.bg, colours.fg, 0.9, ctx, holdingPetal.n);
	}

	// setting correct cursor
	if (pointerCursor) {
		canvas.style.cursor = "pointer";
	} else {
		canvas.style.cursor = "auto";
	}
}
