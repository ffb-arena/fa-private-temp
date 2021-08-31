const C = require("../consts.js");
const petalStats = require("./petal-stats.js");

class Petal {
    constructor(id, degree, coordR, centre, ws, n) {
        const stats = petalStats[id];

        this.pubInfo = {
            id: id,
            x: centre.x + Math.sin(degree) * coordR,
            y: centre.y + Math.cos(degree) * coordR,
            radius: stats.radius
        }

		this.attack = stats.attack; this.defend = stats.defend; this.neutral = stats.neutral;
		this.post = stats.post;     this.equip = stats.equip;   this.dequip = stats.dequip;
		this.playerHit = stats.playerHit; this.petalHit = stats.petalHIt;

        this.degree = degree;
        this.cooldown = stats.cooldown;
        this.damage = stats.damage;
        this.maxHP = stats.hp;
        this.hp = stats.hp;
        this.inv = 0; // invincibility
        this.cooldownTimer = 0;
		this.ws = ws;
		this.n = n; // position in hotbar

        this.deadInfo = {};
    }

    update(mul, centre, distance, state, change) {
		switch (state) {
			case -1: this.defend(this, mul, centre, distance, change); break;
			case  0: this.neutral(this, mul, centre, distance, change); break;
			case  1: this.attack(this, mul, centre, distance, change); break;
		}
		this.post(this, centre, distance);
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
		if (this.pubInfo.id) this.ws.send(JSON.stringify(["e", this.n, this.cooldown]));
	}
}

module.exports = Petal;
