const d = (petal, mul, centre, rad) => { // default behavior
	const change = petal.change * mul;
    const degree = (petal.degree + change) % (2 * Math.PI);
    petal.degree = degree;
    petal.pubInfo.x = centre.x + Math.sin(degree) * rad;
    petal.pubInfo.y = centre.y + Math.cos(degree) * rad;
}

const petalStats = {
	// haha's dev petal
	"-3": {
        radius: 16,
        cooldown: 50,
        damage: 30,
        health: 30,
		attack: d,
		defend: d,
		neutral: d
    },

    0: {
        radius: 0,
        cooldown: 0,
        damage: 0,
        hp: 0,
		attack: d,
		defend: d,
		neutral: d
    },

    // basic
    1: {
        radius: 10,
        cooldown: 2500,
        damage: 10,
        hp: 10,
		attack: d,
		defend: d,
		neutral: d
    },

	// fast
	2: {
		radius: 8,
		cooldown: 500,
		damage: 8,
		health: 5,
		attack: d,
		defend: d,
		neutral: d
	},

    // heavy
	3: {
		radius: 12,
		cooldown: 5500,
		damage: 20,
		health: 20,
		attack: d,
		defend: d,
		neutral: d
	},
    // iris
    4:{
        radius: 6,
		cooldown: 6000,
		damage: 5,
		health: 5,
		attack: d,
		defend: d,
		neutral: d
    },
    // rose
    7:{
        radius: 11,
		cooldown: 3500,
		damage: 20,
		health: 20,
		attack: d,
		defend: d,
		neutral: d
    },
    //faster
    13: {
		radius: 8,
		cooldown: 500,
		damage: 8,
		health: 5,
		attack: d,
		defend: d,
		neutral: d
	}
};

module.exports = petalStats;
