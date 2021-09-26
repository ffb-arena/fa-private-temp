const backgroundCanvas = document.getElementById("petalBackground");
const backgroundCtx = backgroundCanvas.getContext("2d");

backgroundCanvas.width = ww;
backgroundCanvas.height = wh;

let backgroundPetals = {};
for (const r in rarityTiers) { backgroundPetals[r] = [] };
for (const id in petalNames) { 
	if (+id <= 0) continue; 
	backgroundPetals[rarities[id]].push(id); 
}

class PetalImage{
    constructor(){
        this.x = -100;
        this.y = Math.random() * wh;
        this.velDirection = (Math.random()-0.5)/10;
        this.velX = Math.cos(this.velDirection) * (Math.random() + 0.4);
        this.velY = Math.sin(this.velDirection);
		this.dir = 0; this.dirChange = Math.PI * 2 / (Math.random() * 300 + 400);
		while (this.type === undefined) {
			const r = Math.random();
			let tmpRarity;
			for (const rarity in rarityChances) { // from game\petals.js
				if (rarityChances[rarity] > r) {
					tmpRarity = backgroundPetals[rarity];
					break;
				}
			}
			this.type = tmpRarity[Math.floor(Math.random() * tmpRarity.length)];
		}
        this.size = (Math.random() + 1) * radii[this.type];
	}
    
    update(deltaTimeMul){
		this.dir += this.dirChange;
		if (this.dir > Math.PI * 2) this.dir %= Math.PI * 2;
        this.x += this.velX * deltaTimeMul;
        this.y += this.velY * deltaTimeMul;
		backgroundCtx.save();
		backgroundCtx.translate(this.x, this.y);
		backgroundCtx.rotate(this.dir);
		backgroundCtx.translate(-this.x, -this.y);
		petals[this.type]({ x: this.x, y: this.y }, backgroundCtx, res, this.size);
		backgroundCtx.restore();
		return (this.x < backgroundCanvas.width + 30) && (this.y > 0);
    }
}

const oneOverSixty = 1/60 * 1000;
let activeBackgroundPetals = [];
const petalSpawnDelay = 10; // frames
const petalLimit = 100;
let petalSpawnCooldown = petalSpawnDelay;
let background, newTime, oldTime;

function drawBackground(){
    newTime = Date.now();
    const deltaTimeMul = (newTime - oldTime) / oneOverSixty;
    backgroundCtx.clearRect(0, 0, ww, wh);
    petalSpawnCooldown -= deltaTimeMul;
    while (petalSpawnCooldown < 0 && activeBackgroundPetals.length < petalLimit){
        petalSpawnCooldown += petalSpawnDelay;
        activeBackgroundPetals.push(new PetalImage());
    }
    for(let i of activeBackgroundPetals) i.update(deltaTimeMul);
    activeBackgroundPetals = activeBackgroundPetals.filter(e => e.update(deltaTimeMul));

    oldTime = newTime;
}
function startBackground() {
	oldTime = Date.now();
	background = setInterval(drawBackground, oneOverSixty);
}
function stopBackground() {
	clearInterval(background);
}
