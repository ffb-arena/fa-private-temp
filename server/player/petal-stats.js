// attack    = function(petal, mul, centre, rad, change)  called on attacking
// neutral   = function(petal, mul, centre, rad, change)  called on neutral position
// defend    = function(petal, mul, centre, rad, change)  called on defending
// post      = function(petal, mul, centre, rad, player)  called each frame after attack/neutral/defend
// equip     = function(player, petal)                    called on equiping
// dequip    = function(player, petal)                    called on dequipping
// petalHit  = function(petal, victim)                    called when this petal hits another
// playerHit = function(petal, player)                    called when this petal hits a player
// respawn   = function(petal, player)                    called when the petal respawns after a reload

const C = require("../consts.js");
const Debuff = require("./debuff.js");
const F = require("../functions.js");
const E = require("../enums.js");

const d = (petal, mul, centre, rad, change) => { // default attack/neutral/defend behavior
	change *= mul;
    const degree = (petal.degree + change) % (2 * Math.PI);
    petal.degree = degree;
    petal.pubInfo.x = centre.x + Math.sin(degree) * rad;
    petal.pubInfo.y = centre.y + Math.cos(degree) * rad;
}
const petalHitF = (petal, victim) => {
	victim.hp -= petal.damage;
}
const playerHitF = (petal, player) => {
	player.pubInfo.hp -= petal.damage;
	petal.hp -= player.bodyDamage;
}
const no = () => {}; // noop

class PetalStat {
	constructor({ radius, cooldown, damage, hp, attack=d, defend=d, neutral=d, 
			post=no, equip=no, dequip=no, petalHit=petalHitF, playerHit=playerHitF, respawn=no }) {
		if (radius === undefined || cooldown === undefined || damage === undefined || hp === undefined) {
			throw "Tried to make petal with an undefined essential prop";
		}
		this.radius = radius;
		this.cooldown = cooldown;
		this.damage = damage;
		this.hp = hp;
		this.attack = attack; this.defend = defend; this.neutral = neutral;
		this.post = post; this.equip = equip; this.dequip = dequip;
		this.petalHit = petalHit; this.playerHit = playerHit;
		this.respawn = respawn;
	}
}

const petalStats = {
	"-3": new PetalStat({ radius: 16, cooldown: 50  , damage: 30, hp: 30 }), // haha's dev petal
	0:    new PetalStat({ radius: 0 , cooldown: 0   , damage: 0 , hp: 0 }),
	1:    new PetalStat({ radius: 10, cooldown: 2500, damage: 10, hp: 10 }), // basic
	2:    new PetalStat({ radius: 8 , cooldown: 500 , damage: 8 , hp: 5 }),  // fast
	3:    new PetalStat({ radius: 12, cooldown: 5500, damage: 20, hp: 20 }), // heavy 
	4:    new PetalStat({ radius: 6 , cooldown: 6000, damage: 5 , hp: 5,     // iris
		petalHit: (petal, victim) => {
			victim.hp -= petal.damage;
			const isPoisoned = victim.debuffs // or/poison=victim.debuffs.type
				.map(d => d.type === E.DEBUFF_POISON)
				.reduce((acc, next) => acc || next, false);
			if (isPoisoned) return;
			victim.debuffs.push(new Debuff(E.DEBUFF_POISON, 9, 60));
		},
		playerHit: (petal, player) => {
			player.pubInfo.hp -= petal.damage;
			petal.hp -= player.bodyDamage;
			const isPoisoned = player.debuffs
				.map(d => d.type === E.DEBUFF_POISON)
				.reduce((acc, next) => acc || next, false);
			if (isPoisoned) return;
			player.debuffs.push(new Debuff(E.DEBUFF_POISON, 9, 60));
		}}),
	7: new PetalStat({ radius: 11, cooldown: 3500, damage: 20, hp: 20,       // rose
		equip: (_, petal) => { petal.healTime = Date.now() + 1000; petal.healing = false; petal.healingRad = 0; },
		respawn: petal => { petal.healTime = Date.now() + 1000; petal.healing = false; petal.healingRad = 0; },
		post: (petal, mul, centre, rad, player) => {
			rad = Math.min(rad, C.normal);
			if (petal.healing) {
				petal.healingRad = Math.max(0, petal.healingRad - 2 * mul);
				rad = petal.healingRad;
			} else if (Date.now() > petal.healTime && player.pubInfo.hp < player.pubInfo.maxHP) {
				petal.healing = true;
				petal.healingRad = rad;
			}
    		petal.pubInfo.x = centre.x + Math.sin(petal.degree) * rad;
    		petal.pubInfo.y = centre.y + Math.cos(petal.degree) * rad;
			const dist = F.pythag(player.pubInfo.x - petal.pubInfo.x, player.pubInfo.y - petal.pubInfo.y);
			if (dist < (C.playerR - petal.pubInfo.radius / 2) && petal.healing) {
				player.pubInfo.hp = Math.min(player.pubInfo.hp + 10, player.pubInfo.maxHP);
				petal.healTime = Infinity; // make sure it doesn't try to heal while reloading
				petal.healing = false;
				petal.healingRad = 0;
				petal.reload();
			}
		}}),
	13: new PetalStat({ radius: 8, cooldown: 500, damage: 8, hp: 5,
		equip: (_, petal) => petal.loaded = false,
		respawn: (petal, player) => {
			if (!petal.loaded) {
				petal.loaded = true;
				player.petalChange += 0.8 / (1000 / C.frame);
			}
		},
		dequip: player => player.petalChange -= 0.8 / (1000 / C.frame) }),  // faster
};

module.exports = petalStats;
