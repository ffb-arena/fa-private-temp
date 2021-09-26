C lerp = (begin, end, amount) => begin + ((end - begin) * amount);
// returns a function that returns the left side of slot i
function getXPos(i, hb, xOffset=0) {
	C bar = hb ? me.info.hotbar : me.info.inventory;
	C width = hb ? hbWidth : invWidth;
	C spacing = hb ? spaceBetweenHB : spaceBetweenInv;
	C newNum = i - bar.length / 2;
	R () => ww / 2 + newNum * width + (newNum - 0.5) * spacing + spacing + xOffset;
}
C getYPos = (hb, offset=0) => { C y = hb ? 144 : 81; R () => wh - y + offset; };

// farthest right corner on a side (see HotbarReload._whichSide()), relative to centre, using canvas coords
C corners = [{ x: 0.5,  y: -0.5 }, { x: 0.5,  y: 0.5 }, { x: -0.5, y: 0.5 }, { x: -0.5, y: -0.5 }];
// angles to corners above
C angles = [2 * Math.PI * 1/8, 2 * Math.PI * 3/8, 2 * Math.PI * 5/8, 2 * Math.PI * 7/8];

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
        C adjacent = squareWidth / 2;
        L modAngle = angle % (Math.PI / 2);
        if (modAngle > Math.PI / 4) modAngle = Math.PI / 2 - modAngle;
        C opposite = adjacent * Math.tan(modAngle);
        R Math.sqrt(opposite * opposite + adjacent * adjacent); 
    }

    // what side of a square an angle is on
    // top is 0, right is 1 etc.
    static whichSide(angle) { C side = angle + (Math.PI / 4); R Math.floor(side / (Math.PI / 2)) % 4; }

	update(c, posParam, widthParam) {
		if (this._totalTime === 0) R;
        if (this._time <= 0) R;

        C timeSinceLastFrame = Date.now() - this._lastUpdateTime;
		this._time -= timeSinceLastFrame;
		this._angle = (this._angle + (timeSinceLastFrame / this._timePerRotation * 2 * Math.PI)) % (2 * Math.PI);
        this._angleToSecondLine += this._angleAddPerMs * timeSinceLastFrame;

		C pos = posParam || {
			x: this._pos.x() + this._width / 2,
			y: this._pos.y() + this._width / 2
		};
		C width = widthParam || this._width
        this._lastUpdateTime = Date.now();

        C angle2 = this._angle + this._angleToSecondLine;
		C length = HotbarReload.lineSquare(this._angle, width);
        C length2 = HotbarReload.lineSquare(angle2, width);

        c.fillStyle = "#000000";
        c.globalAlpha = 0.4;

        L angleChecking = angle2;

		c.beginPath();
        c.moveTo(pos.x, pos.y);
        c.moveTo(pos.x + Math.cos(angle2 - Math.PI / 2) * length2, 
			pos.y + Math.sin(angle2 - Math.PI / 2) * length2);

        c.lineTo(
            pos.x + corners[HotbarReload.whichSide(angleChecking)].x * width, 
            pos.y + corners[HotbarReload.whichSide(angleChecking)].y * width);

        if (this._angleToSecondLine < Math.PI) {
            C side = HotbarReload.whichSide(angleChecking);
            c.lineTo(
                pos.x + corners[side].x * width, 
                pos.y + corners[side].y * width);
            
            angleChecking = angles[side];
        }
        while (HotbarReload.whichSide(this._angle) !== HotbarReload.whichSide(angleChecking)) {
            C side = HotbarReload.whichSide(angleChecking);
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
	/*
		startingPos: { x: function, y: function }
		targetPos: { x: function, y: function, n: int }
		n is the # of the slot the SlidingPetal will end up in
		how does it know if n refers to inventory or hotbar?
		if it's in belowSlidingPetals array, it's inventory
		(those petals go below the others when you press x)
		if it's in the aboveSlidingPetals array, it's destined for the hotbar
	*/
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

    update(c, drawReload=false) {
        L doneSliding;
        C timeSinceLastFrame = Date.now() - this._lastUpdateTime;
        this._lastUpdateTime = Date.now();

        this._timeRemaining -= timeSinceLastFrame;
        if (this._timeRemaining <= 0) {
            this._timeRemaining = 0;
            doneSliding = true;
        } else doneSliding = false;

        C colours = rarityColours[rarities[this.petalID]];
        if (!colours) R;

        C amount = 1 - this._timeRemaining / this._totalTime;

        C width = lerp(this._startingWidth, this._targetWidth, amount);
        C x = lerp(this.startingPos.x(), this.targetPos.x(), amount);
        C y = lerp(this.startingPos.y(), this.targetPos.y(), amount);
		L reloadSettings, invSlot;

		if (drawReload) {
			reloadSettings = {
				pos: { x: x + width / 2, y: y + width / 2 },
				width: width * fgPercent
			};
			invSlot = this.targetPos.n;
		}

        drawPetalIcon({ x: x, y: y }, petalNames[this.petalID], this.petalID, width,
            colours.bg, colours.fg, 0.9, c, invSlot, reloadSettings);

        R doneSliding;
    }
}


L hotbarReloads = [];
L belowSlidingPetals = [];
L aboveSlidingPetals = [];

// percent of petals icons that are foreground (not border)
C fgPercent = 13/16;
function drawPetalIcon(pos, name, id, width, backgroundColour, foregroundColour, globalAlpha, c, invSlot, reloadSettings) {
    c.globalAlpha = globalAlpha;

    // background square
    c.fillStyle = backgroundColour;
    c.strokeStyle = backgroundColour;
    c.roundRect(pos.x, pos.y, width, width, width / 30);
    c.fill();

    // foreground square
    C newWidth = width * fgPercent;
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
    florrText(name, width / 4.5, { x: pos.x + width / 2, y: pos.y + width * 0.7 }, c);

    c.globalAlpha = 1;

    // image
    petals[id]({ x: pos.x + width / 2, y: pos.y + width * 2/5 }, c, 1, width / 6 * radii[id] / 10);
}


C changeSpeed = 0.08;

C minBoxWidth = 240;
C minBoxHeight = 28
// 530 and 160 are the maxes
// 508 in game, but too small here
// and I'm too lazy to go in game and see how it handles it
C maxBoxWidthAdd = 530 - 240;
C maxBoxHeightAdd = 160 - 28;
L boxWidth = minBoxWidth;
L boxHeight = minBoxHeight;
L sizeMult = 0;

// whether to show the numbers above the petals
L numInfo = false;
L selectedPetal = 0;
L unselectTime = undefined;

// widths are total width, with outlines
// inventory vars (petals not in use)
C invWidth = 40;
C spaceBetweenInv = 8;

// hotbar vars (petals in use)
C hbWidth = 55;
C spaceBetweenHB = 8;

C holdingWidth = 70; // width of petals being held

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
		this.snapping = false;
		this.snapN = undefined;
		this.snapInHotbar = undefined;
	}

	updatePos(x, y) {
		if (this.snapping) {
			this.snapping = false;
		} else {
			this.width = holdingWidth;
			this.pos.x = x - this.width / 2;
			this.pos.y = y - this.width / 2;
		}
	}

	draw() {
		C colours = rarityColours[rarities[this.id]];
		drawPetalIcon({ x: this.pos.x, y: this.pos.y },
			petalNames[this.id], this.id, this.width,
			colours.bg, colours.fg, 0.9, ctx, this.n,
			{ pos: { x: this.pos.x + this.width / 2, y: this.pos.y + this.width / 2 }, width: this.width * fgPercent });
	}

	snap(x, y, baseWidth, n, fromHotbar) {
		this.width = baseWidth + 10;
		this.pos.x = x - 5;
		this.pos.y = y - 5;
		this.snapping = true;
		this.snapN = n;
		this.snapInHotbar = fromHotbar;
	}

	release() {
		if (!this.id) R;

		C xPercent = this.pos.x / ww;
		C yPercent = this.pos.y / wh;
		C holdingRN = {
			x: () => xPercent * ww, 
			y: () => yPercent * wh 
		};

		C holdingOGSpot = {
			x: getXPos(this.n, this.fromHotbar),
			y: getYPos(this.fromHotbar),
			n: this.n 
		};

		L isSwap = !!this.snapping;
		L fromCooldown = this.fromHotbar ? me.info.hotbarCooldowns : me.info.inventoryCooldowns;
		L toCooldown = this.snapInHotbar ? me.info.hotbarCooldowns : me.info.inventoryCooldowns;	
		if (fromCooldown[this.n] > Date.now() || toCooldown[this.snapN] > Date.now()) isSwap = false;

		if (isSwap) {
			// OMG IT'S A PETAL SWAP!!!!!
			ws.send(JSON.stringify(["e", this.n, this.fromHotbar, this.snapN, this.snapInHotbar]));

			C targetBar = this.snapInHotbar ? me.info.hotbar : me.info.inventory;

			L holdingSliding = this.snapInHotbar ? aboveSlidingPetals : belowSlidingPetals;

			C holdingTarget = {
				x: getXPos(this.snapN, this.snapInHotbar),
				y: getYPos(this.snapInHotbar),
				n: this.snapN
			};
			C holdingTargetWidth = this.snapInHotbar ? hbWidth : invWidth;

			// for the holding petal
			holdingSliding[this.snapN] = new SlidingPetal(300, holdingRN, holdingTarget, 
				this.width, holdingTargetWidth, this.id);

			// for the other petal swapping with the holdingPetal
			if (targetBar[this.snapN] === 0) {
				if (this.fromHotbar) {
					me.info.hotbar[this.n] = 0;
				} else {
					me.info.inventory[this.n] = 0;
				}	
			} else {
				L otherSliding = this.fromHotbar ? aboveSlidingPetals : belowSlidingPetals;
				C OGHoldingWidth = this.fromHotbar ? hbWidth : invWidth;
				otherSliding[this.n] = new SlidingPetal(300, holdingTarget, holdingOGSpot, 
					holdingTargetWidth, OGHoldingWidth, targetBar[this.snapN]);
			}

			fromCooldown[this.n] = Date.now() + me.swapCooldown;
			toCooldown[this.snapN] = Date.now() + me.swapCooldown;
			this.id = 0;
		} else {
			// normal boring release

			// making it zoom back to its spot
			C endWidth = this.fromHotbar ? hbWidth : invWidth;


			C distance = Math.sqrt(
				Math.abs(this.pos.x - holdingOGSpot.x()) ** 2
				+
				Math.abs(this.pos.y - holdingOGSpot.y()) ** 2
			);

			C slider = new SlidingPetal(distance * 0.5,
				holdingRN, holdingOGSpot,
				this.width, endWidth, this.id);

			if (this.fromHotbar) {
				aboveSlidingPetals[this.n] = slider;
			} else {
				belowSlidingPetals[this.n] = slider;
			}

			this.id = 0;
		}
	}
}
// petal that is being held
L holdingPetal = new HoldingPetal();

