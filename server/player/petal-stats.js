const C = require("../consts.js");

const d = (petal, mul, centre, rad) => { // default behavior
	const change = petal.change * mul;
    const degree = (petal.degree + change) % (2 * Math.PI);
    petal.degree = degree;
    petal.pubInfo.x = centre.x + Math.sin(degree) * rad;
    petal.pubInfo.y = centre.y + Math.cos(degree) * rad;
}
const no = () => {}; // noop

// post is an action to be done after updating petal
class PetalStat {
	constructor({ radius, cooldown, damage, health, attack=d, defend=d, neutral=d, post=no, equip=no }) {
		if (radius === undefined || cooldown === undefined || damage === undefined || health === undefined) {
			throw "Tried to make petal with an undefined essential prop";
		}
		this.radius = radius;
		this.cooldown = cooldown;
		this.damage = damage;
		this.health = health;
		this.attack = attack; this.defend = defend; this.neutral = neutral;
		this.post = post; this.equip = equip;
	}
}

const petalStats = {
	"-3": new PetalStat({ radius: 16, cooldown: 50, damage: 30, health: 30 }), // haha's dev petal
	0: new PetalStat({ radius: 0, cooldown: 0, damage: 0, health: 0 }),
	1: new PetalStat({ radius: 10, cooldown: 2500, damage: 10, health: 10 }), // basic
	2: new PetalStat({ radius: 8, cooldown: 500, damage: 8, health: 5 }), // fast
	3: new PetalStat({ radius: 12, cooldown: 5500, damage: 20, health: 20 }), // heavy 
	4: new PetalStat({ radius: 6, cooldown: 6000, damage: 5, health: 5 }), // iris
	7: new PetalStat({ radius: 11, cooldown: 3500, damage: 20, health: 20, // rose
		post: (petal, centre, rad) => {
			rad = Math.min(rad, C.normal);
    		petal.pubInfo.x = centre.x + Math.sin(petal.degree) * rad;
    		petal.pubInfo.y = centre.y + Math.cos(petal.degree) * rad;
		}}),
	13: new PetalStat({ radius: 8, cooldown: 500, damage: 8, health: 5 }), // faster
};

module.exports = petalStats;
