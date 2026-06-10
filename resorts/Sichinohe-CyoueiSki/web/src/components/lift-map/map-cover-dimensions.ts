/** LAAX 型: 地形は viewport を埋める（cover）。余白 letterbox は出さない。 */
export const MAP_FIT_PADDING_PX = 0;

export function coverDimensions(
  containerWidth: number,
  containerHeight: number,
  contentAspect: number,
  padding = MAP_FIT_PADDING_PX,
): { width: number; height: number } {
  if (containerWidth <= 0 || containerHeight <= 0 || contentAspect <= 0) {
    return { width: 0, height: 0 };
  }
  const innerW = Math.max(0, containerWidth - padding * 2);
  const innerH = Math.max(0, containerHeight - padding * 2);
  if (innerW <= 0 || innerH <= 0) {
    return { width: 0, height: 0 };
  }
  const containerAspect = innerW / innerH;
  if (containerAspect > contentAspect) {
    return {
      width: innerH * contentAspect,
      height: innerH,
    };
  }
  return {
    width: innerW,
    height: innerW / contentAspect,
  };
}
