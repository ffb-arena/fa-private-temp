const Petal = require("./petal.js");
const C = require("./consts.js");
const F = require("./functions.js");

class Flower {
    constructor(id, x, y, nOfPetals, name, bruh, lvl, ws) { // n is number of petals
        this.pubInfo = {
            name: name,
            x: x,
            y: y,
            health: 100,
            petals: [
                new Petal(1, 0, C.normal, { x: x, y: y }),
                new Petal(1, 2 * Math.PI / nOfPetals, C.normal, { x: x, y: y }),
                new Petal(1, 2 * Math.PI / nOfPetals * 2, C.normal, { x: x, y: y }),
                new Petal(1, 2 * Math.PI / nOfPetals * 3, C.normal, { x: x, y: y }),
                new Petal(1, 2 * Math.PI / nOfPetals * 4, C.normal, { x: x, y: y })
            ],
            face: 0
        }
        this.level = lvl;
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
            acc: {
                x: 0,
                y: 0
            },
            accOffset: {
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

        this.petalDist = C.normal; // radius
        this.client = ws;
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
        // this.movement.direction is accel * speed

        // updating the speeds and accelerations
        if (!this.keyboard) {

            // mouse movements
            if (this.mouse.mouseX || this.mouse.mouseY) {
                let totalDistance = Math.sqrt(Math.pow(this.mouse.mouseX, 2) + Math.pow(this.mouse.mouseY, 2));
                this.movement.speed = ((totalDistance / this.res / 200 > 1) ? 1 : totalDistance / this.res / 200);

                this.movement.speed *= C.acc.flower * C.friction * mul;
                this.movement.direction.x = this.mouse.mouseX;
                this.movement.direction.y = this.mouse.mouseY;

                let distance = Math.sqrt(Math.pow(this.movement.direction.x, 2) + Math.pow(this.movement.direction.y, 2));
                this.movement.direction.x /= distance;
                this.movement.direction.y /= distance;
            }

            this.movement.acc = {
                x: this.movement.direction.x,
                y: this.movement.direction.y
            };

            this.movement.direction.x *= this.movement.speed;
            this.movement.direction.y *= this.movement.speed;

            this.movement.direction.x += this.movement.accOffset.x * C.acc.flower * C.friction * mul;
            this.movement.direction.y += this.movement.accOffset.y * C.acc.flower * C.friction * mul;
        } else {

            // wasd movement
            this.movement.speed = C.acc.flower * C.friction * mul;

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
                this.movement.acc.x -= C.wasdSmooth * mul * (oldAccel / Math.abs(oldAccel));
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
                this.movement.acc.y -= C.wasdSmooth * mul * (oldAccel / Math.abs(oldAccel));
                if (oldAccel && ((oldAccel <= 0) !== (this.movement.acc.y <= 0))) {
                    this.movement.acc.y = 0;
                }
            }

            this.movement.direction.x = this.movement.acc.x * this.movement.speed;
            this.movement.direction.y = this.movement.acc.y * this.movement.speed;
        }

        // updating acc offsets for knockback
        if (this.movement.accOffset.x) {
            const oldAccelX = this.movement.accOffset.x;
            this.movement.accOffset.x -= C.wasdSmooth * mul * (oldAccelX / Math.abs(oldAccelX));
            if (oldAccelX && ((oldAccelX <= 0) !== (this.movement.accOffset.x <= 0))) {
                this.movement.accOffset.x = 0;
            }
        }
        if (this.movement.accOffset.y) {
            const oldAccelY = this.movement.accOffset.y;
            this.movement.accOffset.y -= C.wasdSmooth * mul * (oldAccelY / Math.abs(oldAccelY));
            if (oldAccelY && ((oldAccelY <= 0) !== (this.movement.accOffset.y <= 0))) {
                this.movement.accOffset.y = 0;
            }
        }

        this.movement.direction.x += this.movement.accOffset.x * C.acc.flower * C.friction * mul;
        this.movement.direction.y += this.movement.accOffset.y * C.acc.flower * C.friction * mul;

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

        // Updating rotation of each petal
        this.pubInfo.petals.forEach(petal => {
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