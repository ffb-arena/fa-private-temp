const { getID, dot } = require("./functions.js");
const Flower = require("./flower.js");
const C = require("./consts.js");

class Room {
    constructor(w, h) {
        this.info = {

            x: Math.min(
                299, 
                Math.max(
                    1, 
                    w
                )
            ) * 50,

            y: this.roomX = Math.min(
                299, 
                Math.max(
                    1, 
                    h
                )
            ) * 50

        };

        this.connected = 0;
        this.players = [];
    }

    _handleBodyCollision(p1, p2) {
        // knockback between 2 players
    }

    _handleCollision(p1, p2) {
            let dist = { // distance between the players
                x: Math.abs(p1.pubInfo.x - p2.pubInfo.x),
                y: Math.abs(p1.pubInfo.y - p2.pubInfo.y)
            };
            // checking if the bodies collide (2500 = 50^2)
            if ((dist.x * dist.x + dist.y * dist.y) <= 2500) {  
                this._handleBodyCollision(p1, p2)
            }
    }

    spawnPlayer(myName, msgName, bruh, ws) {
        const newID = getID(this.players);
        const x = Math.random() * this.info.x;
        const y = Math.random() * this.info.y;
        const n = 5;
        if (!myName) myName = C.names[Math.abs(Math.round(Math.random() * C.names.length) - 1)];
        const name = msgName || myName;
        this.players[newID] = new Flower(newID, x, y, n, name, bruh, 1, ws);
        return [newID, myName];
    }



    // room update - important stuff like collisions happen here
    update(mul) {
        if (!this.players.length) return;

        // Updating positions
        this.players.forEach(player => {
            if (!player) return;
            player.update(mul, this.info.x, this.info.y);
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
            array.forEach((player, i) => {
                array.forEach((p, n) => {
                    if (n <= i) return;
                    // if there's a collision
                    if (p.pubInfo.y - p.petalDist < player.pubInfo.y + player.petalDist + 20) {
                        collisions.push([player, p]);
                    }
                });
            });
        });

        collisions.forEach(collision => {
            this._handleCollision(collision[0], collision[1]);
        });

        // Sending data
        this.players.forEach((player, i) => {
            let send = [];
            send.push(this.players[i].pubInfo);
            this.players.forEach((p, n) => {
                if (n !== i &&
                    // maximum is 1920 x 1080 (add petal distance for players partially on screen)
                    (Math.abs(player.pubInfo.x - p.pubInfo.x) <= 960 + Math.max(p.petalDist, 45))
                    &&
                    (Math.abs(player.pubInfo.y - p.pubInfo.y) <= 540 + Math.max(p.petalDist, 45))
                ) send.push(p.pubInfo);
            });
            player.client.send(JSON.stringify(["b", send]));
        });
    }


}

module.exports = Room;