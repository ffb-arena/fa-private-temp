const Room = require("./room.js");

function handlePacket(msg, myRoom, myID, myName, rooms, bruh, ws) {
    let packet;
    try {
        packet = JSON.parse(msg);
    } catch {
        console.log(`Invalid message: ${msg}`);
        return;
    }
    if (!rooms.get(myRoom).players[myID]) myID = undefined;
    switch (packet[0]) {

        // Creating/joining rooms
        case "a":

            let roomName;
            try {
                roomName = String(packet[2]);
            } catch {
                roomName = "";
            }
            
            switch (packet[1]) {

                // Creating a room
                case "a":
                    if (rooms.has(roomName)) {
                        ws.send(JSON.stringify(["a", "a", "b", roomName]));
                    }
                    else {
                        if (myID !== undefined) {
                            rooms.get(myRoom).players[myID] = undefined;
                            myID = undefined;
                        }
                        rooms.get(myRoom).connected--;
                        if (!rooms.get(myRoom).connected && myRoom !== "") rooms.delete(myRoom);
                        rooms.set(
                            roomName, 
                            new Room(packet[3], packet[4])
                        );
                        myRoom = roomName;
                        ws.send(JSON.stringify(["a", "a", "a", roomName, rooms.get(roomName).info]));
                    }
                    break;

                // Joining a room
                case "b":
                    if (rooms.has(roomName)) {
                        if (myID !== undefined) {
                            rooms.get(myRoom).players[myID] = undefined;
                            myID = undefined;
                        }
                        rooms.get(myRoom).connected--;
                        if (!rooms.get(myRoom).connected && myRoom !== "") rooms.delete(myRoom);

                        ws.send(JSON.stringify(["a", "b", "a", roomName, rooms.get(roomName).info]));
                        myRoom = roomName;
                        rooms.get(roomName).connected++;
                    } else {
                        ws.send(JSON.stringify(["a", "b", "b", roomName]));
                    }
                    break;
            }
            break;

        // Spawning
        case "b":
            if (myID === undefined) {
                [myID, myName] = rooms.get(myRoom).spawnPlayer(
                    myName, 
                    packet[1].slice(0, 20), 
                    packet[2],
                    bruh, 
                    ws
                );
            }
            break;

        // Button pressed or movement stuff
        case "c": 
            switch (packet[1]) {

                // keyup
                case "a":
                    if (myID !== undefined) {
                        rooms.get(myRoom).players[myID].keyDown(packet.slice(2, packet.length));
                    }
                    break;

                // keydown
                case "b":
                    if (myID !== undefined) {
                        rooms.get(myRoom).players[myID].keyUp(packet.slice(2, packet.length))
                    }
                    break;

                // changing movement settings
                case "c":
                    bruh = !bruh;
                    if (myID !== undefined) rooms.get(myRoom).players[myID].keyboard = !rooms.get(myRoom).players[myID].keyboard;
                    break;

                // moving mouse
                case "d":
                    if (myID !== undefined) {
                        rooms.get(myRoom).players[myID].mouse.mouseX = packet[2];
                        rooms.get(myRoom).players[myID].mouse.mouseY = packet[3];
                        rooms.get(myRoom).players[myID].res = packet[4];
                    }
					break;
			
				// freezing/stopping freezing
				case "e":
					if (myID !== undefined) {
						if (packet[2] === "a") {
							// freezing
							rooms.get(myRoom).players[myID].frozen = true;
						} else {
							// stopping freezing
							rooms.get(myRoom).players[myID].frozen = false;
						}
					}
            }
            break;

        // swapping petals
        case "d": 
            rooms.get(myRoom).players[myID].swapPetalsChecks(packet[1], packet[2]);
            break;

        // Ping
        case "ping":
            ws.send(JSON.stringify(["pong", packet[1]]));
            break;
    }

    return [myRoom, myID, myName, bruh];
}

module.exports = handlePacket;
