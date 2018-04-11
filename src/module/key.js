/*
 * Keys differ between sources.
 *
 * This module contains source specific key implementations
 */

/*
 * WOM key format:
 *
 *  key format: ssbuuIqq.ppp
 *
 *   ss: source Id
 *    b: book Id
 *   uu: unit Id
 *    I: quesiton indicator, 0:no questions 1:questions
 *   qq: question Id
 *  ppp: paragraph number - not positional
 */
function getWOMKeyRange(keyString) {
  const keyLength = 8; //ssbuuIqq
  let paddingLength = keyLength - keyString.length;
  let keyRange = {startValue: 0, endValue: 0};

  //expect keyString smaller than keyLength characters
  if (paddingLength < 0) {
    return keyRange;
  }

  let zeroPadded = new Array(paddingLength + 1).join("0");
  let ninePadded = new Array(paddingLength + 1).join("9");

  let startString = `${keyString}${zeroPadded}.000`;
  let endString = `${keyString}${ninePadded}.999`;

  keyRange.startValue = parseFloat(startString);
  keyRange.endValue = parseFloat(endString);

  return keyRange;
}


/*
 * Key represents a source or source and book and is the
 * starting point for a search for bookmarks.
 */
function getKeyRange(key) {
  let keyString = key;

  //convert to string
  if (typeof key !== "string") {
    keyString = key.toString(10);
  }

  switch(keyString.substr(0,2)) {
    case "10":
      return getWOMKeyRange(keyString);
    default:
      return {startValue: 0, endValue: 0};
  }
}

module.exports = getKeyRange;


