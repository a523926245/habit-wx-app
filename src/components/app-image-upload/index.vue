<!-- 通用图片上传组件 -->
<template>
  <view class="image-upload" @tap="handleTap">
    <!-- 图片预览 -->
    <image
      v-if="modelValue"
      :src="modelValue"
      class="image-upload__preview"
      mode="aspectFill"
    />
    <!-- 占位符 -->
    <view v-else class="image-upload__placeholder">
      <text class="image-upload__icon">{{ placeholderIcon }}</text>
      <text v-if="placeholderText" class="image-upload__text">
        {{ placeholderText }}
      </text>
    </view>
    <!-- 加载状态 -->
    <view v-if="uploading" class="image-upload__loading">
      <text class="image-upload__loading-text">...</text>
    </view>
    <!-- 相机角标 -->
    <view v-if="modelValue && showBadge" class="image-upload__badge">
      <text class="image-upload__badge-icon">📷</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { chooseImage, uploadImage } from "@/utils/image";
import { showToast } from "@/utils/toast";

/** 组件 Props */
export interface ImageUploadProps {
  /** 当前图片 URL（v-model 绑定） */
  modelValue?: string;
  /** 上传接口地址 */
  uploadUrl: string;
  /** 上传文件字段名 */
  fileName?: string;
  /** 组件尺寸（rpx） */
  size?: number;
  /** 形状：circle 圆形 / square 方形 */
  shape?: "circle" | "square";
  /** 占位图标 */
  placeholderIcon?: string;
  /** 占位文字 */
  placeholderText?: string;
  /** 是否显示相机角标 */
  showBadge?: boolean;
  /** 额外表单数据 */
  formData?: Record<string, unknown>;
}

const props = withDefaults(defineProps<ImageUploadProps>(), {
  modelValue: "",
  fileName: "avatar",
  size: 120,
  shape: "circle",
  placeholderIcon: "📷",
  placeholderText: "",
  showBadge: true,
  formData: undefined,
});

/** 组件 Emits */
const emit = defineEmits<{
  /** 更新图片 URL（v-model） */
  "update:modelValue": [url: string];
  /** 上传成功 */
  "upload-success": [url: string];
  /** 上传失败 */
  "upload-error": [error: string];
}>();

const uploading = ref(false);

/** 点击触发选择 */
async function handleTap() {
  if (uploading.value) return;

  const filePath = await chooseImage();
  if (!filePath) return;

  uploading.value = true;
  try {
    const result = await uploadImage<{ avatar: string }>(
      props.uploadUrl,
      filePath,
      props.fileName,
      props.formData
    );

    if (result.success && result.data) {
      const url = result.data.avatar;
      emit("update:modelValue", url);
      emit("upload-success", url);
      showToast("上传成功", "success");
    } else {
      emit("upload-error", result.error || "上传失败");
      showToast(result.error || "上传失败", "error");
    }
  } catch {
    emit("upload-error", "上传异常");
    showToast("上传异常", "error");
  } finally {
    uploading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.image-upload {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: v-bind("`${size}rpx`");
  height: v-bind("`${size}rpx`");
  background: rgba($accent-cyan, 0.1);
  border: 2rpx solid rgba($accent-cyan, 0.3);
  border-radius: v-bind("shape === 'circle' ? '50%' : '16rpx'");
  overflow: hidden;

  &:active {
    opacity: 0.8;
  }
}

.image-upload__preview {
  width: 100%;
  height: 100%;
}

.image-upload__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-upload__icon {
  font-size: v-bind("`${size / 3}rpx`");
  opacity: 0.6;
}

.image-upload__text {
  font-size: 20rpx;
  color: $text-secondary;
  margin-top: 4rpx;
}

.image-upload__loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
}

.image-upload__loading-text {
  font-size: 32rpx;
  color: #fff;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.image-upload__badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-card;
  border-radius: 50%;
  border: 2rpx solid rgba($accent-cyan, 0.5);
}

.image-upload__badge-icon {
  font-size: 20rpx;
}
</style>
