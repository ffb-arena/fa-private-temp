// instructions to render each petal
// the param p is the petal, from the Petal class (src/player/petal.js relative to dir root)
const petals = {

	// haha's dev petal
	"-3": (p, c, ratio, radius) => {
        radius = radius || p.radius;
        ratio = ratio || 1;

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
    1: (p, c, ratio, radius) => {
        radius = radius || p.radius;
        ratio = ratio || 1;

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
    2: (p, c, ratio, radius) => {
        radius = radius || p.radius;
        ratio = ratio || 1;

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
    3: (p, c, ratio, radius) => {
        radius = radius || p.radius;
        ratio = ratio || 1;

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
    4: (p, c, ratio, radius) => {
        radius = radius || p.radius;
        ratio = ratio || 1;

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
    5: (p, c, ratio, radius) => {
        radius = radius || p.radius;
        ratio = ratio || 1;

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
     6: (p, c, ratio, radius) => {
        radius = radius || p.radius;
        ratio = ratio || 1;

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
const rarityColours = {
	"empty": {
		bg: "#dedede",
		fg: "#ffffff"
	},
    "common": {
        bg: "#68c058",
        fg: "#82ec71"
    },
    "unusual": {
        bg: "#ceba4a",
        fg: "#ffe65d"
    },
    "rare": {
        bg: "#4c3fb7",
        fg: "#5e4de2"
    },

	"haha": {
        bg: "#9c58c0",
        fg: "#e071ec",
    },
};

// which petals are which rarity
const rarities = {
	"-3": "haha",
    0: "empty",
    1: "common",
	2: "common",
    3: "common",
    4: "unusual",
    5: "unusual",
    6: "rare"
};

const petalNames = {
	"-3": "haha",
	0: "",
    1: "Basic",
	2: "Fast",
    3: "Heavy",
    4: "Iris",
    5: "Rose",
    6: "Faster"
};
