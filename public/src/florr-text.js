function florrText(text, fontSize, centre, c) {
    c.globalAlpha = 1;
	console.log(c.textAlign);

    c.font = `${fontSize}px Ubuntu`;
	c.fillStyle = "#ffffff";
	c.strokeStyle = "#000000";
	c.lineWidth = fontSize / 6;
    const metrics = c.measureText(text);
    const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    let offset = fontSize < 10 ? fontSize / 20 : 0;
	c.strokeText(text, centre.x, centre.y + height / 2 - offset);
	c.fillText(text, centre.x, centre.y + height / 2);
}
