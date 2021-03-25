// gets a unique id from an array
function getID(array) {
    let ID;

    do ID = Math.round(Math.random() * 10);
    while (array[ID]);

    return ID;
}

// dots 2d vectors
function dot(vec1, vec2) {
    return vec1.x * vec2.x + vec1.y * vec2.y;
}

module.exports = { getID, dot} ;