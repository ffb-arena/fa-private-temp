const F = require("../functions.js");
const C = require("../consts.js");
const AccOffset = require("./acc-offset.js");

// collisions where one player is not moving
function handleStillCollision(p1, p2, notMoving, divide) {
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
    let posOrNeg = {
        x: F.whichOne(cV.x),
        y: F.whichOne(cV.y)
    }
    let knockback = {
        x: cV.x * posOrNeg.x * 2,
        y: cV.y * posOrNeg.y * 2
    }
    knockback.x = Math.max(0.6, knockback.x);
    knockback.y = Math.max(0.6, knockback.y);
    knockback.x *= posOrNeg.x;
    knockback.y *= posOrNeg.y;
    players[1].movement.accOffsets.push(new AccOffset(knockback));


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
        x: -cV.x * 2,
        y: -cV.y * 2
    }));
}

// knockback between 2 players
function handleBodyCollision(p1, p2, mul) {
    const divide = C.acc.flower * C.friction * mul; // divide by this to make x/yToAdd between 0 and 1

    let notMoving;
    if (!p1.movement.xToAdd && !p1.movement.yToAdd) {
        notMoving = 1;
    } else if (!p2.movement.xToAdd && !p2.movement.yToAdd) {
        notMoving = 2;
    }

    if (notMoving) {
        handleStillCollision(p1, p2, notMoving, divide);
        return;
    }

    // https://www.vobarian.com/collisions/2dcollisions2.pdf
    const normal = F.normalize({ // normal vector of the collision
        x: p2.pubInfo.x - p1.pubInfo.x,
        y: p2.pubInfo.y - p1.pubInfo.y
    });
    const tangent = { // tangent vector of the collision
        x: -normal.y,
        y: normal.x
    };

    const v1 = { // initial moving velocities of player 1
        x: p1.movement.xToAdd / divide,
        y: p1.movement.yToAdd / divide
    };
    const v2 = { // initial moving velocities of player 2
        x: p2.movement.xToAdd / divide,
        y: p2.movement.yToAdd / divide
    };

    const v1n = F.dot(v1, normal); // scalar of v1 in normal direction
    const v1t = F.dot(v1, tangent); // scalar of v1 in tangential direction
    const v2n = F.dot(v2, normal); // scalar of v2 in normal direction
    const v2t = F.dot(v2, tangent); // scalar of v2 in tangential direction


    const v1nf = v2n;
    const v2nf = v1n; // swap v1n and v2n for final normal scalars
    // tangental scalars stay the same

    const v1nvf = F.addVS(normal, v1nf); // final p1 normal vector
    const v1tvf = F.addVS(tangent, v1t); // final p2 tangential vector
    const v2nvf = F.addVS(normal, v2nf); // final p1 normal vector
    const v2tvf = F.addVS(tangent, v2t); // final p2 tangential vector

    // add normal and tangential vectors to find final vectors
    const v1f = F.addV(v1nvf, v1tvf); // final vector of p1
    const v2f = F.addV(v2nvf, v2tvf); // final vector of p2

    p1.movement.accOffsets.push(new AccOffset({
        x: v1f.x * 2,
        y: v1f.y * 2
    }));
    p2.movement.accOffsets.push(new AccOffset({
        x: v2f.x * 2,
        y: v2f.y * 2
    }));
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

    // checking which petals collide (if any)
}

module.exports = handleCollision;