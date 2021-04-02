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
 * Dots 2d vectors.
 * @param {Object} vec1 - 1st 2d vector.
 * @param {Object} vec2 - 2nd 2d vector.
 */
function dot(vec1, vec2) {
    return vec1.x * vec2.x + vec1.y * vec2.y;
}

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
 * Calculates the pythagorean theorem
 * @param {number} x - Amount in x direction.
 * @param {number} y - Amount in y direction.
 */
function pythag(x, y) {
    return Math.sqrt(x * x + y * y);
}

/**
 * Returns 1 if positive, -1 if negative, otherwise 0.
 * @param {number} n The number.
 */
function whichOne(n) {
    if (!n) return 0;
    return ((n > 0) * 1) || -1;
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

module.exports = { getID, dot, clamp, pythag, whichOne, normalize, addVS, addV };