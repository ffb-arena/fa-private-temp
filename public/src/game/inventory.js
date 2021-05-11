const changeSpeed = 0.08;

const minInventoryWidth = 240;
const minInventoryHeight = 28
// 520 and 160 are the maxes
// 508 in game, but too small here
// and I'm too lazy to go in game and see how it handles it
const maxInventoryWidthAdd = 525 - 240;
const maxOnventoryHeightAdd = 160 - 28;
let inventoryWidth = minInventoryWidth;
let inventoryHeight = minInventoryHeight;
let sizeMult = 0;

// inventory vars (petals not in use)
const outlineWidth = 40;
const invWidth = 33;
const spaceBetweenInvIcons = 16;

// hotbar vars (petals in use)
const hotbarWidth = 45;
const hbOutline = 55;
const spaceBetweenHB = 18;


// draws inventory and stuff
function drawInventory() {

    // changes the size of black box
    if (stopText.innerHTML[0] === "M") {
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
    ctx.globalAlpha = 1;

    // stop moving text is in html

    // inventory boxes
    ctx.globalAlpha = 0.5;
    let x;
    x = window.innerWidth / 2 - spaceBetweenInvIcons * 3.5 - invWidth * 4;
    for (let i = 0; i < 8; i++) {
        ctx.fillStyle = "#dedede";
        ctx.roundRect(
            x - (outlineWidth - invWidth) / 2, 
            window.innerHeight - 40 - invWidth - (outlineWidth - invWidth) / 2, 
            outlineWidth, 
            outlineWidth, 
            2
        );
        ctx.fill();
    
        ctx.fillStyle = "#ffffff";
        ctx.roundRect(
            x, 
            window.innerHeight - 40  - invWidth, 
            invWidth, 
            invWidth, 
            2
        );
        ctx.fill();

        x += spaceBetweenInvIcons + invWidth;
    }

    // hotbar
    ctx.globalAlpha = 0.5;
    x = window.innerWidth / 2 - hotbarWidth * me.info.hotbar.length / 2 - spaceBetweenHB * Math.ceil(me.info.hotbar.length - 1) / 2
    for (let i = 0; i < me.info.hotbar.length; i++) {
        if (me.info.hotbar[0] === 0) {
            ctx.fillStyle = "#dedede";
            ctx.roundRect(
                x - (hbOutline - hotbarWidth) / 2, 
                window.innerHeight - 93 - hotbarWidth - (hbOutline - hotbarWidth) / 2, 
                hbOutline, 
                hbOutline, 
                4
            );
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.roundRect(
                x, 
                window.innerHeight - 93 - hotbarWidth, 
                hotbarWidth, 
                hotbarWidth, 
                0
            );
            ctx.fill();
        } else {

        }
        x += spaceBetweenHB + hotbarWidth;
    }
    ctx.globalAlpha = 1;
}