// if the player is stopped or not
L playerStopped = false;

// switches petals
function swapPetals(invSlot, hotbarSlot) {
	ws.send(JSON.stringify(["d", invSlot, hotbarSlot]));
	L invID = me.info.inventory[invSlot];
	L hotbarID = me.info.hotbar[hotbarSlot];

	if (invID === -1) {
		// pain
		invID = belowSlidingPetals[invSlot].petalID;
	} else if (invID === -2) {
		invID = holdingPetal.id;
	}
	if (hotbarID === -1) {
		hotbarID = aboveSlidingPetals[hotbarSlot].petalID;
	} else if (hotbarID === -2) {
		hotbarID = holdingPetal.id;
	}
	
	C invInfo = {
	    x: getXPos(invSlot, false),
	    y: getYPos(false),
	    n: invSlot
	};
	
	C hbInfo = {
	    x: getXPos(hotbarSlot, true),
	    y: getYPos(true),
	    n: hotbarSlot
	};
	
	
	// checking if any of them are being held, or are sliding
	switch (me.info.inventory[invSlot]) {
		// petal is being held
		case -2:
			holdingPetal.fromHotbar = !holdingPetal.fromHotbar;
			holdingPetal.n = hotbarSlot;
			holdingPetal.release();
			break;
		// petal is sliding
		case -1:
				
		// petal is normal
		default:
			aboveSlidingPetals[hotbarSlot] = new SlidingPetal(300, invInfo,
			    hbInfo, invWidth, hbWidth, invID);
			break;
	}
	// same as above, but for hotbar
	switch (me.info.hotbar[hotbarSlot]) {
		case -2:
			holdingPetal.fromHotbar = !holdingPetal.fromHotbar;
			holdingPetal.n = invSlot;
			holdingPetal.release();
			break;
		case -1:
	
		default:
			belowSlidingPetals[invSlot] = new SlidingPetal(300, hbInfo,
			    invInfo, hbWidth, invWidth, hotbarID);
			break;
	}

	me.info.hotbar[hotbarSlot] = -1;
	me.info.inventory[invSlot] = -1;

	if (invID === 0) {
		aboveSlidingPetals[hotbarSlot] = undefined;
		me.info.hotbar[hotbarSlot] = 0;
	} else if (hotbarID === 0) {
		belowSlidingPetals[invSlot] = undefined;
		me.info.inventory[invSlot] = 0;
	}
	
	
	me.info.inventoryCooldowns[invSlot] = Date.now() + me.swapCooldown;
	me.info.hotbarCooldowns[hotbarSlot] = Date.now() + me.swapCooldown;
}

