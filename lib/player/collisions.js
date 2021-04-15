const F = require("../functions.js");
const C = require("../consts.js");
const AccOffset = require("./acc-offset.js");

// fixing overlap between 2 players
function fixOverlap(p1, p2) {
    const currentDist = F.pythag( // current distance between players
        p2.pubInfo.x - p1.pubInfo.x, 
        p2.pubInfo.y - p1.pubInfo.y
    );
    const lastFrameDist = F.pythag( // distance between players last frame - currentDist
        (p2.pubInfo.x - p2.movement.xToAdd) - (p1.pubInfo.x - p1.movement.xToAdd),
        (p2.pubInfo.y - p2.movement.yToAdd) - (p1.pubInfo.y - p1.movement.yToAdd)
    ) - currentDist;
    const wantedDist = 50 - currentDist;
    const percent = wantedDist / lastFrameDist;

    p2.pubInfo.x -= p2.movement.xToAdd * percent;
    p2.pubInfo.y -= p2.movement.yToAdd * percent;
    p1.pubInfo.x -= p1.movement.xToAdd * percent;
    p1.pubInfo.y -= p1.movement.yToAdd * percent;
}

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
        x: cV.x * posOrNeg.x * C.knockbackMult,
        y: cV.y * posOrNeg.y * C.knockbackMult
    }
    knockback.x = Math.max(0.6, knockback.x);
    knockback.y = Math.max(0.6, knockback.y);
    knockback.x *= posOrNeg.x;
    knockback.y *= posOrNeg.y;
    players[1].movement.accOffsets.push(new AccOffset(knockback));


    // fixing overlap
    fixOverlap(players[0], players[1]);

    // still object gets velocity in other object's direction
    players[0].movement.accOffsets.push(new AccOffset({
        x: -cV.x * C.knockbackMult,
        y: -cV.y * C.knockbackMult
    }));
}

// collision where both are moving
function handleMovingCollision(p1, p2, divide) {

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

    // fix overlap 
    fixOverlap(p1, p2);

    p1.movement.accOffsets.push(new AccOffset({
        x: v1f.x * C.knockbackMult,
        y: v1f.y * C.knockbackMult
    }));
    p2.movement.accOffsets.push(new AccOffset({
        x: v2f.x * C.knockbackMult,
        y: v2f.y * C.knockbackMult
    }));
}

// collision between 2 player bodies
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
    } else {
        handleMovingCollision(p1, p2, divide);
    }

    p1.pubInfo.health -= p2.bodyDamage;
    p2.pubInfo.health -= p1.bodyDamage;
}

function handleCollision(p1, p2, mul) {
    let dist = { // distance between the players
        x: Math.abs(p1.pubInfo.x - p2.pubInfo.x),
        y: Math.abs(p1.pubInfo.y - p2.pubInfo.y)
    };
    dist.dist = (dist.x * dist.x + dist.y * dist.y);

    // checking if the bodies collide (2500 = 50^2)
    if (dist.dist <= 2500) {  
        handleBodyCollision(p1, p2, mul);
    }

    // checking which petals collide (if any)
    const vector = F.normalize({ // unit vector of the collision
        x: dist.x,
        y: dist.y
    });

    if (dist.dist < Math.abs(p1.petalDist - p2.petalDist)) {
        // somehow one player is completely contained in the other
        console.log("bruh");
        return;
    }

    // fp1, fp2 are farthest points in p1, p2's radii along the unit vector
    fp1 = {
        x: p1.petalDist * vector.x,
        y: p1.petalDist * vector.y,
    };
    fp2 = {
        x: p2.petalDist * -vector.x,
        y: p2.petalDist * -vector.y,
    };

    const centre = { // centre of the overlap (avg fp1, fp2)
        x: fp1.x + (fp1.x + fp2.x) / 2,
        y: fp1.y + (fp1.y + fp2.y) / 2,
    };
}

module.exports = handleCollision;