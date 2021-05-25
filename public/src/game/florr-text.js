const texts = document.getElementById("texts");
function florrText(text, fontSize, centre, textStroke, c) {
    const p = document.createElement("p");
    p.className = "temp-text noselect";


    p.style.position = "absolute";
    p.style.fontSize = `${fontSize}px`;
    p.style.color = "#ffffff";
    p.style["-webkit-text-stroke"] = `${textStroke}px black`;
    p.style["letter-spacing"] = "-0.35px";

    c.font = `${fontSize}px Ubuntu`;
    const metrics = c.measureText(text);
    const width = metrics.width - 0.35 * (text.length - 1);
    const height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    p.style.top = `${centre.y - height / 2}px`;
    p.style.left = `${centre.x - width / 2}px`;

    let newText = document.createTextNode(text);
    p.appendChild(newText);
    texts.appendChild(p);
}