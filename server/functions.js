/**
 * Gets a unique id from an array.
 * @param {array} array - the array to get the id from.
 */
function getID(array) {
    let ID = 0;
    while (array[ID]) ID++;
    
    return ID;
}

/**
 * Checks if a number is valid.
 * Catches NaN, undefined, infinities, and non-numbers
 * @param {Number} n - the number to check.
 */
function isValidNum(n) {
    return n - n === 0;
}
// note that an empty string will return true
// but I like this simplicity, and an empty string will
// turn into 0 in any calculations anyways


/**
 * Checks if a boolean is valid.
 * @param {Bool} b - the boolean to check.
 */
function isValidNum(b) {
    return b === true || b === false;
}



// vector stuff

/**
 * Dots 2d vectors.
 * @param {Object} vec1 - 1st 2d vector.
 * @param {Object} vec2 - 2nd 2d vector.
 */
function dot(vec1, vec2) {
    return vec1.x * vec2.x + vec1.y * vec2.y;
}

/**
 * Normalizes a 2d vector.
 * @param {Object} vector The vector.
 */
function normalize(vector) {
    let distance = pythag(vector.x, vector.y);
    return {
        x: vector.x / distance,
        y: vector.y / distance
    }
}

/**
 * Multiplies a 2d vector and a scalar.
 * @param {Object} vector The vector.
 * @param {number} scalar The scalar.
 */
function addVS(vector, scalar) {
    return {
        x: vector.x * scalar,
        y: vector.y * scalar
    }
}

/**
 * Adds 2 2d vectors
 * @param {Object} vec1 First vector.
 * @param {Object} vec2 Second vector.
 */
function addV(vec1, vec2) {
    return {
        x: vec1.x + vec2.x,
        y: vec1.y + vec2.y
    }
}



// triangle stuff

/**
 * Calculates the pythagorean theorem for the hypotenuse.
 * @param {number} x - Amount in x direction.
 * @param {number} y - Amount in y direction.
 */
function pythag(x, y) {
    return Math.sqrt(x * x + y * y);
}

/**
 * Calculates the pythagorean theorem for a leg
 * @param {number} hyp - Length of hypotenuse.
 * @param {number} leg - Length of other leg.
 */
function pythagLeg(hyp, leg) {
    return Math.sqrt(hyp * hyp - leg * leg);
}




// random math stuff
/**
 * Clamps a number between a maximum and minimum.
 * @param {number} num - Number to clamp.
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 */
function clamp(num, min, max) {
    return Math.min(
        Math.max(num, min),
        max
    )
}

/**
 * Finds centre point of the line that passes through the overlap points of 2 circles.
 * @param {Object} cir1 First circle.
 * @param {Object} cir2 Second circle.
 */
function centreLine2Circles(cir1, cir2, d) {
    // http://paulbourke.net/geometry/circlesphere/
    const a = ((cir1.radius ** 2) - (cir2.radius ** 2) + d * d) / (d * 2);
    return {
        x:  cir1.x + a * (cir2.x - cir1.x) / d,
        y: cir1.y + a * (cir2.y - cir1.y) / d,
    };
}

module.exports = { 
    getID, 
    dot, normalize, addVS, addV, 
    pythag, pythagLeg,
    clamp, centreLine2Circles
};
