export default function arrayToStringComma(array) {
  return array.slice(0, -1).join(", ") + " e " + array.slice(-1);
}
