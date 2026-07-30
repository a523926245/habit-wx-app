/**
 * uni.request 封装
 * 对应 Flutter 端的 ApiClient (Dio)
 *
 * 功能:
 * - 自动注入 Authorization Bearer token
 * - 统一解析 {code, msg, data} 响应格式
 * - 401 自动清除登录态 + 跳转登录
 * - 统一错误提示
 */
import {
  API_BASE_URL,
  ErrorCode,
  ErrorMessages,
  HTTP_OK,
  NetworkError,
  NetworkMessages,
  NETWORK_ERROR_DEFAULT,
  PARSE_ERROR_MESSAGE,
  UPLOAD_ERROR_MESSAGE,
} from "@/config/errors";
import * as storage from "@/utils/storage";
import { showToast } from "@/utils/toast";

// ==================== 类型定义 ====================

export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export interface ApiResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: unknown;
  header?: Record<string, string>;
  filePath?: string;
  name?: string;
}

/** uni.request fail 回调参数 */
interface RequestFailError {
  errMsg: string;
}

// ==================== 请求封装 ====================

function request<T = unknown>(options: RequestOptions): Promise<ApiResult<T>> {
  const { url, method = "GET", data, filePath, name } = options;

  return new Promise((resolve) => {
    const fullUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    const token = storage.getStorageSync<string>(storage.STORAGE_KEYS.AUTH_TOKEN) || "";

    const header: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.header,
    };
    if (token) {
      header["Authorization"] = `Bearer ${token}`;
    }

    if (filePath && name) {
      // 文件上传走 uni.uploadFile
      uni.uploadFile({
        url: fullUrl,
        filePath,
        name,
        header,
        formData: data as Record<string, unknown>,
        success: (res: unknown) => {
          const r = res as { data: string; statusCode: number; errMsg: string };
          // 检查 r.data 是否存在且非空，防止空数据导致的崩溃
          if (!r.data || r.data.trim() === "") {
            resolve({ success: false, error: "服务器返回空数据" });
            return;
          }
          try {
            const parsedData = JSON.parse(r.data);
            // 确保解析后的对象有必要的结构
            if (!parsedData || typeof parsedData.code !== "number") {
              resolve({ success: false, error: "响应格式错误" });
              return;
            }
            const body: ApiResponse<T> = parsedData;
            if (body.code === ErrorCode.SUCCESS) {
              resolve({ success: true, data: body.data });
            } else if (body.code === ErrorCode.UNAUTHORIZED) {
              handleUnauthorized();
              resolve({ success: false, error: body.msg || ErrorMessages[ErrorCode.UNAUTHORIZED], code: body.code });
            } else {
              resolve({ success: false, error: body.msg || ErrorMessages[ErrorCode.VALIDATION_ERROR], code: body.code });
            }
          } catch (e) {
            resolve({ success: false, error: PARSE_ERROR_MESSAGE });
          }
        },
        fail: () => {
          resolve({ success: false, error: UPLOAD_ERROR_MESSAGE });
        },
      });
      return;
    }

    uni.request({
      url: fullUrl,
      method,
      data: data as Record<string, unknown>,
      header,
      success: (res: unknown) => {
        const r = res as { statusCode: number; data: unknown };
        if (r.statusCode !== HTTP_OK) {
          resolve({ success: false, error: `HTTP ${r.statusCode}`, code: r.statusCode });
          return;
        }

        // 检查 r.data 是否存在且为有效对象
        if (!r.data || typeof r.data !== "object") {
          resolve({ success: false, error: "响应数据格式无效" });
          return;
        }

        const body = r.data as ApiResponse<T>;

        // 确保 body.code 是有效的数字
        if (typeof body.code !== "number") {
          resolve({ success: false, error: "响应缺少必要字段" });
          return;
        }

        if (body.code === ErrorCode.SUCCESS) {
          resolve({ success: true, data: body.data });
        } else if (body.code === ErrorCode.UNAUTHORIZED) {
          handleUnauthorized();
          resolve({ success: false, error: body.msg || ErrorMessages[ErrorCode.UNAUTHORIZED], code: body.code });
        } else if (body.code === ErrorCode.FORBIDDEN) {
          resolve({ success: false, error: body.msg || ErrorMessages[ErrorCode.FORBIDDEN], code: body.code });
        } else {
          resolve({ success: false, error: body.msg || ErrorMessages[ErrorCode.VALIDATION_ERROR], code: body.code });
        }
      },
      fail: (err: RequestFailError) => {
        let msg = NETWORK_ERROR_DEFAULT;
        if (err.errMsg?.includes(NetworkError.TIMEOUT)) msg = NetworkMessages[NetworkError.TIMEOUT];
        else if (err.errMsg?.includes(NetworkError.FAIL)) msg = NetworkMessages[NetworkError.FAIL];
        showToast(msg, "error");
        resolve({ success: false, error: msg });
      },
    });
  });
}

/**
 * 401 未授权处理
 */
function handleUnauthorized() {
  storage.removeStorageSync(storage.STORAGE_KEYS.AUTH_TOKEN);
  storage.removeStorageSync(storage.STORAGE_KEYS.CURRENT_USER);

  try {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const currentRoute = currentPage?.route || "";
    if (!currentRoute.includes("login")) {
      uni.reLaunch({ url: "/pages/login/login" });
    }
  } catch (e) {
    // ignore
  }
}

// ==================== 快捷方法 ====================

const http = {
  get<T = unknown>(url: string, data?: Record<string, unknown>): Promise<ApiResult<T>> {
    return request<T>({ url, method: "GET", data });
  },
  post<T = unknown>(url: string, data?: unknown): Promise<ApiResult<T>> {
    return request<T>({ url, method: "POST", data });
  },
  put<T = unknown>(url: string, data?: unknown): Promise<ApiResult<T>> {
    return request<T>({ url, method: "PUT", data });
  },
  delete<T = unknown>(url: string, data?: unknown): Promise<ApiResult<T>> {
    return request<T>({ url, method: "DELETE", data });
  },
  upload<T = unknown>(
    url: string,
    filePath: string,
    name = "file",
    formData?: Record<string, unknown>
  ): Promise<ApiResult<T>> {
    return request<T>({ url, method: "POST", filePath, name, data: formData });
  },
};

export default http;
