const C = require("../consts.js");
const petalStats = require("./petal-stats.js");

class Petal {
    constructor(id, degree, coordR, centre) {
        const stats = petalStats[id];

        this.pubInfo = {
            id: id,
            x: centre.x + Math.sin(degree) * coordR,
            y: centre.y + Math.cos(degree) * coordR,
            radius: stats.radius
        }


        this.change = 2.5 / (1000 / C.frame);
        this.degree = degree;
        this.cooldown = stats.cooldown;
        this.damage = stats.damage;
        this.maxHP = stats.hp;
        this.hp = stats.hp;
        this.inv = 0; // invincibility
        this.cooldownTimer = 0;

        this.deadInfo = {};
    }

    update(centre, degree, distance) {
        this.degree = degree;
        this.pubInfo.x = centre.x + Math.sin(degree) * distance;
        this.pubInfo.y = centre.y + Math.cos(degree) * distance;
        
        // if petal is dead
        if (this.hp <= 0 && !this.cooldownTimer) {
			this.reload();

            // for client death animations
            this.deadInfo = {
                x: this.pubInfo.x,
                y: this.pubInfo.y,
                id: this.pubInfo.id, 
                radius: this.pubInfo.radius
            }
        } else if (this.cooldownTimer && this.cooldownTimer < Date.now()) {
            // cooldown is up
            this.cooldownTimer = 0;
            this.hp = this.maxHP;
        }

        // if invincibility timer is up
        if (this.inv < Date.now()) {
            this.inv = 0;
        }
    }

	reload() {
		this.hp = 0;
		this.cooldownTimer = Date.now() + this.cooldown;
	}
}

module.exports = Petal;
