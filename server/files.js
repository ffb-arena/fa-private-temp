// list of all client files that need to be combined
// may break if you change the order (let and const are hoisted but not initialized)
const files = [ // (in public folder already)
    ["index.js"],
    ["src", "ws.js"],
    ["src", "florr-text.js"],
    ["src", "game", "petals.js"],
    ["src", "petal-background.js"],
    ["src", "game", "rendering.js"],
    ["src", "game", "player.js"],
    ["src", "game", "dead-petal.js"],
    ["src", "game", "inventory.js"],
    ["src", "menu.js"],
];
module.exports = files;
