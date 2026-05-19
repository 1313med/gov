const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const src = path.join(__dirname, "../assets/images/goovoiture-receipt-logo.png");
const dest = path.join(__dirname, "../assets/images/goovoiture-receipt-logo-transparent.png");

const png = PNG.sync.read(fs.readFileSync(src));
for (let y = 0; y < png.height; y++) {
  for (let x = 0; x < png.width; x++) {
    const i = (png.width * y + x) << 2;
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    if (r < 48 && g < 48 && b < 48) png.data[i + 3] = 0;
  }
}
fs.writeFileSync(dest, PNG.sync.write(png));
console.log("wrote", dest);
