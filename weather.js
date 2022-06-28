// https://weather.gc.ca/rss/city/qc-147_e.xml

const fetch = require("node-fetch");
const sense = require("./sense-hat-led");

const X = [64, 64, 64]; // white
const O = [0, 0, 0]; // black
const B = [0, 0, 64]; // blue

// prettier-ignore
const num = [
[X,X,X,O,O,O,O,O,X,O,X,O,O,O,O,O,X,O,X,O,O,O,O,O,X,O,X,O,O,O,O,O,X,X,X,],
[O,O,X,O,O,O,O,O,O,O,X,O,O,O,O,O,O,O,X,O,O,O,O,O,O,O,X,O,O,O,O,O,O,O,X,],
[X,X,X,O,O,O,O,O,O,O,X,O,O,O,O,O,X,X,X,O,O,O,O,O,X,O,O,O,O,O,O,O,X,X,X,],
[X,X,X,O,O,O,O,O,O,O,X,O,O,O,O,O,X,X,X,O,O,O,O,O,O,O,X,O,O,O,O,O,X,X,X,],
[X,O,X,O,O,O,O,O,X,O,X,O,O,O,O,O,X,X,X,O,O,O,O,O,O,O,X,O,O,O,O,O,O,O,X,],
[X,X,X,O,O,O,O,O,X,O,O,O,O,O,O,O,X,X,X,O,O,O,O,O,O,O,X,O,O,O,O,O,X,X,X,],
[X,X,X,O,O,O,O,O,X,O,O,O,O,O,O,O,X,X,X,O,O,O,O,O,X,O,X,O,O,O,O,O,X,X,X,],
[X,X,X,O,O,O,O,O,O,O,X,O,O,O,O,O,O,O,X,O,O,O,O,O,O,O,X,O,O,O,O,O,O,O,X,],
[X,X,X,O,O,O,O,O,X,O,X,O,O,O,O,O,X,X,X,O,O,O,O,O,X,O,X,O,O,O,O,O,X,X,X,],
[X,X,X,O,O,O,O,O,X,O,X,O,O,O,O,O,X,X,X,O,O,O,O,O,O,O,X,O,O,O,O,O,X,X,X,],
];

const city = "qc-147";
const lang = "e";
const url = `https://weather.gc.ca/rss/city/${city}_${lang}.xml`;

async function getWeather() {
  const response = await fetch(url);
  const xml = await response.text();
  const observed = xml
    .split("[CDATA[")[1]
    .split("]]")[0]
    .replace(/<b>/g, "")
    .replace(/<\/b>/g, "")
    .replace(/<br\/>/g, "")
    .replace(/&deg;C/g, "")
    .replace(/km\/h/g, "")
    .replace(/km/g, "")
    .replace(/kPa/g, "")
    .replace(/%/g, "")
    .replace(/\/ Tendency/g, "")
    .trim()
    .split(/\n/)
    .map((entry) => entry.trim().toLowerCase());
  const [_, ...tail] = observed;
  const entries = tail.map((entry) => entry.split(":"));
  const current = entries.reduce((acc, curr) => {
    const [key, val] = curr;
    return Object.assign(acc, { [key.trim()]: val.trim() });
  }, {});
  const rain = current.condition.split(" ").includes("rain") ? true : false;
  const temp = current.temperature;

  return { rain, temp };
}

async function main() {
  const grid = Array(64).fill(O);

  const firstChar = (input) =>
    grid.map((val, index) => (input[index] ? input[index] : O));

  const secondChar = (input) =>
    grid.map((val, index) =>
      index > 4 && input[index - 5] ? input[index - 5] : O
    );

  const negIcon = grid.map((val, index) =>
    index === 48 || index === 49 ? X : O
  );

  const rainIcon = grid.map((val, index) =>
    index === 54 || index === 55 || index === 62 || index === 63 ? B : O
  );

  const decIcon = grid.map((val, index) => (index === 44 ? X : O));

  const merge = (arr1, arr2) =>
    arr1.map((val, index) =>
      val !== O ? val : arr2[index] !== O ? arr2[index] : O
    );

  const getDisplay = (options) => {
    const isRain = options.rain;
    const isNeg = options.temp < 0;
    const tempStr = options.temp.toString().replace("-", "");
    const whole = tempStr.split(".");
    const isDec = tempStr.includes(".") && whole[0].length === 1;
    const firstDig = whole[0] > 1 ? whole[0][0] : whole[0];
    const secondDig = whole[0].length > 1 ? whole[0][1] : whole[1];
    return {
      isRain,
      isNeg,
      isDec,
      firstDig: parseInt(firstDig),
      secondDig: secondDig ? parseInt(secondDig) : 0,
    };
  };

  const getPixels = (options) => {
    const { isRain, isNeg, isDec, firstDig, secondDig } = options;
    const withNeg = isNeg ? negIcon : grid;
    const withRain = isRain ? rainIcon : grid;
    const withDec = isDec ? decIcon : grid;
    return merge(
      merge(
        merge(firstChar(num[firstDig]), secondChar(num[secondDig])),
        merge(withNeg, withRain)
      ),
      withDec
    );
  };

  const weather = await getWeather();
  // const weather = {
  //   rain: true,
  //   temp: -8.8,
  // };
  const display = getDisplay(weather);
  const pixels = getPixels(display);
  sense.sync.setPixels(pixels);
}

main().catch((error) => console.error(error));
