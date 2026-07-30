/**
 * Toast 提示封装
 * 对应 Flutter 端的 AppToast
 */

type ToastType = "success" | "error" | "warning" | "info";

/**
 * 显示顶部提示
 */
export function showToast(
  message: string,
  type: ToastType = "info",
  duration: number = 2000
): void {
  const iconMap: Record<ToastType, string> = {
    success: "success",
    error: "error",
    warning: "none",
    info: "none",
  };

  const bgColorMap: Record<ToastType, string> = {
    success: "rgba(0, 184, 148, 0.9)",
    error: "rgba(255, 113, 108, 0.9)",
    warning: "rgba(255, 107, 53, 0.9)",
    info: "rgba(106, 214, 255, 0.9)",
  };

  // 使用 uni.showToast
  if (type === "success") {
    uni.showToast({ title: message, icon: "success", duration });
  } else if (type === "error") {
    uni.showToast({ title: message, icon: "error", duration });
  } else {
    // 自定义样式：用黑色半透明背景
    uni.showToast({
      title: message,
      icon: "none",
      duration,
      mask: true,
    });
  }
}

/**
 * 显示加载中提示
 */
export function showLoading(title = "加载中..."): void {
  uni.showLoading({ title, mask: true });
}

/**
 * 隐藏加载中提示
 */
export function hideLoading(): void {
  uni.hideLoading();
}
