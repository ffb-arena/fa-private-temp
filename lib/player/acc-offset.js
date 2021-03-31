const C = require("../consts.js");
const F = require("../functions.js");
class AccOffset {
    constructor({ x, y }) {
        this.x = x;
        this.y = y;
    }

    update(mul) {
        if (this.x) {
            const oldAccelX = this.x;
            this.x -= C.wasdSmooth * mul * F.whichOne(oldAccelX);
            if (oldAccelX && ((oldAccelX <= 0) !== (this.x <= 0))) {
                this.x = 0;
            }
        }
        if (this.y) {
            const oldAccelY = this.y;
            this.y -= C.wasdSmooth * mul * F.whichOne(oldAccelY);
            if (oldAccelY && ((oldAccelY <= 0) !== (this.y <= 0))) {
                this.y = 0;
            }
        }
        return {
            delete: !(this.x || this.y),
            x: this.x,
            y: this.y
        };    
    }
}

module.exports = AccOffset;