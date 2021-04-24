const Petal = require("./petal.js");
const C = require("../consts.js");
const F = require("../functions.js");

class Flower {
    constructor(id, x, y, level, name, bruh, ws) {
        const nOfPetals = 5 + Math.floor(level / 15);
        const maxHealth = 100 + (level - 1) * 50/44;
        this.pubInfo = {
            name: name,
            x: x,
            y: y,
            maxHealth: maxHealth,
            health: maxHealth,
            petals: [],
            face: 0
        }

        for (let i = 0; i < nOfPetals; i++) {
            const petal = new Petal(1, 2 * Math.PI / nOfPetals * i, C.normal, { x: x, y: y });
            this.pubInfo.petals.push(petal);
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
        this.petalCentre = {
            x: x, 
            y: y
        };
        this.bodyDamage = Math.max(0, Math.min(25, (level - 8) * 25/7));
        this.healthRegen = this.pubInfo.maxHealth / 100 * 1/60; // per tick

        this.petalDist = C.normal; // radius
        this.ws = ws;

        this.startingTime = Date.now();
        this.debug = [];
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

    // updates position based on mouse position/keys down
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
            }

            trueAcc.x *= this.movement.speed;
            trueAcc.y *= this.movement.speed;
        } else {
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

        this.movement.accOffsets.forEach((accOffset, i) => {
            let result = accOffset.update(mul);
            trueAcc.x += result.x;
            trueAcc.y += result.y;
            if (result.delete) this.movement.accOffsets.splice(i, 1);
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

        // Updating petal lag
        this.petalCentre.x += C.petalLag * (this.pubInfo.x - this.petalCentre.x);
        this.petalCentre.y += C.petalLag * (this.pubInfo.y - this.petalCentre.y);

        if (this.keys.spaceDown 
            || this.keys.leftMouse) {
                this.petalDist = Math.min(C.attack, this.petalDist + C.petalSmooth * mul);
            }
        else if (this.keys.shiftLeft 
            || this.keys.shiftRight 
            || this.keys.rightMouse) {
                this.petalDist = Math.max(C.defend, this.petalDist - C.petalSmooth * mul);
            }
        else {
            (this.petalDist < C.normal)
                ? this.petalDist = Math.min(this.petalDist + C.petalSmooth * mul)
                : this.petalDist = Math.max(C.normal, this.petalDist - C.petalSmooth * mul);
        }

        // Updating rotation of each petal
        this.pubInfo.petals.forEach(petal => {
            let change = petal.change * mul;
            let nextPetalDegree = petal.degree + change;
            if (nextPetalDegree > 2 * Math.PI) nextPetalDegree %= (2 * Math.PI);
            petal.update(
                {
                    x: this.petalCentre.x,
                    y: this.petalCentre.y
                }, 
                nextPetalDegree, 
                this.petalDist
            );
        });
    }
}

module.exports = Flower;