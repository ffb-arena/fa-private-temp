const regex = str => new RegExp(`\\b${str}(?![\\w]|'|"|\`)`, "g"); 
const macros = [
	[regex("wh"), "window.innerHeight"],
	[regex("ww"), "window.innerWidth"],
	[regex("R"),  "return"],
	[regex("C"),  "const"],
	[regex("L"),  "let"]
];
module.exports = macros;
