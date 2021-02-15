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

        this.connected = 1;
        this.inGame = 0;
        this.players = {};
    }
}

module.exports = Room;