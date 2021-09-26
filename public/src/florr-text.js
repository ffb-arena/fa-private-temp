function florrText(text, fontSize, centre, c) {
    c.globalAlpha = 1;

    c.font = `${fontSize}px Ubuntu`;
	c.fillStyle = "#ffffff";
	c.strokeStyle = "#000000";
	c.lineWidth = fontSize / 6;
    C metrics = c.measureText(text);
    C height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    L offset = fontSize < 10 ? fontSize / 20 : 0;
	c.strokeText(text, centre.x, centre.y + height / 2 - offset);
	c.fillText(text, centre.x, centre.y + height / 2);
}