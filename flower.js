const normal = 70, attack = 100, defend = 38; // petal positions
const friction = 5;
const acc = { flower: 2.5 };
const diag = 1 / Math.SQRT2;
const wasdSmooth = 0.1;
const petalLag = 0.35;
const petalSmooth = 1.5;
const limit = {
    "1": "min",
    "-1": "max"
}
const Petal = require("./petal.js");
class Flower {
    constructor(id, x, y, n, name, bruh, ws) { // n is number of petals
        this.pubInfo = {
            name: name,
            x: x,
            y: y,
            health: 100,
            petals: [
                new Petal(1, 0, normal, { x: x, y: y }),
                new Petal(1, 2 * Math.PI / n, normal, { x: x, y: y }),
                new Petal(1, 2 * Math.PI / n * 2, normal, { x: x, y: y }),
                new Petal(1, 2 * Math.PI / n * 3, normal, { x: x, y: y }),
                new Petal(1, 2 * Math.PI / n * 4, normal, { x: x, y: y })
            ],
            face: 0
        }
        this.petalNum = n;
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
        this.distances = new Map();
        this.petalDist = normal;
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

    // updates position
    update(mul, maxX, maxY) {
        // this.movement.acc is the acceleration on both axes (between -1 and 1)
        // this.movement.speed is the speed
        // this.movement.direction is accel * speed

        // updating the speeds and accelerations
        if (!this.keyboard) {

            if (this.mouse.mouseX || this.mouse.mouseY) {
                let totalDistance = Math.sqrt(Math.pow(this.mouse.mouseX, 2) + Math.pow(this.mouse.mouseY, 2));
                this.movement.speed = ((totalDistance / this.res / 200 > 1) ? 1 : totalDistance / this.res / 200);

                this.movement.speed *= acc.flower * friction * mul;
                this.movement.direction.x = this.mouse.mouseX;
                this.movement.direction.y = this.mouse.mouseY;

                let distance = Math.sqrt(Math.pow(this.movement.direction.x, 2) + Math.pow(this.movement.direction.y, 2));
                this.movement.direction.x /= distance;
                this.movement.direction.y /= distance;
            }

            // updating accelerations (this is only used with knockback)
            if (this.movement.acc.x) {
                const oldAccelX = this.movement.acc.x;
                this.movement.acc.x -= wasdSmooth * mul * (oldAccelX / Math.abs(oldAccelX));
                if (oldAccelX && ((oldAccelX <= 0) !== (this.movement.acc.x <= 0))) {
                    this.movement.acc.x = 0;
                }
            }
            if (this.movement.acc.y) {
                const oldAccelY = this.movement.acc.y;
                this.movement.acc.y -= wasdSmooth * mul * (oldAccelY / Math.abs(oldAccelY));
                if (oldAccelY && ((oldAccelY <= 0) !== (this.movement.acc.y <= 0))) {
                    this.movement.acc.y = 0;
                }
            }

            this.movement.direction.x *= this.movement.speed;
            this.movement.direction.y *= this.movement.speed;

            this.movement.direction.x += this.movement.acc.x * acc.flower * friction * mul;
            this.movement.direction.y += this.movement.acc.y * acc.flower * friction * mul;
        } else {
            this.movement.speed = acc.flower * friction * mul;

            const up = this.keys.upDown || this.keys.upArrow;
            const down = this.keys.downDown || this.keys.downArrow;
            const left = this.keys.leftDown || this.keys.leftArrow;
            const right = this.keys.rightDown || this.keys.rightArrow;
            
            // x axis
            if (right !== left) {
                const sign = right ? 1 : -1;
                if (up !== down) {
                    // diagonal
                    if (this.movement.acc.x > diag * sign) {
                        this.movement.acc.x -= wasdSmooth * mul;
                    } else {
                        this.movement.acc.x += wasdSmooth * mul;
                    }
                } else {
                    this.movement.acc.x = Math[limit[sign]](this.movement.acc.x + wasdSmooth * mul * sign, 1 * sign);
                }
            } else if (this.movement.acc.x) {
                const oldAccel = this.movement.acc.x;
                this.movement.acc.x -= wasdSmooth * mul * (oldAccel / Math.abs(oldAccel));
                if (oldAccel && ((oldAccel <= 0) !== (this.movement.acc.x <= 0))) {
                    this.movement.acc.x = 0;
                }
            }

            // y axis
            if (up !== down) {
                const sign = up ? 1 : -1;
                if (right !== left) {
                    // diagonal
                    if (this.movement.acc.y > diag * sign) {
                        this.movement.acc.y -= wasdSmooth * mul;
                    } else {
                        this.movement.acc.y += wasdSmooth * mul;
                    }
                } else {
                    this.movement.acc.y = Math[limit[sign]](this.movement.acc.y + wasdSmooth * mul * sign, 1 * sign);
                }
            } else if (this.movement.acc.y) {
                const oldAccel = this.movement.acc.y;
                this.movement.acc.y -= wasdSmooth * mul * (oldAccel / Math.abs(oldAccel));
                if (oldAccel && ((oldAccel <= 0) !== (this.movement.acc.y <= 0))) {
                    this.movement.acc.y = 0;
                }
            }

            this.movement.direction.x = this.movement.acc.x * this.movement.speed;
            this.movement.direction.y = this.movement.acc.y * this.movement.speed;
        }

        // xToAdd and yToAdd are literally what they say they are
        if (this.movement.speed) {
            this.movement.xToAdd = Math.max(
                Math.min(
                    this.pubInfo.x + this.movement.direction.x,
                    maxX
                ),
                0
            ) - this.pubInfo.x;
            this.movement.yToAdd = Math.max(
                Math.min(
                    this.pubInfo.y + this.movement.direction.y,
                    maxY
                ),
                0
            ) - this.pubInfo.y;
            this.pubInfo.x += this.movement.xToAdd;
            this.pubInfo.y += this.movement.yToAdd;
        }

        // Updating petal lag
        this.petalCentre.x += petalLag * (this.pubInfo.x - this.petalCentre.x);
        this.petalCentre.y += petalLag * (this.pubInfo.y - this.petalCentre.y);

        // Updating rotation of each petal
        this.pubInfo.petals.forEach(petal => {
            if (this.keys.spaceDown 
                || this.keys.leftMouse) {
                    this.petalDist = Math.min(attack, this.petalDist + petalSmooth * mul);
                }
            else if (this.keys.shiftLeft 
                || this.keys.shiftRight 
                || this.keys.rightMouse) {
                    this.petalDist = Math.max(defend, this.petalDist - petalSmooth * mul);
                }
            else {
                (this.petalDist < normal)
                    ? this.petalDist = Math.min(this.petalDist + petalSmooth * mul)
                    : this.petalDist = Math.max(normal, this.petalDist - petalSmooth * mul);
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