const C = require("../consts.js");
const petalStats = require("./petal-stats.js");

class Petal {
    constructor(id, degree, coordR, centre) {
        this.id = id;
        this.degree = degree;
        this.x = centre.x + Math.sin(degree) * coordR;
        this.y = centre.y + Math.cos(degree) * coordR;
        this.change = 2.5 / (1000 / C.frame);

        const stats = petalStats[this.id];
        this.radius = stats.radius;
        this.cooldown = stats.cooldown;
        this.damage = stats.damage;
        this.hp = stats.hp;
    }

    update(centre, degree, distance) {
        this.degree = degree;
        this.x = centre.x + Math.sin(degree) * distance;
        this.y = centre.y + Math.cos(degree) * distance;
    }
}

module.exports = Petal;