// gets a unique id from an array
function getID(array) {
    let ID;

    do ID = Math.round(Math.random() * 10);
    while (array[ID]);

    return ID;
}

module.exports = getID;