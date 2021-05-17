// random names array
const names = [
    "John",
    "Milk&Cookies",
    "Jeff",
    "THISGAMSUX",
    "DEVUPDATEDIEP",
    "[KH]shift2team",
    "IMPROE",
    "Im haxin",
    "BAXTRIX[EN]",
    "dunked on yt",
    "[MG]MasterOv",
    "GebitDiver",
    "no mates :(((",
    "PUS ABOVE ALL",
    "SaloonTerror"
];

// frame stuff
const frameRate = 25;
const frame = 1000 / frameRate;

// petal positions (radii)
const normal = 70;
const attack = 100; 
const defend = 38;

// entity speeds and knockback
const friction = 5;
const acc = { flower: 2.5 };
const knockbackMult = 2;
const petalBodyKnockbackMult = 0.5;

// smoothing stuff
const wasdSmooth = 0.1;
const petalLag = 0.35;
const petalSmooth = 5;

const limit = {
    "1": "min",
    "-1": "max"
};

// extra paddding to make sure we detect all collisions
const collisionPadding = 20;
const petalCollisionPadding = 0.5;

// petal invincibility after being hit, in ms
const petalInvincibility = 100;

// cooldown after pressing x, in ms
const maxXCooldown = 300;

module.exports = {
    names,
    frame, frameRate,
    normal, attack, defend,
    friction, acc, knockbackMult, petalBodyKnockbackMult,
    wasdSmooth, petalLag, petalSmooth,
    limit,
    collisionPadding, petalCollisionPadding,
    petalInvincibility,
    maxXCooldown
};
