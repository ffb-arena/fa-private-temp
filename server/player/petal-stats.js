const C = require("../consts.js");
const Debuff = require("./debuff.js");

const d = (petal, mul, centre, rad, change) => { // default behavior
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

// post is an action to be done after updating petal
class PetalStat {
	constructor({ radius, cooldown, damage, hp, attack=d, defend=d, neutral=d, 
			post=no, equip=no, dequip=no, petalHit=petalHitF, playerHit=playerHitF }) {
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
	}
}

const petalStats = {
	"-3": new PetalStat({ radius: 16, cooldown: 50, damage: 30, hp: 30 }), // haha's dev petal
	0: new PetalStat({ radius: 0, cooldown: 0, damage: 0, hp: 0 }),
	1: new PetalStat({ radius: 10, cooldown: 2500, damage: 10, hp: 10 }), // basic
	2: new PetalStat({ radius: 8, cooldown: 500, damage: 8, hp: 5 }), // fast
	3: new PetalStat({ radius: 12, cooldown: 5500, damage: 20, hp: 20 }), // heavy 
	4: new PetalStat({ radius: 6, cooldown: 6000, damage: 5, hp: 5,
		petalHit: (petal, victim) => {
			victim.debuffs.push(new Debuff(9, 60));
			victim.hp -= petal.damage;
		},
		playerHit: (petal, player) => {
			player.debuffs.push(new Debuff(9, 60));
			player.pubInfo.hp -= petal.damage;
			petal.hp -= player.bodyDamage;
		} }), // iris
	7: new PetalStat({ radius: 11, cooldown: 3500, damage: 20, hp: 20, // rose
		post: (petal, centre, rad) => {
			rad = Math.min(rad, C.normal);
    		petal.pubInfo.x = centre.x + Math.sin(petal.degree) * rad;
    		petal.pubInfo.y = centre.y + Math.cos(petal.degree) * rad;
		}}),
	13: new PetalStat({ radius: 8, cooldown: 500, damage: 8, hp: 5,
		equip: player => player.petalChange += 0.8 / (1000 / C.frame),
		dequip: player => player.petalChange -= 0.8 / (1000 / C.frame) }), // faster
};

module.exports = petalStats;
