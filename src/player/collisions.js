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


// detecting and handling petal collisions
function handlePetalCollisions(p1, p2, dist, debug) {
    let p1Petals = [], p2Petals = [];
    if (dist.dist < Math.abs(p1.petalDist - p2.petalDist)) {
        // bruh moment
        // somehow one player is completely contained in the other
        p1.pubInfo.petals.forEach(petal => {
            if (petal.hp === 0 || petal.inv) return;
            p1Petals.push(petal);
            if (debug) {
                const data = [
                    "a",
                    { x: petal.pubInfo.x, y: petal.pubInfo.y },
                    petal.pubInfo.radius
                ];
                p1.debug.push(data);
                p2.debug.push(data);
            }
        });
        p2.pubInfo.petals.forEach(petal => {
            if (petal.hp === 0 || petal.inv) return;
            p2Petals.push(petal);
            if (debug) {
                const data = [
                    "a",
                    { x: petal.pubInfo.x, y: petal.pubInfo.y },
                    petal.pubInfo.radius
                ];
                p1.debug.push(data);
                p2.debug.push(data);
            }
        });
        
    } else {

        // finding intersection points
        // http://paulbourke.net/geometry/circlesphere/
        const centrePoint = F.centreLine2Circles(
            { x: p1.petalCentre.x, y: p1.petalCentre.y, radius: p1.petalDist + C.collisionPadding },
            { x: p2.petalCentre.x, y: p2.petalCentre.y, radius: p2.petalDist + C.collisionPadding },
            dist.dist
        );
        const vector = F.normalize({ // unit vector of collision
            x: p1.petalCentre.x - p2.petalCentre.x,
            y: p1.petalCentre.y - p2.petalCentre.y
        });
        const tangent = { // unit tangent of collision
            x: vector.y,
            y: -vector.x
        };
        const distToCentre = F.pythag(
            p1.petalCentre.x - centrePoint.x,
            p1.petalCentre.y - centrePoint.y
        );

        const distFromCentreToIntersection = F.pythagLeg(p1.petalDist + C.collisionPadding, distToCentre);
        const intersect1 = {
            x: centrePoint.x + distFromCentreToIntersection * tangent.x,
            y: centrePoint.y + distFromCentreToIntersection * tangent.y
        };
        const intersect2 = {
            x: centrePoint.x - distFromCentreToIntersection * tangent.x,
            y: centrePoint.y - distFromCentreToIntersection * tangent.y
        };

        // if the circles are barely touching but not intersecting
        if (Number.isNaN(intersect1)) return;

        if (debug) {
            let data = [
                "a",
                { x: p1.pubInfo.x, y: p1.pubInfo.y },
                25
            ];
            p1.debug.push(data);
            p2.debug.push(data);

            data = [
                "a",
                { x: intersect1.x, y: intersect1.y },
                6
            ];
            p1.debug.push(data);
            p2.debug.push(data);
            data = [
                "a",
                { x: intersect2.x, y: intersect2.y },
                3
            ];
            p1.debug.push(data);
            p2.debug.push(data);
        }

        // angles from p1/2 to the intersect points
        let p1angle1 = Math.atan2(intersect1.x - p1.petalCentre.x, intersect1.y - p1.petalCentre.y) - C.petalCollisionPadding;
        let p1angle2 = Math.atan2(intersect2.x - p1.petalCentre.x, intersect2.y - p1.petalCentre.y) + C.petalCollisionPadding;
        p1angle2 -= p1angle1;
        p1angle2 = p1angle2 - (2 * Math.PI * (p1angle2 > 2 * Math.PI)) + (2 * Math.PI * (p1angle2 < 0));

        let p2angle1 = Math.atan2(intersect2.x - p2.petalCentre.x, intersect2.y - p2.petalCentre.y) - C.petalCollisionPadding;
        let p2angle2 = Math.atan2(intersect1.x - p2.petalCentre.x, intersect1.y - p2.petalCentre.y) + C.petalCollisionPadding;
        p2angle2 -= p2angle1;
        p2angle2 = p2angle2 - (2 * Math.PI * (p2angle2 > 2 * Math.PI)) + (2 * Math.PI * (p2angle2 < 0));

        // checking which petals fall within the intersection area
        p1.pubInfo.petals.forEach(petal => {
            if (petal.hp === 0 || petal.inv) return;

            // if the other circle is over by at least half
            // just push all petals
            if (p1angle2 > Math.PI) {
                p1Petals.push(petal);
                if (debug) {
                    const data = [
                        "a",
                        { x: petal.pubInfo.x, y: petal.pubInfo.y },
                        petal.pubInfo.radius
                    ];
                    p1.debug.push(data);
                    p2.debug.push(data);
                }
            } else {
                let degree = petal.degree - (2 * Math.PI * (petal.degree > Math.PI));
                degree -= p1angle1;
                degree = degree - (2 * Math.PI * (degree > 2 * Math.PI)) + (2 * Math.PI * (degree < 0));
                if (degree < p1angle2) {
                    p1Petals.push(petal);
                    if (debug) {
                        const data = [
                            "a",
                            { x: petal.pubInfo.x, y: petal.pubInfo.y },
                            petal.pubInfo.radius
                        ];
                        p1.debug.push(data);
                        p2.debug.push(data);
                    }
                }
            }
        });
        p2.pubInfo.petals.forEach(petal => {
            if (petal.hp === 0 || petal.inv) return;

            // if the other circle is over by at least half
            // just push all petals
            if (p2angle2 > Math.PI) {
                p2Petals.push(petal);
                if (debug) {
                    const data = [
                        "a",
                        { x: petal.pubInfo.x, y: petal.pubInfo.y },
                        petal.pubInfo.radius
                    ];
                    p1.debug.push(data);
                    p2.debug.push(data);
                }
            } else {
                let degree = petal.degree - (2 * Math.PI * (petal.degree > Math.PI));
                degree -= p2angle1;
                degree = degree - (2 * Math.PI * (degree > 2 * Math.PI)) + (2 * Math.PI * (degree < 0));
                if (degree < p2angle2) {
                    p2Petals.push(petal);
                    if (debug) {
                        const data = [
                            "a",
                            { x: petal.pubInfo.x, y: petal.pubInfo.y },
                            petal.pubInfo.radius
                        ];
                        p1.debug.push(data);
                        p2.debug.push(data);
                    }
                }
            }
        });

        // seeing which petals collide
        p1Petals.forEach(petal => {
            p2Petals.forEach(petal2 => {
                // if the petals collide
                if (
                    Math.pow(petal.pubInfo.x - petal2.pubInfo.x, 2) + Math.pow(petal.pubInfo.y - petal2.pubInfo.y, 2)
                    <
                    Math.pow(petal.pubInfo.radius + petal2.pubInfo.radius, 2)
                ) {
                    petal.hp -= petal2.damage;
                    petal2.hp -= petal.damage;

                    const inv = Date.now() + C.petalInvincibility;
                    petal.inv = inv;
                    petal2.inv = inv;

                    if (debug) {
                        let data = [
                            "c",
                            { x: petal.pubInfo.x, y: petal.pubInfo.y },
                            petal.pubInfo.radius
                        ];
                        p1.debug.push(data);
                        p2.debug.push(data);
                        data = [
                            "c",
                            { x: petal2.pubInfo.x, y: petal2.pubInfo.y },
                            petal2.pubInfo.radius
                        ];
                        p1.debug.push(data);
                        p2.debug.push(data);
                    }
                }
            });
        });
    }

    return [p1Petals, p2Petals];
}


