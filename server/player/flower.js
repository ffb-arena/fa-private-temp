const Petal = require("./petal.js");
const C = require("../consts.js");
const F = require("../functions.js");
const E = require("../enums.js");

class Flower {
    constructor(id, x, y, level, name, bruh, inv, hb, ws) {
        const nOfPetals = 5 + Math.floor(level / 15);
        const maxHP = 100 + (level - 1) * 50/44;
        this.pubInfo = {
            name: name,
            x: x,
            y: y,
            maxHP: maxHP,
            hp: maxHP,
            petals: [],
            face: 0
        }

		this.petalChange = 2.5 / (1000 / C.frame);
        this.hotbar = [];
        for (let i = 0; i < nOfPetals; i++) {
			const id = hb[i];
            this.hotbar.push(id);
            const petal = new Petal(id, 2 * Math.PI / nOfPetals * i, C.normal, { x: x, y: y }, ws, i);
			petal.equip(this, petal);
            this.pubInfo.petals.push(petal);
			petal.respawn(petal, this);
        };
        this.inventory = [];
        for (let i = 0; i < 8; i++) {
            this.inventory.push(inv[i]);
        };

        this.level = level;
        this.petalNum = nOfPetals;
        this.id = id;
        this.res = undefined;
        this.keyboard = bruh;
        this.mouse = {
            mouseX: undefined,
            mouseY: undefined
        };
        this.keys = {
            upDown: false,
            downDown: false,
            rightDown: false,
            leftDown: false,

            upArrow: false,
            downArrow: false,
            rightArrow: false,
            leftArrow: false,

            space: false,
            shiftLeft: false,
            shiftRight: false,
            leftMouse: false,
            rightMouse: false
        };
        this.movement = {
            accOffsets: [],
            acc: {
                x: 0,
                y: 0
            },
            direction: {
                x: 0,
                y: 0
            },
            speed: undefined,
            xToAdd: undefined,
            yToAdd: undefined
        };
		this.debuffs = [];
        this.petalCentre = {
            x: x, 
            y: y
		};
		this.frozen = false;
        this.bodyDamage = Math.max(0, Math.min(25, (level - 8) * 25/7));
        this.healthRegen = this.pubInfo.maxHP / 100 * 1/60; // per tick

        this.petalDist = C.normal; // radius
        this.ws = ws;

        this.startingTime = Date.now();
        this.debug = [];

        this.deadPetals = [];
        this.deadPetalsToSend = [];
		this.state = E.STATE_NEUTRAL;

		this._hotbarCooldowns = [];
		for (let i = 0; i < nOfPetals; i++) {
			this._hotbarCooldowns.push(Date.now());
		}
        this._inventoryCooldowns = [];
        for (let i = 0; i < 8; i++) {
            this._inventoryCooldowns.push(Date.now());
        }
    }

    keyDown(key) {
        switch (key) {
            case "KeyW":
                this.keys.upDown = true;
                break;
            case "KeyS":
                this.keys.downDown = true;  
                break;
            case "KeyD":
                this.keys.rightDown = true;
                break;
            case "KeyA":
                this.keys.leftDown = true;
                break;

            case "ArrowUp":
                this.keys.upArrow = true;
                break;
            case "ArrowDown":
                this.keys.downArrow = true;
                break;
            case "ArrowLeft":
                this.keys.leftArrow = true;
                break;
            case "ArrowRight":
                this.keys.rightArrow = true;
                break;

            case "Space":
                this.keys.spaceDown = true;
                break;
            case "ShiftLeft":
                this.keys.shiftLeft = true;
                break;
            case "ShiftRight":
                this.keys.shiftRight = true;
                break;
            case "0": 
                this.keys.leftMouse = true;
                break;
            case "2": 
                this.keys.rightMouse = true;
                break;
        }
    }

    keyUp(key) {
        switch (key) {
            case "KeyW":
                this.keys.upDown = false;
                break;
            case "KeyS":
                this.keys.downDown = false;
                break;
            case "KeyD":
                this.keys.rightDown = false;
                break;
            case "KeyA":
                this.keys.leftDown = false;
                break;

            case "ArrowUp":
                this.keys.upArrow = false;
                break;
            case "ArrowDown":
                this.keys.downArrow = false;
                break;
            case "ArrowLeft":
                this.keys.leftArrow = false;
                break;
            case "ArrowRight":
                this.keys.rightArrow = false;
                break;

            case "Space":
                this.keys.spaceDown = false;
                break;
            case "ShiftLeft":
                this.keys.shiftLeft = false;
                break;
            case "ShiftRight":
                this.keys.shiftRight = false;
                break;
            case "0": 
                this.keys.leftMouse = false;
                break;
            case "2": 
                this.keys.rightMouse = false;
                break;
        }
    }

