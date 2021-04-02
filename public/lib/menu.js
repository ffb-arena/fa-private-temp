// constants
const join = document.getElementById("join");
const make = document.getElementById("make");
const inputCreate = document.getElementById("input-create");
const inputJoin = document.getElementById("input-join");
const joinSubmit = document.getElementById("join-submit");

const createSubmit = document.getElementById("create-submit");
const changelog = document.getElementById("changelog-btn")
const gallery = document.getElementById("gallery-btn")

const nname = document.getElementById("name");
const back = document.getElementById("back");
const systemText = document.getElementById("system-text");
const roomID = document.getElementById("room-ID");
const roomContainer = document.getElementById("room-container");

const roomSettingsContainer = document.getElementById("room-settings-container");
const inputX = document.getElementById("x");
const inputY = document.getElementById("y");
const by = document.getElementById("by");
const units = document.getElementById("units");

const settingsContainer = document.getElementById("settings-container");
const changelogContainer = document.getElementById("changelog-container");
const keyboard = document.getElementById("keyboard");
const helper = document.getElementById("helper");

roomSettingsContainer.hidden = true;
settingsContainer.hidden = true;
changelogContainer.hidden = true;

inputX.hidden = true;
inputY.hidden = true;
by.hidden = true;
units.hidden = true;

inputX.value = 20;
inputY.value = 20;

// Creating Games
make.addEventListener("click", () => {
    join.hidden = true;
    make.hidden = true;
    inputCreate.hidden = false;
    createSubmit.hidden = false;
    back.hidden = false;

    roomSettingsContainer.hidden = false;
    inputX.hidden = false;
    inputY.hidden = false;
    by.hidden = false;
    units.hidden = false;
});
createSubmit.addEventListener("click", () => {
    ws.send(JSON.stringify(["a", "a", inputCreate.value, inputX.value, inputY.value]));
});

// Joining games
join.addEventListener("click", () => {
    join.hidden = true;
    make.hidden = true;
    inputJoin.hidden = false;
    joinSubmit.hidden = false;
    back.hidden = false;
});
joinSubmit.addEventListener("click", () => {
    ws.send(JSON.stringify(["a", "b", inputJoin.value]));
});

nname.addEventListener("keydown", (key) => {
    if (key.code === "Enter") {

        // You join game
        cancelAnimationFrame(background); // from lib/peatl-background.js

        document.getElementById("body").style.backgroundColor = "transparent";
        document.getElementById("title").hidden = true;
        document.getElementById("subtitle").hidden = true;
        document.getElementById("noobs").hidden = true;
        systemText.hidden = true;
        nname.hidden = true;
        back.hidden = true;
        roomID.hidden = true;

        document.getElementById("Discord").hidden = true;
        document.getElementById("Github").hidden = true;
        document.getElementById("Florr").hidden = true;
        changelogContainer.hidden = true;
        changelog.hidden = true;
        gallery.hidden = true;
        make.hidden = true;
        join.hidden = true;
        ws.send(JSON.stringify(`b${nname.value}`));
        ws.send(JSON.stringify(["c", "d", me.info.mouseX - window.innerWidth / 2, window.innerHeight - ((me.info.mouseY - window.innerHeight / 2) + window.innerHeight / 2) - window.innerHeight / 2, res]));
    }
});

back.addEventListener("click", () => {
    systemText.hidden = true;
    systemText.style.bottom = "28.5vh";
    systemText.style.width = "160px";
    inputCreate.hidden = true;
    createSubmit.hidden = true;
    inputJoin.hidden = true;
    joinSubmit.hidden = true;

    roomSettingsContainer.hidden = true;
    inputX.hidden = true;
    inputY.hidden = true;
    by.hidden = true;
    units.hidden = true;
    back.hidden = true;

    join.hidden = false;
    make.hidden = false;
});

keyboard.addEventListener("click", () => {
    ws.send(JSON.stringify("cc"));
    if (me.settings.keyboard) {
        keyboard.style.backgroundColor = "#666666";
    } else {
        keyboard.style.backgroundColor = "#dddddd";
    }
    me.settings.keyboard = !me.settings.keyboard;
});
helper.addEventListener("click", () => {
    if (me.settings.helper) {
        helper.style.backgroundColor = "#666666";
    } else {
        helper.style.backgroundColor = "#dddddd";
    }
    me.settings.helper = !me.settings.helper;
});