function handleBodyPetalCollision(p1, p2, p1Petals, p2Petals, debug) {
    p1Petals.forEach(petal => {
        // if collision
        if (
            Math.pow(petal.pubInfo.x - p2.pubInfo.x, 2) + Math.pow(petal.pubInfo.y - p2.pubInfo.y, 2)
            <
            Math.pow(petal.pubInfo.radius + 25, 2)
        ) {
            p2.pubInfo.health -= petal.damage;
            petal.hp -= p2.bodyDamage;

            petal.inv = Date.now() + C.petalInvincibility;

            // vector from centre of player to the colliding petal
            // collision is on this vector's tangent
            const vector = F.normalize({
                x: p1.pubInfo.x - petal.pubInfo.x,
                y: p1.pubInfo.y - petal.pubInfo.y
            });
            const tangent = {
                x: -vector.y,
                y: vector.x
            };
            p2.movement.accOffsets.push(new AccOffset({
                x: tangent.x * C.petalBodyKnockbackMult,
                y: tangent.y * C.petalBodyKnockbackMult
            }));

            if (debug) {
                let data = [
                    "c",
                    { x: petal.pubInfo.x, y: petal.pubInfo.y },
                    petal.pubInfo.radius
                ];
                p1.debug.push(data);
                p2.debug.push(data);
                data = [
                    "c",
                    { x: p2.pubInfo.x, y: p2.pubInfo.y },
                    25
                ];
                p1.debug.push(data);
                p2.debug.push(data);
            }
        }
    });
    p2Petals.forEach(petal => {
        // if collision
        if (
            Math.pow(petal.pubInfo.x - p1.pubInfo.x, 2) + Math.pow(petal.pubInfo.y - p1.pubInfo.y, 2)
            <
            Math.pow(petal.pubInfo.radius + 25, 2)
        ) {
            p1.pubInfo.health -= petal.damage;
            petal.hp -= p1.bodyDamage;

            petal.inv = Date.now() + C.petalInvincibility;

            // vector from centre of player to the colliding petal
            // collision is on this vector's tangent
            const vector = F.normalize({
                x: p2.pubInfo.x - petal.pubInfo.x,
                y: p2.pubInfo.y - petal.pubInfo.y
            });
            const tangent = {
                x: -vector.y,
                y: vector.x
            };
            p1.movement.accOffsets.push(new AccOffset({
                x: tangent.x * C.petalBodyKnockbackMult,
                y: tangent.y * C.petalBodyKnockbackMult
            }));

            if (debug) {
                let data = [
                    "c",
                    { x: petal.pubInfo.x, y: petal.pubInfo.y },
                    petal.pubInfo.radius
                ];
                p1.debug.push(data);
                p2.debug.push(data);
                data = [
                    "c",
                    { x: p1.pubInfo.x, y: p1.pubInfo.y },
                    25
                ];
                p1.debug.push(data);
                p2.debug.push(data);
            }
        }
    });
}


function handleCollision(p1, p2, mul, debug) {

    // distance between the players
    let dist = {
        x: Math.abs(p1.pubInfo.x - p2.pubInfo.x),
        y: Math.abs(p1.pubInfo.y - p2.pubInfo.y)
    };
    dist.dist = F.pythag(dist.x, dist.y);

    // checking if the bodies collide
    if (dist.dist <= 50) {  
        handleBodyCollision(p1, p2, mul);
    }

    let p1Petals, p2Petals;
    // handling petal/petal collisions
    [p1Petals, p2Petals] = handlePetalCollisions(p1, p2, dist, debug);

    // handling petal/body collisions
    handleBodyPetalCollision(p1, p2, p1Petals, p2Petals, debug);
}

module.exports = handleCollision;