    // swapping petals checks
    swapPetalsChecks(invPetal, hotbarPetal) {
        if (this.inventory[invPetal] === this.hotbar[hotbarPetal]) return;
        if (this._inventoryCooldowns[invPetal] > Date.now() || this._hotbarCooldowns[hotbarPetal] > Date.now()) return;

        this._swapPetals(invPetal, hotbarPetal);
    }

    // swapping petals after checks have been passed
    _swapPetals(invPetal, hotbarPetal) {

        this._inventoryCooldowns[invPetal] = Date.now() + C.maxSwapCooldown;
		this._hotbarCooldowns[hotbarPetal] = Date.now() + C.maxSwapCooldown;

        let temp, oldPetal;
        temp = this.inventory[invPetal];
        this.inventory[invPetal] = this.hotbar[hotbarPetal];
        this.hotbar[hotbarPetal] = temp;

        oldPetal = this.pubInfo.petals[hotbarPetal];
		oldPetal.dequip(this, oldPetal);
        this.pubInfo.petals[hotbarPetal] = new Petal(this.hotbar[hotbarPetal], oldPetal.degree, 
            this.petalDist, this.petalCentre, oldPetal.ws, hotbarPetal);
        this.pubInfo.petals[hotbarPetal].reload();
		this.pubInfo.petals[hotbarPetal].equip(this, this.pubInfo.petals[hotbarPetal]);
    }

	// weird swaps where they can both be in inventory or hotbar
	weirdSwap(p1, p1InHotbar, p2, p2InHotbar) {

		// checks
		let p1Bar = p1InHotbar ? this.hotbar : this.inventory;
		let p2Bar = p2InHotbar ? this.hotbar : this.inventory;
		if (p1Bar[p1] === p2Bar[p2]) return;
	
		let p1Cooldown = p1InHotbar ? this._hotbarCooldowns : this._inventoryCooldowns;
		let p2Cooldown = p2InHotbar ? this._hotbarCooldowns : this._inventoryCooldowns;
		if (p1Cooldown[p1] > Date.now() || p2Cooldown[p2] > Date.now) return;
	

		// actual swapping
		let oldP1id, oldP2id;
		oldP1id = p1Bar[p1];
		oldP2id = p2Bar[p2];
		p1Bar[p1] = oldP2id;
		p2Bar[p2] = oldP1id;

        p1Cooldown[p1] = Date.now() + C.maxSwapCooldown;
		p2Cooldown[p2] = Date.now() + C.maxSwapCooldown;

		let oldP1, oldP2;
		oldP1 = this.pubInfo.petals[p1];
		oldP2 = this.pubInfo.petals[p2];

		if (p1InHotbar) {
			this.pubInfo.petals[p1].dequip(this, this.pubInfo.petals[p1]);
        	this.pubInfo.petals[p1] = new Petal(this.hotbar[p1], oldP1.degree, 
        	    this.petalDist, this.petalCentre, oldP1.ws, p1);
			this.pubInfo.petals[p1].reload();
			this.pubInfo.petals[p1].equip(this, this.pubInfo.petals[p1]);
		}
		if (p2InHotbar) {
			this.pubInfo.petals[p2].dequip(this, this.pubInfo.petals[p2]);
        	this.pubInfo.petals[p2] = new Petal(this.hotbar[p2], oldP2.degree, 
        	    this.petalDist, this.petalCentre, oldP2.ws, p2);
			this.pubInfo.petals[p2].reload();
			this.pubInfo.petals[p2].equip(this, this.pubInfo.petals[p2]);
		}
	}

