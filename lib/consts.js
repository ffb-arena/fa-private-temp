const names = [
    "John",
    "Milk&Cookies",
    "Jeff",
    "THISGAMSUX",
    "DEVUPDATEDIEP",
    "[KH]shift2team",
    "poopsock",
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
const frame = 1000 / 25;
const normal = 70, attack = 100, defend = 38; // petal positions (radii)
const friction = 5;
const acc = { flower: 2.5 };
const wasdSmooth = 0.1;
const petalLag = 0.35;
const petalSmooth = 1.5;
const limit = {
    "1": "min",
    "-1": "max"
};

module.exports = {
    names,
    frame,
    normal, attack, defend,
    friction,
    acc,
    wasdSmooth,
    petalLag,
    petalSmooth,
    limit
};