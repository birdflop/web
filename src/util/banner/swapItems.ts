export default function swapItems<T>(
  array: Array<T>,
  indexA: number,
  indexB: number
) {
  const arrLength = array.length;
  if (arrLength === 0) return [...array];

  const wrap = (i: number) => ((i % arrLength) + arrLength) % arrLength;
  const a = wrap(indexA);
  const b = wrap(indexB);

  const arr = [...array];

  const hasA = a in arr;
  const hasB = b in arr;
  if (!hasA || !hasB) return arr;

  [arr[a], arr[b]] = [arr[b], arr[a]];

  return arr;
}
