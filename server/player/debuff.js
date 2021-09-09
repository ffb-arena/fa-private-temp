const C = require("../consts.js");

class Debuff {
	constructor(type, hpPerSecond, totalHPLoss) {
		this.type = type;
		this.hpLoss = hpPerSecond / (1000 / C.frame); // per frame
		this.endTime = Date.now() + Math.round(totalHPLoss / hpPerSecond * 1000);
	}
	update() {
		return Date.now() < this.endTime;
	}
}

module.exports = Debuff;
