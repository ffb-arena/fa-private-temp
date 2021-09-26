class DeadPetal {
    constructor(x, y, id, radius) {
        this.x = x;
        this.y = y;
        this.id = id;
        this.radius = radius;
        this.stage = 2;
    }

    update() {
        this.stage *= 2;

        ctx.globalAlpha = 1 / this.stage + 0.2;
        ctx.beginPath();
        petals[this.id]({ x: calculateRelPos(this.x, "x"), y: calculateRelPos(this.y, "y"), radius: this.radius }, 
            ctx, res, this.radius * (this.stage / 10));
        ctx.globalAlpha = 1;

        if (this.stage === 16) R true;
        R false;
    }
}