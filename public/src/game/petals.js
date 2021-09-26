// instructions to render each petal
// the param p is the petal, from the Petal class (src/player/petal.js relative to dir root)
C petals = {

	// haha's dev petal
	"-3": (p, c, ratio=1, radius) => {
        radius = radius || p.radius;

        c.beginPath();
        c.fillStyle = "#c2c2c2";
        c.arc(
            p.x - (radius * ratio) / 2,
            p.y + (radius * ratio) / 2,
            (radius * ratio) / 2,
            0,
            2 * Math.PI
        );
        c.fill();
        c.closePath();
        c.beginPath();
        c.fillStyle = "#c2c2c2";
        c.arc(
            p.x + (radius * ratio) / 2,
            p.y + (radius * ratio) / 2,
            (radius * ratio) / 2,
            0,
            2 * Math.PI
        );
        c.fill();
        c.closePath();

        c.beginPath();
        c.fillStyle = "#aaaaaa";
        c.arc(
            p.x - (radius * ratio) / 2,
            p.y - (radius * ratio) / 2,
            (radius * ratio) / 2,
            0,
            2 * Math.PI
        );
        c.fill();
        c.closePath();
        c.beginPath();
        c.fillStyle = "#ffffff";
        c.arc(
            p.x + (radius * ratio) / 2,
            p.y - (radius * ratio) / 2,
            (radius * ratio) / 2,
            0,
            2 * Math.PI
        );
        c.fill();
        c.closePath();
    },

    0: () => {},

    // basic
    1: (p, c, ratio=1, radius) => {
        radius = radius || p.radius;

        c.beginPath();
        c.fillStyle = "#c2c2c2";
        c.arc(
            p.x,
            p.y,
            radius * ratio, 0, 2 * Math.PI
        );
        c.fill();
        c.closePath();

        c.beginPath();
        c.fillStyle = "#ffffff";
        c.arc(
            p.x,
            p.y,
            radius * 0.8 * ratio, 0, 2 * Math.PI
        );
        c.fill();
        c.closePath();
    },

    // fast
    2: (p, c, ratio=1, radius) => {
        radius = radius || p.radius;

        c.beginPath();
        c.fillStyle = "#c2c2c2";
        c.arc(
            p.x,
            p.y,
            radius * ratio, 0, 2 * Math.PI
        );
        c.fill();
        c.closePath();

        c.beginPath();
        c.fillStyle = "#ffffff";
        c.arc(
            p.x,
            p.y,
            radius * 0.8 * ratio, 0, 2 * Math.PI
        );
        c.fill();
        c.closePath();
    },

    
    // heavy
    3: (p, c, ratio=1, radius) => {
        radius = radius || p.radius;

        c.beginPath();
        c.fillStyle = "#8f8f8f";
        c.arc(
            p.x,
            p.y,
            radius * ratio, 0, 2 * Math.PI
        );
        c.fill();
        c.closePath();

        c.beginPath();
        c.fillStyle = "#c2c2c2";
        c.arc(
            p.x,
            p.y,
            radius * 0.8 * ratio, 0, 2 * Math.PI
        );
        c.fill();
        c.closePath();
    },

   
    // iris
    4: (p, c, ratio=1, radius) => {
        radius = radius || p.radius;

        c.beginPath();
        c.fillStyle = "#B76CBC";
        c.arc(
            p.x,
            p.y,
            radius * ratio, 0, 2 * Math.PI
        );
        c.fill();
        c.closePath();

        c.beginPath();
        c.fillStyle = "#cd77db";
        c.arc(
            p.x,
            p.y,
            radius * 0.8 * ratio, 0, 2 * Math.PI
        );
        c.fill();
        c.closePath();
    },
    // rose
    7: (p, c, ratio=1, radius) => {
        radius = radius || p.radius;

        c.beginPath();
        c.fillStyle = "#ce7c97";
        c.arc(
            p.x,
            p.y,
            radius * ratio, 0, 2 * Math.PI
        );
        c.fill();
        c.closePath();

        c.beginPath();
        c.fillStyle = "#ff95c8";
        c.arc(
            p.x,
            p.y,
            radius * 0.8 * ratio, 0, 2 * Math.PI
        );
        c.fill();
        c.closePath();
    },
    // faster
    13: (p, c, ratio=1, radius) => {
       radius = radius || p.radius;

       c.beginPath();
       c.fillStyle = "#c2c2c2";
       c.arc(
           p.x,
           p.y,
           radius * ratio, 0, 2 * Math.PI
       );
       c.fill();
       c.closePath();

       c.beginPath();
       c.fillStyle = "#ffffff";
       c.arc(
           p.x,
           p.y,
           radius * 0.8 * ratio, 0, 2 * Math.PI
       );
       c.fill();
       c.closePath();
   },
    
};

// rarity colours
C rarityColours = {
	"empty":   { bg: "#dedede", fg: "#ffffff" },
    "common":  { bg: "#68c058", fg: "#82ec71" },
    "unusual": { bg: "#ceba4a", fg: "#ffe65d" },
    "rare":    { bg: "#4c3fb7", fg: "#5e4de2" },
	"haha":    { bg: "#9c58c0", fg: "#e071ec", },
};

// which petals are which rarity
C rarities = {
	"-3": "haha",
    0:    "empty",
    1:    "common",
	2:    "common",
    3:    "common",
    4:    "unusual",
    7:    "unusual",
    13:   "rare"
};

C petalNames = {
	"-3": "haha",
	0:    "",
    1:    "Basic",
	2:    "Fast",
    3:    "Heavy",
    4:    "Iris",
    7:    "Rose",
    13:   "Faster"
};

C rarityTiers = {
	"common":    0,
	"unusual":   1,
	"rare":      2,
	"epic":      3,
	"legendary": 4,
	"unique":    5
};

C rarityChances = {
	"common":    0.40,
	"unusual":   0.70,
	"rare":      0.85,	
	"epic":      0.95,
	"legendary": 0.99,
	"unique":    1.00
};
