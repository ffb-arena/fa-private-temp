function getID(map) {
    let ID;

    do ID = Math.round(Math.random() * 10);
    while (map.has(ID));

    return ID;
}

// gives a coordinate from an angle
function coord(angle, length) {
    let initialObject = {
        x: Math.sin(angle),
        y: Math.cos(angle)
    };
    let distance = Math.sqrt(initialObject.x * initialObject.x + initialObject.y * initialObject.y);
    initialObject.x /= distance;
    initialObject.y /= distance;
    initialObject.x *= length;
    initialObject.y *= length;
    return initialObject;
}

module.exports = { getID, coord };