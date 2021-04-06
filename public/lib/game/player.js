class Player {
    constructor(name, x, y, radius, petals, health, maxHealth) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.petals = petals;
        this.health = health;
        this.maxHealth = maxHealth;
    }

    _drawHealthBar() {
        const percent = Math.max(this.health / this.maxHealth, 0);
        if (percent === 1) return;

        ctx.fillStyle = "#000000";
        const width = 65 * res;
        const height = 8 * res;
        ctx.fillRect(
            this.x - width / 2,
            this.y + 40 * res,
            width,
            height
        );

        const border = 1.5 * res;
        ctx.fillStyle = "#23d400";
        ctx.fillRect(
            this.x - (width / 2) + border,
            this.y + (40 * res) + border,
            (width - border * 2) * percent,
            height - border * 2
        );
    }

    _drawPetals() {
        this.petals.forEach(p => {
            ctx.beginPath();
            petals[p.id](p); // draws the petals
            ctx.closePath()
        });
    }

    _drawFlower() {
        // Body
        ctx.fillStyle = "#beb951";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = "#ffe763";
        ctx.arc(this.x, this.y, this.radius - 3 * res, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
        
        // Eyes
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.ellipse(this.x - 7 * res, this.y - 5 * res, 2.75 * res, 6 * res, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.ellipse(this.x + 7 * res, this.y - 5 * res, 2.75 * res, 6 * res, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath()

        // Mouth
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1.25 * res;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, 12 * res, 9 * res, 0.5 * Math.PI, 0.7, 2 * Math.PI - 0.7, true);
        ctx.stroke();
    }

    _drawName() {
        // Name
        ctx.lineWidth = 4 * res;
        ctx.font = "18px Ubuntu"
        ctx.strokeText(this.name, this.x, this.y - 35 * res);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(this.name, this.x, this.y - 35 * res);
    }

    draw() {
        this._drawHealthBar();
        this._drawPetals();
        this._drawFlower();
        this._drawName();
    }
}