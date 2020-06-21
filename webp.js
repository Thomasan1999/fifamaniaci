"use strict";
exports.__esModule = true;
var sharp = require("sharp");
// @ts-ignore
sharp("src/assets/home-background-2.jpg").webp({ quality: 60 }).toFile("src/assets/home-background-2.webp")["catch"](console.error);
//# sourceMappingURL=webp.js.map