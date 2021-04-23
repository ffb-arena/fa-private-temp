const F = require("./functions.js");
const Flower = require("./player/flower.js");
const C = require("./consts.js");
const handleCollision = require("./player/collisions.js");

class Room {
    constructor(w, h, debug) {
        let height, width;

        try {
            height = parseInt(h);
        } catch {
            height = 20;
        }
        height = Math.round(height || 20) - 1;

        try {
            width = parseInt(w);
        } catch {
            width = 20;
        }
        width = Math.round(width || 20) - 1;

        this.info = {
            x: F.clamp(height, 1, 299) * 50,
            y: F.clamp(width, 1, 299) * 50,
        };

        this.connected = 1;
        this.players = [];
        this.debug = debug;
    }

    spawnPlayer(myName, msgName, level, bruh, ws) {
        try {
            level = parseInt(level);
        } catch {
            level = 45;
        }
        level = F.clamp(Math.round(level || 45), 0, 45);
        const newID = F.getID(this.players);
        const x = Math.random() * this.info.x;
        const y = Math.random() * this.info.y;
        if (!myName) myName = C.names[Math.abs(Math.round(Math.random() * C.names.length) - 1)];
        const name = msgName || myName;
        this.players[newID] = new Flower(newID, x, y, level, name, bruh, ws);
        return [newID, myName];
    }



    // room update - important stuff like collisions happen here
    update(mul) {
        if (!this.players.length) return;

        // Updating positions
        this.players.forEach(player => {
            if (!player) return;
            player.update(mul, this.info.x, this.info.y);
            if (player.pubInfo.health <= 0) {
                player.ws.send(JSON.stringify(["c", Date.now() - player.startingTime, player.level]));
                this.players[player.id] = undefined;
            } else {
                player.pubInfo.health = Math.min(player.pubInfo.maxHealth, player.pubInfo.health + player.healthRegen * mul);
            }
        });



        
        // Checking collisions
        let sortedPlayers = [];
        let i = 0;
        this.players.forEach(p => {
            if (!p) return;
            sortedPlayers[++i] = p;
        });

        // making a sorted list of players based on x axis
        sortedPlayers.sort((a, b) => a.petalCentre.x - b.petalCentre.x);
        let possibleCollisions = [[]];
        let last = [];
        i = 0;

        // stuffing all players with near enough x axises to be colliding
        // into an array
        sortedPlayers.forEach(player => {
            if (player.petalCentre.x - player.petalDist < last[0]) {
                if (!possibleCollisions[i].length) {
                    possibleCollisions[i].push(last[1]);
                }
                possibleCollisions[i].push(player);
            } else if (possibleCollisions[i].length) {
                possibleCollisions[++i] = [];
            }
            last = [player.petalCentre.x + player.petalDist + C.collisionPadding * 2, player];
        });

        // checking of the y values are close enough to actually collide
        let collisions = [];
        possibleCollisions.forEach(array => {
            // sorting each array based on y axis
            array.sort((a, b) => a.petalCentre.y - b.petalCentre.y);
            const length = array.length;
            array.forEach((player, i) => {
                for (let n = i + 1; n < length; n++) {
                    const player2 = array[n]
                    // if there's a collision
                    if (player2.petalCentre.y - player2.petalDist < player.petalCentre.y + player.petalDist + C.collisionPadding * 2) {
                        collisions.push([player, player2]);
                    }
                }
            });
        });

        collisions.forEach(collision => {
            handleCollision(collision[0], collision[1], mul, this.debug);
        });





        // Sending data
        this.players.forEach((player, i) => {
            if (!player) return;
            let send = [];
            send.push(this.players[i].pubInfo);
            if (this.debug) {
                player.debug.push([
                    "a", 
                    { x: player.petalCentre.x, y: player.petalCentre.y },
                    player.petalDist + C.collisionPadding
                ]);
            }
            this.players.forEach((player2, n) => {
                if (!player2 || n === i) return;
                if (
                    // maximum is 1920 x 1080 (add petal distance for players partially on screen)
                    (Math.abs(player.pubInfo.x - player2.pubInfo.x) <= 960 + Math.max(player2.petalDist, 45))
                    &&
                    (Math.abs(player.pubInfo.y - player2.pubInfo.y) <= 540 + Math.max(player2.petalDist, 45))
                ) {
                    send.push(player2.pubInfo);
                    if (this.debug) {
                        player.debug.push([
                            "a", 
                            { x: player2.petalCentre.x, y: player2.petalCentre.y },
                            player2.petalDist + 20
                        ]);
                    }
                }
            });
            player.ws.send(JSON.stringify(["b", send]));
            player.ws.send(JSON.stringify(["z", player.debug]));
            player.debug = [];
        });
    }


}

module.exports = Room;