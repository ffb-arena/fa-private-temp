const getID = require("./functions.js");
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

    _handleCollision(p1, p2) {
        // knockback between 2 players
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
            player.update(mul, this.info.x, this.info.y);
        });

        // Checking collisions
        let sortedPlayers = [];
        let i = 0;
        this.players.forEach(p => {
            if (!p) return;
            sortedPlayers[++i] = p;
        });
        sortedPlayers.sort((a, b) => a.pubInfo.x - b.pubInfo.x);

        // this.players.forEach((player, i) => {
        //     this.players.forEach((p, n) => {
        //         if (!(n <= i)) {
        //             const d = player.distances.get(p.id);
        //             if (Math.pow(Math.round(d.x * 100) / 100, 2) + Math.pow(Math.round(d.y * 100) / 100, 2)
        //                 <=
        //                 (Math.pow(Math.max(this.players.get(p.id).petalDist + this.players.get(p.id).petalDist + 20, 90), 2))) {

        //                 // p.id and player.id collide

        //                 // checking if the bodies collide (2500 = 50^2)
        //                 if (Math.pow(Math.round(d.x * 100) / 100, 2) + Math.pow(Math.round(d.y * 100) / 100, 2) <= 2500) {  
        //                     this._handleCollision(player, p);
        //                 }
        //             }
        //         }
        //     });
        // });

        // Sending data
        this.players.forEach((player, i) => {
            let send;
            send = [];
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