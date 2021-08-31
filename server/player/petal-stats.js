const C = require("../consts.js");

const d = (petal, mul, centre, rad) => { // default behavior
	const change = petal.change * mul;
    const degree = (petal.degree + change) % (2 * Math.PI);
    petal.degree = degree;
    petal.pubInfo.x = centre.x + Math.sin(degree) * rad;
    petal.pubInfo.y = centre.y + Math.cos(degree) * rad;
}
const no = () => {}; // noop

const petalStats = {
	// haha's dev petal
	"-3": {
        radius: 16,
        cooldown: 50,
        damage: 30,
        health: 30,
		attack: d, defend: d, neutral: d, 
		post: no, // action to be done after updating petal
		equip: no
    },

    0: {
        radius: 0,
        cooldown: 0,
        damage: 0,
        hp: 0,
		attack: d, defend: d, neutral: d,
		post: no,
		equip: no
    },

    // basic
    1: {
        radius: 10,
        cooldown: 2500,
        damage: 10,
        hp: 10,
		attack: d, defend: d, neutral: d,
		post: no,
		equip: no
    },

	// fast
	2: {
		radius: 8,
		cooldown: 500,
		damage: 8,
		health: 5,
		attack: d, defend: d, neutral: d,
		post: no,
		equip: no
	},

    // heavy
	3: {
		radius: 12,
		cooldown: 5500,
		damage: 20,
		health: 20,
		attack: d, defend: d, neutral: d,
		post: no,
		equip: no
	},

    // iris
    4:{
        radius: 6,
		cooldown: 6000,
		damage: 5,
		health: 5,
		attack: d, defend: d, neutral: d,
		post: no,
		equip: no
    },

    // rose
    7:{
        radius: 11,
		cooldown: 3500,
		damage: 20,
		health: 20,
		attack: d, defend: d, neutral: d,
		post: (petal, centre, rad) => {
			rad = Math.min(rad, C.normal);
    		petal.pubInfo.x = centre.x + Math.sin(petal.degree) * rad;
    		petal.pubInfo.y = centre.y + Math.cos(petal.degree) * rad;
		},
		equip: no

    },

    //faster
    13: {
		radius: 8,
		cooldown: 500,
		damage: 8,
		health: 5,
		attack: d, defend: d, neutral: d,
		post: no,
		equip: no
	}
};

module.exports = petalStats;
