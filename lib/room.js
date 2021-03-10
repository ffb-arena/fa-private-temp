const F = require("./functions.js");
const Flower = require("./flower.js");

const names = [
    "John",
    "Milk&Cookies",
    "Jeff",
    "THISGAMSUX",
    "DEVUPDATEDIEP",
    "[KH]shift2team",
    "poopsock",
    "IMPROE",
    "Im haxin",
    "BAXTRIX[EN]",
    "dunked on yt",
    "[MG]MasterOv",
    "GebitDiver",
    "no mates :(((",
    "PUS ABOVE ALL",
    "SaloonTerror"
];

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
        this.players = new Map();
    }

    spawnPlayer(myName, msgName, bruh, ws) {
        const newID = F.getID(this.players);
        const x = Math.random() * this.info.x;
        const y = Math.random() * this.info.y;
        const n = 5;
        if (!myName) myName = names[Math.abs(Math.round(Math.random() * names.length) - 1)];
        const name = msgName || myName;
        this.players.set(newID, new Flower(newID, x, y, n, name, bruh, 1, ws));
        this.players.forEach((p, id) => {
            if (p.id === newID) return;
            this.players.get(newID).distances.set(
                id, 
                { 
                    x: this.players.get(id).pubInfo.x - x, 
                    y: this.players.get(id).pubInfo.y - y, 
                }
            );
            p.distances.set(
                newID,
                {
                    x: x - this.players.get(id).pubInfo.x, 
                    y: y - this.players.get(id).pubInfo.y, 
                }
            )
        });
        return [newID, myName];
    }

    // room update - important stuff like collisions happen here
    update(mul) {
        if (!this.players.size) return;

        // Updating positions
        this.players.forEach(player => player.update(mul, this.info.x, this.info.y));

        // Updating distances between players
        this.players.forEach((player, id) => {
            this.players.forEach((p, otherID) => {
                if (id !== otherID) {
                    p.distances.get(id).x += player.movement.xToAdd;
                    p.distances.get(id).y += player.movement.yToAdd;
                    player.distances.get(otherID).x -= player.movement.xToAdd;
                    player.distances.get(otherID).y -= player.movement.yToAdd;
                }
            })
        });

        // Checking collisions
        this.players.forEach((player, i) => {
            this.players.forEach((p, n) => {
                if (!(n <= i)) {
                    const d = player.distances.get(p.id);
                    if (Math.pow(Math.round(d.x * 100) / 100, 2) + Math.pow(Math.round(d.y * 100) / 100, 2)
                        <=
                        (Math.pow(Math.max(this.players.get(p.id).petalDist + this.players.get(p.id).petalDist + 20, 90), 2))) {

                        // p.id and player.id collide

                        // checking if the bodies collide (2500 = 50^2)
                        if (Math.pow(Math.round(d.x * 100) / 100, 2) + Math.pow(Math.round(d.y * 100) / 100, 2) <= 2500) {  

                            // knockback between 2 players
                            const playerAcc = {
                                x: -player.movement.acc.x,
                                y: -player.movement.acc.y
                            };
                            const pAcc = {
                                x: -p.movement.acc.x,
                                y: -p.movement.acc.y
                            };

                            const playerInitialAngle = Math.atan2(playerAcc.y, playerAcc.x);
                            const pInitialAngle = Math.atan2(pAcc.y, pAcc.x);

                            const avg = 2 * Math.PI - (playerInitialAngle + pInitialAngle) / 2;

                            const playerAccToAdd = F.coord(avg + (Math.PI * (playerInitialAngle < pInitialAngle)), 0.5);
                            const pAccToAdd = F.coord(avg + (Math.PI * (playerInitialAngle > pInitialAngle)), 0.5);

                            const overlapX = Math.abs(player.pubInfo.x - p.pubInfo.x) * 0.5; // actually half of overlap 
                            const overlapY = Math.abs(player.pubInfo.y - p.pubInfo.y) * 0.5; // because makes it less "snappy"
                            
                            const total = p.movement.xToAdd * p.movement.xToAdd
                                + p.movement.yToAdd * p.movement.yToAdd
                                + player.movement.xToAdd * player.movement.xToAdd
                                + player.movement.yToAdd * player.movement.yToAdd;
                            const playerPart = (player.movement.xToAdd * player.movement.xToAdd
                                + player.movement.yToAdd * player.movement.yToAdd) / total;
                            const pPart = 1 - playerPart;

                            let x = overlapX * playerPart * (-(playerAccToAdd.x / Math.abs(playerAccToAdd.x) || 0));
                            let y = overlapY * playerPart * (-(playerAccToAdd.y / Math.abs(playerAccToAdd.y) || 0));
                            player.pubInfo.x -= x;
                            player.pubInfo.y -= y;
                            this.players.forEach((otherP, id) => {
                                if (id !== player.id) {
                                    otherP.distances.get(player.id).x -= x;
                                    otherP.distances.get(player.id).y -= y;
                                    player.distances.get(otherP.id).x += x;
                                    player.distances.get(otherP.id).y += y;
                                }
                            });

                            x = overlapX * pPart * (-(pAccToAdd.x / Math.abs(pAccToAdd.x) || 0));
                            y = overlapY * pPart * (-(pAccToAdd.y / Math.abs(pAccToAdd.y) || 0));
                            p.pubInfo.x -= x;
                            p.pubInfo.y -= y;
                            this.players.forEach((otherP, id) => {
                                if (id !== p.id) {
                                    otherP.distances.get(p.id).x -= x;
                                    otherP.distances.get(p.id).y -= y;
                                    p.distances.get(otherP.id).x += x;
                                    p.distances.get(otherP.id).y += y;
                                }
                            });

                            player.movement.accOffset.x += playerAccToAdd.x;
                            player.movement.accOffset.y += playerAccToAdd.y;
                            p.movement.accOffset.x += pAccToAdd.x;
                            p.movement.accOffset.y += pAccToAdd.y;
                        }
                    }
                }
            });
        });

        // Sending data
        this.players.forEach((player, i) => {
            let reciever, send;
            send = [];
            reciever = {};
            reciever = this.players.get(i).distances;
            send.push(this.players.get(i).pubInfo);
            this.players.forEach((p, n) => {
                if (n !== i &&
                    // maximum is 1920 x 1080 (add petal distance for players partially on screen)
                    (Math.abs(reciever.get(n).x) <= 960 + Math.max(p.petalDist, 45))
                    &&
                    (Math.abs(reciever.get(n).y) <= 540 + Math.max(p.petalDist, 45))
                ) send.push(p.pubInfo);
            });
            player.client.send(JSON.stringify(["b", send]));
        });
    }
}

module.exports = Room;