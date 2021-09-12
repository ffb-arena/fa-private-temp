const backgroundCanvas = document.getElementById("petalBackground");
const backgroundCtx = backgroundCanvas.getContext("2d");

backgroundCanvas.width = window.innerWidth;
backgroundCanvas.height = window.innerHeight;

function loadImage(src) {
    let image = new Image();
    image.src = `images/petals/${src}.svg`;
    return image;
}

const commonPetals = ["basic", "fast", "heavy"];
const uncommonPetals = ["iris", "leaf", "rose", "stinger"];
const rarePetals = ["bubble", "cactus", "honey", "rock", "wing"];
const epicPetals = ["ecactus", "egg", "erose", "heaviest", "yin-yang"];
const legPetals = ["tringer"];
let textures = {};
[commonPetals, uncommonPetals, rarePetals, epicPetals, legPetals].forEach(petals => {
	petals.forEach(name => textures[name] = loadImage(name));
});



class PetalImage{
    constructor(){
        this.x = -200;
        this.y = Math.random() * window.innerHeight;
        this.velDirection = 0 + (Math.random()-0.5)/5;
        this.size = Math.random() * 30 + 30;
        this.velX = Math.cos(this.velDirection) * 1/this.size * 100;
        this.velY = Math.sin(this.velDirection) * 1/this.size * 100;
        const randomNumber = Math.random();
        let selectArray = [];
        if (randomNumber < 0.4){
            selectArray = JSON.parse(JSON.stringify(commonPetals));
        } else if (randomNumber < 0.7){
            selectArray = JSON.parse(JSON.stringify(uncommonPetals));
        } else if (randomNumber < 0.85){
            selectArray = JSON.parse(JSON.stringify(rarePetals));
        } else if (randomNumber < 0.99){
            selectArray = JSON.parse(JSON.stringify(epicPetals));
        } else{
            selectArray = JSON.parse(JSON.stringify(legPetals));
        }
        this.type = selectArray[Math.floor((Math.random() * selectArray.length))];
        if (this.type === "tringer" || this.type === "stinger" || this.type === "wing") {
            this.size *= 4; // small images for some reason
        }
    }
    update(deltaTimeMul){
        this.x += this.velX * deltaTimeMul;
        this.y += this.velY * deltaTimeMul;
        try{
            backgroundCtx.drawImage(textures[this.type], this.x, this.y, this.size, this.size);
        }catch{
            console.log(this.type)
        }
        if (this.x > backgroundCanvas.width + 30){
            this.delete = true;
        }
    }
}

const oneOverSixty = 1/60 * 1000;
let petalImages = [];
const petalSpawnDelay = 10; // frames
let petalSpawnCooldown = petalSpawnDelay;
let background, newTime, oldTime = Date.now();

let justUnpaused = false;
function drawBackground(){
    newTime = Date.now();
    const deltaTimeMul = (newTime - oldTime) / oneOverSixty;
    backgroundCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    petalSpawnCooldown -= !justUnpaused * deltaTimeMul;
    while (petalSpawnCooldown < 0){
        petalSpawnCooldown += petalSpawnDelay;
        petalImages.push(new PetalImage());
    }
    for(let i of petalImages) i.update(!justUnpaused * deltaTimeMul);
    if (justUnpaused) justUnpaused = false;
    petalImages = petalImages.filter(e => !e.delete);

    oldTime = newTime;
}
background = setInterval(drawBackground, oneOverSixty);
