const Room = require("./room.js");

function handlePacket(packet, myRoom, myID, myName, rooms, bruh, ws) {
    switch (packet[0]) {

        // Creating/joining rooms
        case "a":
            switch (packet[1]) {

                // Creating a room
                case "a":
                    if (rooms.has(packet[2])) ws.send(JSON.stringify(["a", "a", "b", packet[2]]));
                    else {
                        if (myID !== undefined) {
                            rooms.get(myRoom).players[myID] = undefined;
                            myID = undefined;
                        }
                        rooms.get(myRoom).connected--;
                        if (!rooms.get(myRoom).connected && myRoom !== "") rooms.delete(myRoom);
                        rooms.set(packet[2], 
                            new Room(
                                parseInt(packet[3]) === NaN ? 20 : Math.round(parseInt(packet[3])) - 1,
                                parseInt(packet[4]) === NaN ? 20 : Math.round(parseInt(packet[4])) - 1
                            )
                        );
                        myRoom = packet[2];
                        ws.send(JSON.stringify(["a", "a", "a", packet[2], rooms.get(packet[2]).info]));
                    }
                    break;

                // Joining a room
                case "b":
                    if (rooms.has(packet[2])) {
                        if (myID !== undefined) {
                            rooms.get(myRoom).players[myID] = undefined;
                            myID = undefined;
                        }
                        rooms.get(myRoom).connected--;
                        if (!rooms.get(myRoom).connected && myRoom !== "") rooms.delete(myRoom);

                        ws.send(JSON.stringify(["a", "b", "a", packet[2], rooms.get(packet[2]).info]));
                        myRoom = packet[2];
                        rooms.get(packet[2]).connected++;
                    } else ws.send(JSON.stringify(["a", "b", "b", packet[2]]));
                    break;
            }
            break;

        // Spawning
        case "b":
            if (myID === undefined) {
                [myID, myName] = rooms.get(myRoom).spawnPlayer(myName, packet.slice(1, 21), bruh, ws);
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
            }
            break;

        // Ping
        case "p":
            if (packet === "ping") ws.send(JSON.stringify("pong"));
            break;
    }

    return [myRoom, myID, myName, bruh];
}

module.exports = handlePacket;