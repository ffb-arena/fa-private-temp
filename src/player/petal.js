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
        this.maxHP = stats.hp;
        this.hp = stats.hp;
        this.inv = 0; // invincibility
        this.cooldownTimer = 0;
    }

    update(centre, degree, distance) {
        this.degree = degree;
        this.x = centre.x + Math.sin(degree) * distance;
        this.y = centre.y + Math.cos(degree) * distance;
        // if petal is dead
        if (this.hp <= 0 && !this.cooldownTimer) {
            this.hp = 0;
            this.cooldownTimer = Date.now() + this.cooldown;
        } else if (this.cooldownTimer < Date.now()) {
            // cooldown is up
            this.coooldownTimer = 0;
            this.hp = this.maxHP;
        }

        // if invincibility timer is up
        if (this.inv < Date.now()) {
            this.inv = 0;
        }
    }
}

module.exports = Petal;