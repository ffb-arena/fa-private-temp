// instructions to render each petal
// the param p is the petal, from the Petal class (src/player/petal.js relative to dir root)
const petals = {
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
    }
};

// rarity colours
const rarityColours = {
    "common": {
        bg: "#68c058",
        fg: "#82ec71"
    }
};

// which petals are which rarity
const rarities = {
    0: undefined,
    1: "common",
	2: "common"
};

const petalNames = {
    1: "Basic",
	2: "Fast"
};

// petal radii
const radii = {
	1: 10,
	2: 8
};

