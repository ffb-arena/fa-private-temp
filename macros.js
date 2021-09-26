const ors = "|'|`|\"";
const regex = str => new RegExp(`(?=[\\w]${ors})${str}(?![\\w]${ors})`, "g"); 
const macros = [
	[regex("wh"), "window.innerHeight"],
	[regex("ww"), "window.innerWidth"],
	[regex("R"),  "return"],
	[regex("C"),  "const"],
	[regex("L"),  "let"]
];
module.exports = macros;
