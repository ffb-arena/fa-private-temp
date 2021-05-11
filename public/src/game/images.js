const petalIDs = {
    1: "basic",
    2: "fast",
    3: "heavy", 
    4: "rock",
    5: "square",
    6: "rose",
    7: "stinger", 
    8: "iris",
    9: "wing",
    10: "missile",
    11: "peas",
    12: "epeas",
    13: "cactus",
    14: "faster",
    15: "erose",
    16: "twin",
    17: "triplet",
    18: "bubble",
    19: "pollen", 
    20: "dandelion",
    21: "ecactus",
    22: "egg",
    23: "legg",
    24: "rrose",
    25: "antennae",
    26: "heaviest",
    27: "tringer",
    28: "yin-yang",
    29: "web",
    30: "lweb",
    31: "honey",
    32: "leaf",
    33: "lcactus",
    34: "lpeas",
    35: "ubasic",
    36: "salt",
    37: "corn",
    38: "rice"
};

let petalIcons = {};
for (let i = 1; i <= 38; i++) {
    petalIcons[i] = new Image;
    petalIcons[i].onerror = () => {
        console.log("Missing inventory art: ", petalIcons[i].src);
    }
    petalIcons[i].src = `./images/petal-icons/${petalIDs[i]}.png`;
}