    // updates position based on mouse position/keys down
	// also updates hp from debuffs
	// regen is done in server\room.js
    update(mul, maxX, maxY) { // maxX and maxY are room limits
        // this.movement.acc is the acceleration on both axes (between -1 and 1)
        // this.movement.speed is the speed

        let trueAcc = { // acceleration and all knockbacks
            x: 0,
            y: 0
        };


        // updating the speeds and accelerations
        if (!this.keyboard) {

            // mouse movements
            if (this.mouse.mouseX || this.mouse.mouseY) {
                let totalDistance = F.pythag(this.mouse.mouseX, this.mouse.mouseY);
                this.movement.speed = ((totalDistance / this.res / 200 > 1) ? 1 : totalDistance / this.res / 200);
                trueAcc.x = this.mouse.mouseX;
                trueAcc.y = this.mouse.mouseY;

                trueAcc = F.normalize(trueAcc);
		
				// bad stopping system	
				if (this.frozen) {
					trueAcc.x = 0;
					trueAcc.y = 0;
				}
            }

            trueAcc.x *= this.movement.speed;
            trueAcc.y *= this.movement.speed;
        } else {

            this.movement.speed = 1;
            // wasd movement
            const up = this.keys.upDown || this.keys.upArrow;
            const down = this.keys.downDown || this.keys.downArrow;
            const left = this.keys.leftDown || this.keys.leftArrow;
            const right = this.keys.rightDown || this.keys.rightArrow;
            
            // x axis
            if (right !== left) {
                const sign = right ? 1 : -1;
                if (up !== down) {
                    // diagonal
                    if (this.movement.acc.x > Math.SQRT1_2 * sign) {
                        this.movement.acc.x -= C.wasdSmooth * mul;
                    } else {
                        this.movement.acc.x += C.wasdSmooth * mul;
                    }
                } else {
                    this.movement.acc.x = Math[C.limit[sign]](this.movement.acc.x + C.wasdSmooth * mul * sign, 1 * sign);
                }
            } else if (this.movement.acc.x) {
                const oldAccel = this.movement.acc.x;
                this.movement.acc.x -= C.wasdSmooth * mul * Math.sign(oldAccel);
                if (oldAccel && ((oldAccel <= 0) !== (this.movement.acc.x <= 0))) {
                    this.movement.acc.x = 0;
                }
            }

            // y axis
            if (up !== down) {
                const sign = up ? 1 : -1;
                if (right !== left) {
                    // diagonal
                    if (this.movement.acc.y > Math.SQRT1_2 * sign) {
                        this.movement.acc.y -= C.wasdSmooth * mul;
                    } else {
                        this.movement.acc.y += C.wasdSmooth * mul;
                    }
                } else {
                    this.movement.acc.y = Math[C.limit[sign]](this.movement.acc.y + C.wasdSmooth * mul * sign, 1 * sign);
                }
            } else if (this.movement.acc.y) {
                const oldAccel = this.movement.acc.y;
                this.movement.acc.y -= C.wasdSmooth * mul * Math.sign(oldAccel);
                if (oldAccel && ((oldAccel <= 0) !== (this.movement.acc.y <= 0))) {
                    this.movement.acc.y = 0;
                }
            }

            trueAcc.x = this.movement.acc.x;
            trueAcc.y = this.movement.acc.y;
        }

		this.movement.accOffsets = this.movement.accOffsets.filter(accOffset => {
            let result = accOffset.update(mul);
            trueAcc.x += result.x;
            trueAcc.y += result.y;
            return result.delete;
		});

        trueAcc.x = F.clamp(trueAcc.x, -1, 1);
        trueAcc.y = F.clamp(trueAcc.y, -1, 1);
		
        this.movement.direction.x = trueAcc.x * C.acc.flower * C.friction * mul;
        this.movement.direction.y = trueAcc.y * C.acc.flower * C.friction * mul;

        // xToAdd and yToAdd are literally what they say they are
        if (this.movement.speed) {
            this.movement.xToAdd = F.clamp(
                this.pubInfo.x + this.movement.direction.x, 
                0, 
                maxX
            ) - this.pubInfo.x;
            this.movement.yToAdd = F.clamp(
                this.pubInfo.y + this.movement.direction.y, 
                0, 
                maxY
            ) - this.pubInfo.y;
            this.pubInfo.x += this.movement.xToAdd;
            this.pubInfo.y += this.movement.yToAdd;
        }

        this.deadPetals = [];

        // Updating petal lag
        this.petalCentre.x += C.petalLag * (this.pubInfo.x - this.petalCentre.x);
        this.petalCentre.y += C.petalLag * (this.pubInfo.y - this.petalCentre.y);

        if (this.keys.spaceDown 
            || this.keys.leftMouse) {
                this.petalDist = Math.min(C.attack, this.petalDist + C.petalSmooth * mul);
				this.state = E.STATE_ATTACK;
            }
        else if (this.keys.shiftLeft 
            || this.keys.shiftRight 
            || this.keys.rightMouse) {
                this.petalDist = Math.max(C.defend, this.petalDist - C.petalSmooth * mul);
				this.state = E.STATE_DEFEND;
            }
        else {
			this.state = E.STATE_NEUTRAL;
			this.petalDist = this.petalDist < C.normal
				? Math.min(this.petalDist + C.petalSmooth * mul)
				: Math.max(C.normal, this.petalDist - C.petalSmooth * mul);
        }
        
        // Updating rotation of each petal
        this.pubInfo.petals.forEach(petal => {
            petal.update(mul, this);
            if (petal.deadInfo.id) {
                this.deadPetals.push(petal.deadInfo);
                petal.deadInfo = {};
            }
        });

		// updating debuffs
		this.debuffs = this.debuffs.filter(debuff => {
			this.pubInfo.hp -= debuff.hpLoss * mul;
			return debuff.update();
		});
    }
}

module.exports = Flower;
