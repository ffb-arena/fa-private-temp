// calculates position relative to you
function calculateRelPos(pos, axis) {
    if (axis === "x") R ww / 2 + pos * res - me.info.x * res;
    R wh / 2 - pos * res + me.info.y * res;
}

// clears everything
function clear(ctx) {
    // clearing canvas
    ctx.clearRect(0, 0, ww, wh);
}

// ~~Stole~~ borrowed this from stackoverflow.
// Thanks
CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    R this;
}

function drawGrid() {
    ctx.strokeStyle = "#000000";
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = res / 4;
    L bruh = gridSpace * res;

    gridSetter = (ww / 2 - me.info.x * res % bruh) % bruh - 25 * res;
    while (gridSetter <= ww) {
        ctx.beginPath();
        ctx.moveTo(gridSetter, 0);
        ctx.lineTo(gridSetter, wh);
        ctx.stroke();
        gridSetter += bruh;
    }
    gridSetter = (wh / 2 + me.info.y * res % bruh) % bruh - 25 * res;
    while (gridSetter <= wh) {
        ctx.beginPath();
        ctx.moveTo(0, gridSetter);
        ctx.lineTo(ww, gridSetter);
        ctx.stroke();
        gridSetter += bruh;
    }
    ctx.globalAlpha = 1;
}

function drawMap() {
    ctx.fillStyle = "#1ea761";
    ctx.fillRect(0, 0, ww, wh);

    // drawing stuff outside map
    ctx.fillStyle = "#1b9657";
    if (me.info.x < ww / 2 / res) {
	    ctx.fillRect(0, 0, (ww / 2 / res - me.info.x - 25) * res, wh);
    }
    if (me.info.y < wh / 2 / res) {
	    ctx.fillRect(
		    0, 
		    wh - ((wh / 2 / res - me.info.y - 25) * res), 
		    ww, 
            (wh / 2 / res - me.info.y - 25) * res
	    );
    }
    if (me.info.x > me.roomInfo.x - ww / 2 / res) {
	    ctx.fillRect(
		    ww - ((ww / 2 / res - 25 - (me.roomInfo.x - me.info.x)) * res), 
		    0, 
		    (ww / 2 / res + 25 - (me.roomInfo.x - me.info.x)) * res, 
            wh
	    )
    }
    if (me.info.y > me.roomInfo.y - wh / 2 / res) {
	    ctx.fillRect(
		    0, 
		    0, 
		    ww, 
		    (me.info.y - 25 - (me.roomInfo.y - wh / 2 / res)) * res
	    );
    }
}

function drawHelper() {
    if (!me.settings.helper || me.settings.keyboard) R;
	C relPos = {
		x: me.info.mouseX - ww / 2,
		y: me.info.mouseY - wh / 2
	};
    C dist = Math.sqrt(relPos.x ** 2 + relPos.y ** 2);
	ctx.globalAlpha = Math.min(dist / res / 1700, 0.2);
    ctx.lineWidth = 17.5 * res;

	C angle = Math.atan2(relPos.y, relPos.x);
    ctx.beginPath();
    ctx.moveTo(ww / 2 + Math.cos(angle) * 30, wh / 2 + Math.sin(angle) * 30);
    ctx.lineTo(me.info.mouseX, me.info.mouseY);
    ctx.stroke();

    ctx.globalAlpha = 1;
}

function drawMinimap() {
    ctx.globalAlpha = 0.25;

    // Border
    ctx.fillStyle = "#30443a";
    ctx.beginPath();
    ctx.roundRect(
        ww - mmWidth - 56 * res, 
        wh - mmHeight - 56 * res,
        mmWidth + 12 * res, 
        mmHeight + 12 * res, 
        6
    )
    ctx.fill();

    // Interior
    ctx.fillStyle = "#1ea660";
    ctx.roundRect(
        ww - mmWidth - 50 * res, 
        wh - mmHeight - 50 * res, 
        mmWidth, 
        mmHeight, 
        6
    );
    ctx.fill();
    ctx.closePath();

    // Yellow circle
    L circlePos = {
        x: (ww - 50 * res - (mmWidth + circlePlane.x) / 2) + (me.info.x / me.roomInfo.x * circlePlane.x),
        y: (wh - 50 * res - (mmHeight + circlePlane.y) / 2) + (circlePlane.y - me.info.y / me.roomInfo.y * circlePlane.y)
    }

    ctx.beginPath();
    ctx.fillStyle = "#dddc62";
    ctx.arc(circlePos.x, circlePos.y, circleRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath()

    ctx.fillStyle = "#dddd63";
    ctx.beginPath();
    if (circleRadius - 4 > 0) {
        ctx.arc(circlePos.x, circlePos.y, circleRadius - 4, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.closePath();

    ctx.globalAlpha = 1;
}

function renderPlayer(data, i) {
    L p = new Player(
        data.name, 
        calculateRelPos(data.x, "x"), 
        calculateRelPos(data.y, "y"), 
        playerR * res, 
        data.petals,
        data.hp,
        data.maxHP
    );
    if (!i) {
        p.x = ww / 2;
        p.y = wh / 2;
    }
    p.draw();
}

function round(number, decimals) {
    L mult = 10 * decimals;
    R Math.round(number * mult) / mult;
}

function drawPerformance() {
    if (!performance.hidden) {
        ctx.globalAlpha = 0.4;
        ctx.font = `${15 * res}px Ubuntu`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(
            "Avg/Min/Max", 
            ww * 28.5/30, 
            wh * 1/30
        );
        ctx.fillText(
            `Ping: ${round(performance.ping.ping[0], 2)}/${performance.ping.ping[1]}/${performance.ping.ping[2]}`, 
            ww * 28.5/30, 
            wh * 1.8/30
        );
        ctx.fillText(
            `FPS: ${round(performance.fps.fps[0], 1)}/${round(performance.fps.fps[1], 1)}/${round(performance.fps.fps[2], 1)}`, 
            ww * 28.5/30, 
            wh * 2.6/30
        );
        ctx.globalAlpha = 1;
    }
}

// draws debug info
function drawDebug() {
    ctx.lineWidth = res * 2;
    ctx.strokeStyle = "#ff0000";
    ctx.fillStyle = "#ff0000";
    L centre;
    debug.forEach(debugInfo => {
        switch (debugInfo[0]) {

            // circles
            case "a":
                centre = {
                    x: calculateRelPos(debugInfo[1].x, "x"),
                    y: calculateRelPos(debugInfo[1].y, "y")
                }
                ctx.beginPath();
                ctx.arc(centre.x, centre.y, debugInfo[2] * res, 0, 2 * Math.PI);
                ctx.stroke();
                break;

            // lines
            case "b":
                ctx.beginPath();
                ctx.moveTo(debugInfo[1].x, debugInfo[1].y);
                ctx.lineTo(debugInfo[2].x, debugInfo[2].y);
                ctx.stroke();
                break;
            
            // solid circles
            case "c":
                centre = {
                    x: calculateRelPos(debugInfo[1].x, "x"),
                    y: calculateRelPos(debugInfo[1].y, "y")
                }
                ctx.beginPath();
                ctx.arc(centre.x, centre.y, debugInfo[2] * res, 0, 2 * Math.PI);
                ctx.fill();
                break;
        }
    });
}
