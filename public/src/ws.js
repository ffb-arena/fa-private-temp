const wsUrl = `ws${location.protocol === "https:" ? "s" : ""}://${window.location.hostname}${window.location.port ? ":" : ""}${window.location.port}`;
const ws = new WebSocket(wsUrl === "ws://" ? "ws://localhost:9700" : wsUrl);
ws.addEventListener("open", () => {
    console.log("Websocket Sucessfully Opened");
    addEventListeners();
    document.getElementById("loading").remove();
});

window.c = str => ws.send(JSON.stringify(["f", str]));

// When messages are recieved
ws.onmessage = message => {
    let msg = JSON.parse(message.data);
    switch (msg[0]) {

        // Creating/joining rooms
        case "a":
            let msgRoom = msg[3];
            switch (msg[1]) {

                // Creating rooms
                case "a":
                    roomSettingsContainer.hidden = true;
                    inputX.hidden = true;
                    inputY.hidden = true;
                    by.hidden = true;
                    units.hidden = true;
                    back.hidden = true;

                    inputCreate.hidden = true;
                    createSubmit.hidden = true;

                    join.hidden = false;
                    make.hidden = false;
                    nname.hidden = false;

                    if (msg[2] === "a") {
                        let text = `current room: ${msgRoom === "" ? `"" (community garden)` : `"${msgRoom}"`}`;
                        ctx.font = "20px Ubuntu";
                        roomContainer.style.width = `${ctx.measureText(text).width}px`
                        roomID.innerHTML = text;

                        if (!msg[5]) {
                            text = `room "${msgRoom}" successfully created`
                            systemText.style.width = `${ctx.measureText(text).width}px`
                            systemText.innerHTML = text;
                        }

                        me.roomInfo = msg[4];
                        mms = (msg[4].x > msg[4].y) ? [msg[4].y / msg[4].x, "x"] : [msg[4].x / msg[4].y, "y"];
                        mmWidth = (mms[1] === "x") ? 260 * res : mms[0] * 260 * res;
                        mmHeight = (mms[1] === "y") ? 260 * res : mms[0] * 260 * res;
                        circleRadius = Math.max((mmWidth > mmHeight) ? mmHeight / 15 : mmWidth / 15, 5);
                        circlePlane = {
                            x: mmWidth - (circleRadius * 2),
                            y: mmHeight - (circleRadius * 2)
                        }
                        if (circlePlane.x < 2) circlePlane.x = 2;
                        if (circlePlane.y < 2) circlePlane.y = 2;

                        systemText.hidden = false;
                        roomID.hidden = false;
                        roomContainer.hidden = false;
                    } else {
                        back.hidden = true;

                        const text = `error: room "${msgRoom}" already exists`
                        ctx.font = "20px Ubuntu";
                        systemText.style.width = `${ctx.measureText(text).width}px`
                        systemText.innerHTML = text;
                    }
                    break;

                // Joining rooms    
                case "b":
                    join.hidden = false;
                    make.hidden = false;
                    nname.hidden = false;
                    if (msg[2] === "a") {
                        let text = `current room: ${msgRoom === "" ? `"" (community garden)` : `"${msgRoom}"`}`;
                        ctx.font = "20px Ubuntu";
                        roomContainer.style.width = `${ctx.measureText(text).width}px`;
                        roomID.innerHTML = text;

                        if (!msg[5]) {
                            text = `room "${msgRoom}" successfully joined`
                            systemText.style.width = `${ctx.measureText(text).width}px`
                            systemText.innerHTML = text;
                        }

                        me.roomInfo = msg[4];
                        mms = (msg[4].x > msg[4].y) ? [msg[4].y / msg[4].x, "x"] : [msg[4].x / msg[4].y, "y"];
                        mmWidth = (mms[1] === "x") ? 260 * res : mms[0] * 260 * res;
                        mmHeight = (mms[1] === "y") ? 260 * res : mms[0] * 260 * res;
                        circleRadius = Math.max((mmWidth > mmHeight) ? mmHeight / 15 : mmWidth / 15, 5);
                        circlePlane = {
                            x: mmWidth - circleRadius * 2,
                            y: mmHeight - circleRadius * 2
                        }
                        if (circlePlane.x < 2) circlePlane.x = 2;
                        if (circlePlane.y < 2) circlePlane.y = 2;

                        back.hidden = true;
                        
                        inputJoin.hidden = true;
                        joinSubmit.hidden = true;
                        systemText.hidden = false;
                        roomID.hidden = false;
                        roomContainer.hidden = false;

						// setting radii (for petal icons)
						if (msg[6]) radii = msg[6];
						drawGallery(msg[6]);
						drawLoadout();
                    } else {
                        back.hidden = true;

                        inputJoin.hidden = true;
                        joinSubmit.hidden = true;

                        const text = `error: room "${msgRoom}" does not exist`
                        ctx.font = "20px Ubuntu";
                        systemText.style.width = `${ctx.measureText(text).width}px`
                        systemText.innerHTML = text;
                    }
                    break;
            }
            break;

        // Player init (when spawning)
        case "i":
            me.info.level = msg[1];
            const nOfPetals = 5 + Math.floor(msg[1] / 15);

            hotbarReloads = [];
            belowSlidingPetals = [];
			me.info.hotbarCooldowns = [];
			me.info.inventoryCooldowns = [];
            for (let i = 0; i < nOfPetals; i++) {
                hotbarReloads.push(new HotbarReload(0, 0, 0));
                belowSlidingPetals.push(undefined);
				me.info.hotbarCooldowns.push(Date.now());
            }

            aboveSlidingPetals = [];
            for (let i = 0; i < 8; i++) {
                aboveSlidingPetals.push(undefined);
				me.info.inventoryCooldowns.push(Date.now());
            }

			me.swapCooldown = msg[2];

            me.info.hotbar = msg[3];
            me.info.inventory = msg[4];
            break;

        // Game data
        case "b":
            // Getting your coordinates
            me.info.x = msg[1][0].x;
            me.info.y = msg[1][0].y;

            allPlayers = msg[1];
            break;
        
        // Death
        case "c":
            deathScreen[0] = msg[1];
            deathScreen[1] = msg[2];
			numInfo = false;
            break;

        // dead petals
        case "d":
            msg[1].forEach(deadPetal => {
                deadPetals.push(new DeadPetal(
                    deadPetal.x, 
                    deadPetal.y, 
                    deadPetal.id, 
                    deadPetal.radius
                ));
            });
            break;
		
		// petal reloads
		case "e":
			const newNum = msg[1] - me.info.hotbar.length / 2;
			hotbarReloads[msg[1]] = new HotbarReload(msg[2], 
                { 
					x: getXPos(msg[1], true, (hbOutline - (hbOutline * fgPercent)) / 2),
					y: getYPos(true, (hbOutline - (hbOutline * fgPercent)) / 2)
				}, 
                hbOutline * fgPercent); 
			break;

        // debug info
        case "z":
            debug = msg[1];
            break;

        // Ping
        case "pong":
            performance.ping.pings.push(Date.now() - msg[1]);
            break;

        default:
            console.log(`Unknown packet type: ${msg[0]}. Full packet is ${msg}`);
            break;
    }
}
