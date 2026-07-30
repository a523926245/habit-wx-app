/**
 * 按钮防抖 Hook
 * 对应 Flutter 端的 DebounceButton
 */

/**
 * 创建一个防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒），默认 500ms
 * @returns 防抖后的函数
 */
export function debounce<F extends (...args: unknown[]) => void>(
  fn: F,
  delay = 500
): (...args: Parameters<F>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<F>) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn(...args);
      timer = null;
    }, delay);
  };
}

/**
 * 按钮防抖 Hook - Vue 组合式函数
 * @param fn 点击时执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns [是否正在防抖, 触发函数]
 */
export function useDebounce<F extends (...args: unknown[]) => void>(
  fn: F,
  delay = 500
): [() => boolean, () => void] {
  let locked = false;

  const trigger = (): void => {
    if (locked) return;
    locked = true;
    fn();
    setTimeout(() => {
      locked = false;
    }, delay);
  };

  const isActive = (): boolean => locked;

  return [isActive, trigger];
}
