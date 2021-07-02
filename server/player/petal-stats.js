const petalStats = {
	// haha's dev petal
	"-3": {
        radius: 16,
        cooldown: 50,
        damage: 30,
        health: 30,
    },

    0: {
        radius: 0,
        cooldown: 0,
        damage: 0,
        hp: 0
    },

    // basic
    1: {
        radius: 10,
        cooldown: 2500,
        damage: 10,
        hp: 10
    },

	// fast
	2: {
		radius: 8,
		cooldown: 500,
		damage: 8,
		health: 5
	},

    // heavy
	3: {
		radius: 12,
		cooldown: 5500,
		damage: 20,
		health: 20
	},
    // iris
    4:{
        radius: 6,
		cooldown: 5500,
		damage: 20,
		health: 20
    },
    // rose
    5:{
        radius: 11,
		cooldown: 3000,
		damage: 20,
		health: 20
    },
    //faster
    6: {
		radius: 8,
		cooldown: 500,
		damage: 8,
		health: 5
	},


};

module.exports = petalStats;
