const backgroundCanvas = document.getElementById("petalBackground");
const ctx2 = backgroundCanvas.getContext("2d");
const oneOverSixty = 1/60 * 1000;

backgroundCanvas.width = window.innerWidth;
backgroundCanvas.height = window.innerHeight;

function loadImage(src) {
    let image = new Image();
    image.src = `images/petals/${src}.svg`;
    return image;
}

const commonPetals = [petalIDs[1], petalIDs[2], petalIDs[3]]
const uncommonPetals = [petalIDs[8], petalIDs[32], petalIDs[6], petalIDs[7]] // iris, leaf, rose, stinger
const rarePetals = [petalIDs[18], petalIDs[13], petalIDs[31], petalIDs[4], petalIDs[9]] // bubble, cactus, honey, rock, wing
const epicPetals = [petalIDs[21], petalIDs[22], petalIDs[15], petalIDs[26], petalIDs[28]]; // ecactus, egg, erose, heaviest, yin-yang
const legPetals = [petalIDs[27]]; // tringer
let textures = {};
for (const name of commonPetals) {
    textures[name] = loadImage(name);
}
for (const name of uncommonPetals) {
    textures[name] = loadImage(name);
}
for (const name of rarePetals) {
    textures[name] = loadImage(name);
}
for (const name of epicPetals) {
    textures[name] = loadImage(name);
}
for (const name of legPetals) {
    textures[name] = loadImage(name);
}




class PetalBackground{
    constructor(){
        this.x = -200;
        this.y = Math.random() * 1080;
        this.velDirection = 0 + (Math.random()-0.5)/5;
        this.size = Math.random() * 30 + 30
        this.velX = Math.cos(this.velDirection) * 1/this.size * 120;
        this.velY = Math.sin(this.velDirection) * 1/this.size * 120;
        const randomNumber = Math.random();
        let selectArray = [];
        if (randomNumber < 0.4){
            selectArray = JSON.parse(JSON.stringify(commonPetals));
        }
        else if (randomNumber < 0.7){
            selectArray = JSON.parse(JSON.stringify(uncommonPetals));
        }
        else if (randomNumber < 0.85){
            selectArray = JSON.parse(JSON.stringify(rarePetals));
        }
        else if (randomNumber < 0.99){
            selectArray = JSON.parse(JSON.stringify(epicPetals));
        }
        else{
            selectArray = JSON.parse(JSON.stringify(legPetals));
        }
        this.type = selectArray[Math.floor((Math.random() * selectArray.length))];
        if (this.type === "tringer" || this.type === "stinger" || this.type === "wing") {
            this.size *= 4;
        }
    }
    update(deltaTimeMul){
        this.x += this.velX * deltaTimeMul;
        this.y += this.velY * deltaTimeMul;
        if (this.x > backgroundCanvas.width + 30){
            this.delete = true;
        }
    }
    draw(){
        try{
            ctx2.drawImage(textures[this.type], this.x, this.y, this.size, this.size);
        }
        catch{
            console.log(this.type)
        }
    }
}

let petalBackgrounds = [];
let petalSpawnCooldown = 6;
let background;
let oldTime = Date.now();
let newTime;

let justUnpaused = false;
function drawBackground(){
    newTime = Date.now();
    const deltaTimeMul = (newTime - oldTime) / oneOverSixty;
    ctx2.clearRect(0, 0, window.innerWidth, window.innerHeight);
    petalSpawnCooldown --;
    while (petalSpawnCooldown < 0){
        petalSpawnCooldown += 6;
        petalBackgrounds.push(new PetalBackground());
    }
    for(let i of petalBackgrounds){
        i.update(!justUnpaused * deltaTimeMul);
        i.draw();
    }
    if (justUnpaused) justUnpaused = false;
    petalBackgrounds = petalBackgrounds.filter((e) => e.delete != true)
    background = requestAnimationFrame(drawBackground);

    oldTime = newTime;
}
background = requestAnimationFrame(drawBackground);