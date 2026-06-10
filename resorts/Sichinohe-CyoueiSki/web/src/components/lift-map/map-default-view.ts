/** 全体表示（リセット）時の基準ビュー — ステージ全面に cover（レールは地図外） */
export const MAP_FIT_SCALE = 1.12;

export function mapDefaultView(
  containerWidth: number,
  _railOverlay: boolean,
): { scale: number; x: number; y: number } {
  return {
    scale: MAP_FIT_SCALE,
    x: 0,
    y: -Math.min(24, containerWidth * 0.012),
  };
}
