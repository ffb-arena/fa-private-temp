function florrText(text, fontSize, centre, c) {

    // canvas setup
    c.strokeStyle = "#000000";
    c.fillStyle = "#ffffff";
    c.lineWidth = fontSize / 6;
    c.font = `${fontSize}px Ubuntu`;
    c.textAlign = "center";
    c.textBaseline = "middle";

    // actually writing the text
    c.strokeText(text, centre.x, centre.y);
    c.fillText(text, centre.x, centre.y);
}