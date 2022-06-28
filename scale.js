scale = (flat, factor = 1) => {
  const size = Math.sqrt(flat.length);
  const input = [];

  while (flat.length) {
    input.push(flat.splice(0, size));
  }

  const rows = [];

  input.forEach((r, i) => {
    for (let x = 0; x < factor; x++) {
      rows.push(input[i]);
    }
  });

  const output = [];

  rows.forEach((row, i) => {
    let newRow = [];
    row.forEach((pixel, j) => {
      for (let x = 0; x < factor; x++) {
        newRow.push(rows[i][j]);
      }
    });
    output.push(newRow);
  });

  return {
    pixels: output.flat(),
    size: size * factor,
  };
};

module.exports = scale;
