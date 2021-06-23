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
    },

	// haha's dev petal
	6942: (p, c, ratio, radius) => {
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
};

// rarity colours
const rarityColours = {
    "common": {
        bg: "#68c058",
        fg: "#82ec71"
    },
	"haha": {
        bg: "#9c58c0",
        fg: "#e071ec",
    },
};

// which petals are which rarity
const rarities = {
    0: undefined,
    1: "common",
	2: "common",
	6942: "haha"
};

const petalNames = {
    1: "Basic",
	2: "Fast",
	6942: "haha"
};

// petal radii (for drawing the icon in inventory/hotbar)
const radii = {
	1: 10,
	2: 8,
	6942: 16
};

