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
		this.playerHit = stats.playerHit; this.petalHit = stats.petalHit;
		this.respawn = stats.respawn;

        this.degree = degree;
        this.cooldown = stats.cooldown;
        this.damage = stats.damage;
        this.maxHP = stats.hp;
        this.hp = stats.hp;
        this.inv = 0; // invincibility timer
        this.cooldownTimer = 0;
		this.ws = ws;
		this.n = n; // position in hotbar
		this.debuffs = [];

        this.deadInfo = {};
    }

    update(mul, player) {
		const centre = { x: player.petalCentre.x, y: player.petalCentre.y };
		const distance = player.petalDist;
		const state = player.state;
		const change = player.petalChange;
		switch (state) {
			case -1: this.defend(this, mul, centre, distance, change); break;
			case  0: this.neutral(this, mul, centre, distance, change); break;
			case  1: this.attack(this, mul, centre, distance, change); break;
		}
		this.post(this, mul, centre, distance, player);
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
			this.respawn(this);
        }

        // if invincibility timer is up
        if (this.inv < Date.now()) {
            this.inv = 0;
        }

		this.debuffs = this.debuffs.filter(debuff => {
			this.hp -= debuff.hpLoss * mul;
			return debuff.update();
		});
    }

	reload() {
		this.hp = 0;
		this.debuffs = [];
		this.cooldownTimer = Date.now() + this.cooldown;
		if (this.pubInfo.id) this.ws.send(JSON.stringify(["e", this.n, this.cooldown]));
	}
}

module.exports = Petal;
