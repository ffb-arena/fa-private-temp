const frame = 1000 / 25;

class Petal {
    constructor(id, degree, coordR, centre) {
        this.id = id;
        this.degree = degree;
        this.x = centre.x + Math.sin(degree) * coordR;
        this.y = centre.y + Math.cos(degree) * coordR;
        this.change = 2.5 / (1000 / frame);
        switch (this.id) {
            case 1: 
                this.radius = 10;
                break;
        }
    }

    update(centre, degree, distance) {
        this.degree = degree;
        this.x = centre.x + Math.sin(degree) * distance;
        this.y = centre.y + Math.cos(degree) * distance;
    }
}

module.exports = Petal;