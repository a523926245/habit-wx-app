/**
 * 图片工具模块
 * 封装图片选择和上传功能，支持多场景复用
 */

import { getStorageSync } from "@/utils/storage";
import { STORAGE_KEYS } from "@/utils/storage";

/** 图片选择配置 */
export interface ChooseImageOptions {
  /** 最多可选数量，默认 1 */
  count?: number;
  /** 尺寸类型：compressed 压缩原图，original 原图 */
  sizeType?: Array<"compressed" | "original">;
  /** 来源类型：album 相册，camera 拍照 */
  sourceType?: Array<"album" | "camera">;
}

/** 上传结果 */
export interface UploadResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 选择图片
 * @param options 配置项
 * @returns 临时文件路径，取消返回 null
 */
export function chooseImage(
  options?: ChooseImageOptions
): Promise<string | null> {
  return new Promise((resolve) => {
    uni.chooseImage({
      count: options?.count ?? 1,
      sizeType: options?.sizeType ?? ["compressed"],
      sourceType: options?.sourceType ?? ["album", "camera"],
      success: (res) => {
        resolve(res.tempFilePaths[0] ?? null);
      },
      fail: () => {
        resolve(null);
      },
    });
  });
}

/**
 * 上传图片到服务器
 * @param url 上传接口地址
 * @param filePath 本地临时文件路径
 * @param name 文件字段名，默认 "file"
 * @param formData 额外表单数据
 * @returns 上传结果
 */
export async function uploadImage<T = unknown>(
  url: string,
  filePath: string,
  name = "file",
  formData?: Record<string, unknown>
): Promise<UploadResult<T>> {
  return new Promise((resolve) => {
    // 从 storage 读取 token（存储时已 JSON.stringify，getStorageSync 会自动解析）
    const token = getStorageSync<string>(STORAGE_KEYS.AUTH_TOKEN) || "";

    uni.uploadFile({
      url: url.startsWith("http") ? url : `${url}`,
      filePath,
      name,
      formData: formData as Record<string, string>,
      header: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      success: (res) => {
        try {
          const body = JSON.parse(res.data as string) as {
            code: number;
            msg: string;
            data: T;
          };
          if (body.code === 200) {
            resolve({ success: true, data: body.data });
          } else {
            resolve({ success: false, error: body.msg });
          }
        } catch {
          resolve({ success: false, error: "解析响应失败" });
        }
      },
      fail: () => {
        resolve({ success: false, error: "上传失败" });
      },
    });
  });
}

/**
 * 选择并上传图片（组合流程）
 * @param uploadUrl 上传接口地址
 * @param options 选择配置
 * @returns 上传结果
 */
export async function chooseAndUpload<T = unknown>(
  uploadUrl: string,
  options?: ChooseImageOptions
): Promise<UploadResult<T>> {
  const filePath = await chooseImage(options);
  if (!filePath) {
    return { success: false, error: "未选择图片" };
  }
  return uploadImage<T>(uploadUrl, filePath);
}
