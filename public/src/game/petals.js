// instructions to render each petal
// the param p is the petal, from the Petal class (src/player/petal.js relative to dir root)
const petals = {

    // basic
    1: (p, c, r) => {
        r = r || p.radius;
        c.fillStyle = "#afc3b6";
        c.arc(
            calculateRelPos(p.x, "x"),
            calculateRelPos(p.y, "y"),
            r * res, 0, 2 * Math.PI
        );
        c.fill();
        c.closePath();

        c.beginPath();
        c.fillStyle = "#ffffff";
        c.arc(
            calculateRelPos(p.x, "x"),
            calculateRelPos(p.y, "y"),
            (r - 2) * res, 0, 2 * Math.PI
        );
        c.fill();
    }
}