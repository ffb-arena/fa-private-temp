function drawPetalIcon(pos, name, id, width, backgroundColour, foregroundColour, globalAlpha, c) {
    c.globalAlpha = globalAlpha;

    // background square
    c.fillStyle = backgroundColour;
    c.strokeStyle = backgroundColour;
    c.roundRect(pos.x, pos.y, width, width, width / 30);
    c.fill();

    // foreground square
    const newWidth = width * 13/16;
    c.fillStyle = foregroundColour;
    c.strokeStyle = foregroundColour;
    c.roundRect(pos.x + (width - newWidth) / 2, pos.y + (width - newWidth) / 2, newWidth, newWidth, newWidth / 30);
    c.fill();

    // text
    florrText(name, width / 4.5, { x: pos.x + width / 2, y: pos.y + width * 0.7 }, 30, c);

    c.globalAlpha = 1;

    // image
    petals[id]({ x: pos.x + width / 2, y: pos.y + width * 2/5 }, c, 1, width / 6);
}


const changeSpeed = 0.08;

const minInventoryWidth = 240;
const minInventoryHeight = 28
// 530 and 160 are the maxes
// 508 in game, but too small here
// and I'm too lazy to go in game and see how it handles it
const maxInventoryWidthAdd = 530 - 240;
const maxOnventoryHeightAdd = 160 - 28;
let inventoryWidth = minInventoryWidth;
let inventoryHeight = minInventoryHeight;
let sizeMult = 0;

// inventory vars (petals not in use)
const outlineWidth = 40;
const invWidth = outlineWidth * 13/16;
const spaceBetweenInvIcons = 16;

// hotbar vars (petals in use)
const hbOutline = 55;
const hotbarWidth = hbOutline * 13/16;
const spaceBetweenHB = 18;


// draws inventory and stuff
function drawInventory() {

    // changes the size of black box
    if (stopText[0] === "M") {
        // player isn't stopped
        sizeMult = Math.max(sizeMult - changeSpeed, 0);
    } else {
        // player is stopped
        sizeMult = Math.min(sizeMult + changeSpeed, 1);
    }
    inventoryWidth = minInventoryWidth + (sizeMult * maxInventoryWidthAdd);
    inventoryHeight = minInventoryHeight + (sizeMult * maxOnventoryHeightAdd);
    // stop moving rectangle
    ctx.fillStyle = "#000000";
    ctx.globalAlpha = 0.4;
    ctx.roundRect(
        window.innerWidth / 2 - inventoryWidth / 2,
        window.innerHeight - inventoryHeight,
        inventoryWidth,
        inventoryHeight + 20,
        7
    );
    ctx.fill();

    // stop moving text
    florrText(stopText, 11.9,
        { x: window.innerWidth / 2, y: window.innerHeight - 15 }, 35, ctx);

    // inventory boxes
    ctx.globalAlpha = 0.5;
    let x;
    x = window.innerWidth / 2 - spaceBetweenInvIcons * 3.5 - invWidth * 4;
    if (me.info.inventory.length === 0) return;
    for (let i = 0; i < 8; i++) {
        if (me.info.inventory[i] === 0) {
            drawPetalIcon({ x: x - (outlineWidth - invWidth) / 2, y: window.innerHeight - 45 - invWidth - (invWidth - invWidth) / 2 },
                "", 0, outlineWidth, "#dedede", "#ffffff", 0.5, ctx);
        } else {
            const colours = rarityColours[rarities[me.info.inventory[i]]];
            drawPetalIcon({ x: x - (outlineWidth - invWidth) / 2, y: window.innerHeight - 45 - invWidth - (invWidth - invWidth) / 2 },
                petalNames[me.info.inventory[i]], me.info.inventory[i], outlineWidth, colours.bg, colours.fg, 0.9, ctx);
        }

        x += spaceBetweenInvIcons + invWidth;
    }

    // hotbar
    x = window.innerWidth / 2 - hotbarWidth * me.info.hotbar.length / 2 - spaceBetweenHB * Math.ceil(me.info.hotbar.length - 1) / 2
    for (let i = 0; i < me.info.hotbar.length; i++) {
        if (me.info.hotbar[i] === 0) {
            drawPetalIcon({ x: x - (hbOutline - hotbarWidth) / 2, y: window.innerHeight - 93 - hotbarWidth - (hbOutline - hotbarWidth) / 2 },
                "", 0, hbOutline, "#dedede", "#ffffff", 0.5, ctx);
        } else {
            const colours = rarityColours[rarities[me.info.hotbar[i]]];
            drawPetalIcon({ x: x - (hbOutline - hotbarWidth) / 2, y: window.innerHeight - 93 - hotbarWidth - (hbOutline - hotbarWidth) / 2 },
                petalNames[me.info.hotbar[i]], me.info.hotbar[i], hbOutline, colours.bg, colours.fg, 0.9, ctx);
        }

        x += spaceBetweenHB + hotbarWidth;
    }
    ctx.globalAlpha = 1;
}