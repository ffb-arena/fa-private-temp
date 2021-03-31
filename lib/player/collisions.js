const F = require("../functions.js");
const C = require("../consts.js");
const AccOffset = require("./acc-offset.js");

// collisions where one player is not moving
function handleStillCollision(p1, p2, mul, notMoving) {
    let divide = C.acc.flower * C.friction * mul; // divide by this to make x/yToAdd between 0 and 1
    let players = [];
    if (notMoving === 1) { // players[0] is still
        players = [p1, p2]; // players[1] is moving
    } else {
        players = [p2, p1];
    }

    // setting moving player's accelerations in the opposite directions
    let cV = { // current velocities
        x: -players[1].movement.xToAdd / divide,
        y: -players[1].movement.yToAdd / divide
    };

    // making minimum amount of knockback and applying knockback
    // let posOrNeg = {
    //     x: F.whichOne(cV.x),
    //     y: F.whichOne(cV.y)
    // }
    // players[1].movement.accOffset.x = cV.x * posOrNeg.x * 1.15;
    // players[1].movement.accOffset.y = cV.y * posOrNeg.y * 1.15;
    // players[1].movement.accOffset.x = Math.max(0.6, players[1].movement.accOffset.x);
    // players[1].movement.accOffset.y = Math.max(0.6, players[1].movement.accOffset.y);
    // players[1].movement.accOffset.x *= posOrNeg.x;
    // players[1].movement.accOffset.y *= posOrNeg.y;


    // fixing overlap
    const currentDist = F.pythag( // current distance between players
        players[1].pubInfo.x - players[0].pubInfo.x, 
        players[1].pubInfo.y - players[0].pubInfo.y
    );
    const lastFrameDist = F.pythag(
        players[1].pubInfo.x - players[1].movement.xToAdd - players[0].pubInfo.x, 
        players[1].pubInfo.y - players[1].movement.yToAdd - players[0].pubInfo.y
    ) - currentDist;
    const wantedDist = 50 - currentDist;
    const offsetToAdd = wantedDist / lastFrameDist;
    players[1].pubInfo.x -= players[1].movement.xToAdd * offsetToAdd;
    players[1].pubInfo.y -= players[1].movement.yToAdd * offsetToAdd;

    // still object gets the other object's velocity
    // but this seems to little, so multiply it by 2
    players[0].movement.accOffsets.push(new AccOffset({
        x: players[1].movement.xToAdd / divide * 2,
        y: players[1].movement.yToAdd / divide * 2
    }));
}

// knockback between 2 players
function handleBodyCollision(p1, p2, mul) {
    let notMoving;
    if (!p1.movement.xToAdd && !p1.movement.yToAdd) {
        notMoving = 1;
    } else if (!p2.movement.xToAdd && !p2.movement.yToAdd) {
        notMoving = 2;
    }

    if (notMoving) {
        handleStillCollision(p1, p2, mul, notMoving);
        return;
    }
}

function handleCollision(p1, p2, mul) {
    let dist = { // distance between the players
        x: Math.abs(p1.pubInfo.x - p2.pubInfo.x),
        y: Math.abs(p1.pubInfo.y - p2.pubInfo.y)
    };
    // checking if the bodies collide (2500 = 50^2)
    if ((dist.x * dist.x + dist.y * dist.y) <= 2500) {  
        handleBodyCollision(p1, p2, mul);
    }
}

module.exports = handleCollision;