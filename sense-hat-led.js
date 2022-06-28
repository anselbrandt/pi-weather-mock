const output = require("image-output");
const scale = require("./scale");

const sense = {
  sync: {
    setPixels: (pixels) => {
      const scaled = scale(pixels, 3);
      output(
        {
          data: scaled.pixels,
          width: scaled.size,
          height: scaled.size,
        },
        console
      );
    },
  },
};

module.exports = sense;
