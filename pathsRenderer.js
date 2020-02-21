/**
 * Stringify line using explicit definition of each segment in a poly-line.
 *
 * @param {Array.<number>} line Array of numbers representing coordinate pairs in format [x1, y1, x2, y2, ...].
 * @returns {string}
 */
function stringifyPathExplicit(line) {
  let command = 'M ';

  for (let jj = 0; jj < line.length; jj++) {
    if (jj > 1 && (jj % 2 === 0)) {
      command += ` L ${line[jj]}`;
    } else {
      command += ` ${line[jj]}`;
    }
  }

  return command;
}

/**
 * Stringify line using implicit definition of each segment in a poly-line.
 *
 * @param {Array.<number>} line Array of numbers representing coordinate pairs in format [x1, y1, x2, y2, ...].
 * @returns {string}
 */
function stringifyPathImplicit(line) {
  return `M ${line.join(' ')}`;
}

/**
 * Some browsers (Edge) convert implicit lines "M 0 0 10 0" into explicit lines "M 0 0 L 10 0". Detect if this is such browser.
 *
 * @param {object} document DOM document object.
 * @returns {boolean}
 */
function hasImplicitLineProblem(document) {
  const desiredCommand = 'M 0 0 10 0';
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  path.setAttribute('d', desiredCommand);

  return desiredCommand !== path.getAttribute('d');
}

let stringifyPath;

/**
 * Convert array of positions to a SVG Path command string.
 *
 * @param {Array.<Array.<number>>} lines SVG Path data in format `[[x1, y1, x2, y2, ...], ...]`.
 * @param {number} strokeWidth Stroke width.
 * @returns {string}
 */
function convertLinesToCommand(lines, strokeWidth) {
  if (!stringifyPath) {
    stringifyPath = hasImplicitLineProblem(svg.ownerDocument) ? stringifyPathExplicit : stringifyPathImplicit;
  }

  let command = '';
  let firstX = -1;
  let firstY = -1;
  let lastX = -1;
  let lastY = -1;

  for (let ii = 0; ii < lines.length; ii++) {
    const line = lines[ii];

    if (ii === 0) {
      firstX = line[0];
      firstY = line[1];
    }

    const len = line.length;

    lastX = line[len - 2];
    lastY = line[len - 1];

    if (ii > 0) {
      command += ' ';
    }

    command += stringifyPath(line);
  }

  const firstLine = lines[0];
  const lastLine = lines[lines.length - 1];
  const isLastPointDifferentThanFirst = (firstX !== lastX || firstY !== lastY);

  if (isLastPointDifferentThanFirst) {
    if (strokeWidth === 1) {
      const lastLineLen = lastLine.length;

      command = `M ${firstLine[2]} ${firstLine[3]} ${command.substring(2)} ${lastLine[lastLineLen - 4]} ${lastLine[lastLineLen - 3]}`;
    }
  } else {
    command += ' Z';
  }

  return command;
}