// draws inventory and stuff
function drawInventory() {
	L pointerCursor = !!holdingPetal.id; // if the cursor should be a pointer or not

	// checks if should automatically unselect
	if (Date.now() > unselectTime) {
		numInfo = false;
	}	

	if (!me.settings.keyboard) {
    	// changes the size of stop moving rectangle
		if (
			pointInBox(
				{ x: me.info.mouseX, y: me.info.mouseY }, 
				{ x: ww / 2 - boxWidth / 2, y: wh - boxHeight, width: boxWidth, height: boxHeight })
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
    	    ww / 2 - boxWidth / 2,
    	    wh - boxHeight,
    	    boxWidth,
    	    boxHeight + 20,
    	    7
    	);
    	ctx.fill();

    	// stop moving text
    	florrText(stopText, 11.9,
    	    { x: ww / 2, y: wh - 15 }, ctx);
	}

    // inventory boxes (+ detecting if cursor is hovering over them)
    L x;
    x = ww / 2 - spaceBetweenInv * 3.5 - invWidth * 4;

    if (me.info.inventory.length === 0) R;
	L y = wh - 81;
    for (L i = 0; i < 8; i++) {

		L id = me.info.inventory[i];

		if (id >= 0) {
			if (pointInBox(
				{ x: me.info.mouseX, y: me.info.mouseY },
				{ x: x, y: y, width: invWidth })
			) {
				pointerCursor = true;
				if (holdingPetal.id) {
					if (id !== holdingPetal.id) {
						holdingPetal.snap(x, y, invWidth, i, false)
					}
				} else if (me.info.justClicked) {
					// new petal was selected
					holdingPetal.id = id;
					holdingPetal.n = i;
					holdingPetal.fromHotbar = false;
					holdingPetal.updatePos(me.info.mouseX, me.info.mouseY);
					me.info.inventory[i] = -2;
				}
			}
		}

		id = Math.max(id, 0);
       	C colours = rarityColours[rarities[id]];
       	drawPetalIcon({ x: x, y: y },
      		petalNames[id], id, 
			invWidth, colours.bg, colours.fg, id === 0 ? 0.5 : 0.9, ctx);
		// if the petal is selected in the inventory
		if (numInfo && selectedPetal === i) {	
			ctx.lineWidth = 1.6;
			ctx.strokeStyle = colours.fg;
			ctx.strokeRect(x, y, invWidth, invWidth);
		}

        x += spaceBetweenInv + invWidth;
    }

    // hotbar
    x = ww / 2 - (hbWidth * me.info.hotbar.length / 2) - 
		(spaceBetweenHB * Math.ceil(me.info.hotbar.length - 1) / 2);
	y = wh - 144;
    for (L i = 0; i < me.info.hotbar.length; i++) {

		L id = me.info.hotbar[i];
		if (id >= 0) {
			if (pointInBox(
				{ x: me.info.mouseX, y: me.info.mouseY },
				{ x: x, y: y, width: hbWidth })
			) {
				pointerCursor = true;
				if (holdingPetal.id) {
					if (id !== holdingPetal.id) {
						holdingPetal.snap(x, y, hbWidth, i, true)
					}
				} else if (me.info.justClicked) {
					// new petal was selected
					holdingPetal.id = id;
					holdingPetal.n = i;
					holdingPetal.fromHotbar = true;
					holdingPetal.updatePos(me.info.mouseX, me.info.mouseY);
					me.info.hotbar[i] = -2;
				}
			}
		}

		// if the petal is -1 or -2, render an empty slot
		// (-1 = sliding, -2 = holding)
		id = Math.max(id, 0);
        C colours = rarityColours[rarities[id]];
        drawPetalIcon({ x: x, y: y },
            petalNames[id],	id, hbWidth,
            colours.bg, colours.fg, id === 0 ? 0.5 : 0.9, ctx, id === 0 ? undefined : i);

        x += spaceBetweenHB + hbWidth;
    }

    // drawing the transitioning petals
    for (L i = 0; i < belowSlidingPetals.length; i++) {
        if (belowSlidingPetals[i]) {
            if (belowSlidingPetals[i].update(ctx)) {
                me.info.inventory[belowSlidingPetals[i].targetPos.n] = belowSlidingPetals[i].petalID;
                belowSlidingPetals[i] = undefined;
            }
        }
    }
    for (L i = 0; i < 8; i++) {
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
        x = ww / 2 - (hbWidth * me.info.hotbar.length / 2) - 
			(spaceBetweenHB * Math.ceil(me.info.hotbar.length - 1) / 2) + (hbWidth / 2);

        for (L i = 0; i < me.info.hotbar.length; i++) {
            florrText(`[${i + 1}]`, 14, { x: x, y: wh - 157 }, ctx);
            x += spaceBetweenHB + hbWidth;
        }
    }

	// updating petal that is being held
	if (!me.info.leftMouseDown && holdingPetal.id) {
		// petal has been released
		holdingPetal.release();
	} else if (holdingPetal.id) {
		holdingPetal.updatePos(me.info.mouseX, me.info.mouseY);
	}

    // drawing petal that is being held
	if (holdingPetal.id) {
		holdingPetal.draw();
	}

	me.info.justClicked = false;
	// setting correct cursor
	if (pointerCursor) {
		body.style.cursor = "pointer";
	} else {
		body.style.cursor = "auto";
	}
}
