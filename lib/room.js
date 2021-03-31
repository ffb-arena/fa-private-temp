const F = require("./functions.js");
const Flower = require("./flower.js");
const C = require("./consts.js");

class Room {
    constructor(w, h) {
        this.info = {

            x: F.clamp(w, 1, 299) * 50,
            y: F.clamp(h, 1, 299) * 50,

        };

        this.connected = 1;
        this.players = [];
    }

    // collisions where one player is not moving
    _handleStillCollision(p1, p2, mul, notMoving) {
        let divide = C.acc.flower * C.friction * mul; // divide by this to make x/yToAdd between 0 and 1
        let players = [];
        if (notMoving === 1) { // players[0] is still
            players = [p1, p2]; // players[1] is moving
        } else {
            players = [p2, p1];
        }

        // setting moving player's accelerations in the opposite directions
        let cV = { // current velocities
            x: -players[1].movement.xToAdd / divide,
            y: -players[1].movement.yToAdd / divide
        };

        // making minimum amount of knockback and applying knockback
        // let posOrNeg = {
        //     x: F.whichOne(cV.x),
        //     y: F.whichOne(cV.y)
        // }
        // players[1].movement.accOffset.x = cV.x * posOrNeg.x * 1.15;
        // players[1].movement.accOffset.y = cV.y * posOrNeg.y * 1.15;
        // players[1].movement.accOffset.x = Math.max(0.6, players[1].movement.accOffset.x);
        // players[1].movement.accOffset.y = Math.max(0.6, players[1].movement.accOffset.y);
        // players[1].movement.accOffset.x *= posOrNeg.x;
        // players[1].movement.accOffset.y *= posOrNeg.y;


        // fixing overlap
        const currentDist = F.pythag( // current distance between players
            players[1].pubInfo.x - players[0].pubInfo.x, 
            players[1].pubInfo.y - players[0].pubInfo.y
        );
        const lastFrameDist = F.pythag(
            players[1].pubInfo.x - players[1].movement.xToAdd - players[0].pubInfo.x, 
            players[1].pubInfo.y - players[1].movement.yToAdd - players[0].pubInfo.y
        ) - currentDist;
        const wantedDist = 50 - currentDist;
        const offsetToAdd = wantedDist / lastFrameDist;
        players[1].pubInfo.x -= players[1].movement.xToAdd * offsetToAdd;
        players[1].pubInfo.y -= players[1].movement.yToAdd * offsetToAdd;

        // still object gets the other object's velocity
        players[0].movement.accOffset.x = players[1].movement.xToAdd / divide;
        players[0].movement.accOffset.y = players[1].movement.yToAdd / divide;
    }

    // knockback between 2 players
    _handleBodyCollision(p1, p2, mul) {
        let notMoving;
        if (!p1.movement.xToAdd && !p1.movement.yToAdd) {
            notMoving = 1;
        } else if (!p2.movement.xToAdd && !p2.movement.yToAdd) {
            notMoving = 2;
        }

        if (notMoving) {
            this._handleStillCollision(p1, p2, mul, notMoving);
            return;
        }
    }

    _handleCollision(p1, p2, mul) {
            let dist = { // distance between the players
                x: Math.abs(p1.pubInfo.x - p2.pubInfo.x),
                y: Math.abs(p1.pubInfo.y - p2.pubInfo.y)
            };
            // checking if the bodies collide (2500 = 50^2)
            if ((dist.x * dist.x + dist.y * dist.y) <= 2500) {  
                this._handleBodyCollision(p1, p2, mul);
            }
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
            this._handleCollision(collision[0], collision[1], mul);
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
            player.client.send(JSON.stringify(["b", send]));
        });
    }


}

module.exports = Room;