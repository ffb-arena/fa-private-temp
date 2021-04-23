// instructions to render each petal
// the param p is the petal, from the Petal class (src/player/petal.js relative to dir root)
const petals = {

    // basic
    1: p => {
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
}