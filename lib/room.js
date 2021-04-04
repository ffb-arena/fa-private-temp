const F = require("./functions.js");
const Flower = require("./player/flower.js");
const C = require("./consts.js");
const handleCollision = require("./player/collisions.js");

class Room {
    constructor(w, h) {
        this.info = {
            x: F.clamp(w, 1, 299) * 50,
            y: F.clamp(h, 1, 299) * 50,
        };

        this.connected = 1;
        this.players = [];
    }

    spawnPlayer(myName, msgName, bruh, ws) {
        const newID = F.getID(this.players);
        const x = Math.random() * this.info.x;
        const y = Math.random() * this.info.y;
        const nOfPetals = 5;
        if (!myName) myName = C.names[Math.abs(Math.round(Math.random() * C.names.length) - 1)];
        const name = msgName || myName;
        this.players[newID] = new Flower(newID, x, y, nOfPetals, name, bruh, 1, ws);
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
                player.ws.send(JSON.stringify("c"));
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
        sortedPlayers.sort((a, b) => a.pubInfo.x - b.pubInfo.x);
        let possibleCollisions = [[]];
        let last = [];
        i = 0;

        // stuffing all players with near enough x axises to be colliding
        // into an array
        sortedPlayers.forEach(player => {
            if (player.pubInfo.x - player.petalDist < last[0]) {
                if (!possibleCollisions[i].length) {
                    possibleCollisions[i].push(last[1]);
                }
                possibleCollisions[i].push(player);
            } else if (possibleCollisions[i].length) {
                possibleCollisions[++i] = [];
            }
            last = [player.pubInfo.x + player.petalDist + 20, player];
        });

        // checking of the y values are close enough to actually collide
        let collisions = [];
        possibleCollisions.forEach(array => {
            // sorting each array based on y axis
            array.sort((a, b) => a.pubInfo.y - b.pubInfo.y);
            const length = array.length;
            array.forEach((player, i) => {
                for (let n = i + 1; n < length; n++) {
                    const player2 = array[n]
                    // if there's a collision
                    if (player2.pubInfo.y - player2.petalDist < player.pubInfo.y + player.petalDist + 20) {
                        collisions.push([player, player2]);
                    }
                }
            });
        });

        collisions.forEach(collision => {
            handleCollision(collision[0], collision[1], mul);
        });





        // Sending data
        this.players.forEach((player, i) => {
            if (!player) return;
            let send = [];
            send.push(this.players[i].pubInfo);
            this.players.forEach((player2, n) => {
                if (!player2 || n === i) return;
                if (
                    // maximum is 1920 x 1080 (add petal distance for players partially on screen)
                    (Math.abs(player.pubInfo.x - player2.pubInfo.x) <= 960 + Math.max(player2.petalDist, 45))
                    &&
                    (Math.abs(player.pubInfo.y - player2.pubInfo.y) <= 540 + Math.max(player2.petalDist, 45))
                ) send.push(player2.pubInfo);
            });
            player.ws.send(JSON.stringify(["b", send]));
        });
    }


}

module.exports = Room;