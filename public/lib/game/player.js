class Player {
    constructor(name, x, y, radius, petals) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.petals = petals;
    }

    draw(isntMe) {

        // Petals
        this.petals.forEach(p => {
            ctx.beginPath();
            switch (p.id) {
                case 1:
                    ctx.fillStyle = "#afc3b6";
                    ctx.arc(
                        calculateRelPos(p.x, "x"),
                        calculateRelPos(p.y, "y"),
                        p.radius * res, 0, 2 * Math.PI
                    );
                    ctx.fill();
                    ctx.closePath();
    
                    ctx.beginPath();
                    ctx.fillStyle = "#ffffff";
                    ctx.arc(
                        calculateRelPos(p.x, "x"),
                        calculateRelPos(p.y, "y"),
                        (p.radius - 2) * res, 0, 2 * Math.PI
                    );
                    ctx.fill();
            }
            ctx.closePath()
        });

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

        // Name
        if (isntMe) {
            ctx.lineWidth = 4 * res;
            ctx.font = "18px Ubuntu"
            ctx.strokeText(this.name, this.x, this.y - 35 * res);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(this.name, this.x, this.y - 35 * res);
        }
    }
}