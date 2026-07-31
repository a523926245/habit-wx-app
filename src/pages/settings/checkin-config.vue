<!-- 签到配置 - 设置签到里程碑奖励 -->
<template>
  <view class="checkin-config">
    <scroll-view scroll-y class="checkin-config__scroll">
      <!-- 加载中 -->
      <view v-if="loading" class="checkin-config__loading">
        <view class="checkin-config__spinner" />
      </view>

      <view v-else class="checkin-config__content">
        <!-- 配置说明 -->
        <view class="checkin-config__desc">
          <text class="checkin-config__desc-text">设置每月签到达到一定比例时的金币奖励</text>
        </view>

        <!-- 里程碑列表 -->
        <view class="checkin-config__items">
          <view
            v-for="(item, index) in config"
            :key="index"
            class="checkin-config__card"
          >
            <view class="checkin-config__card-header">
              <text class="checkin-config__card-title">{{ item.emoji }} {{ item.title }}</text>
              <text class="checkin-config__card-percent">{{ Math.round(item.percent * 100) }}%</text>
            </view>
            <view class="checkin-config__card-input">
              <text class="checkin-config__card-label">金币奖励</text>
              <input
                v-model="item.coins"
                class="checkin-config__input"
                type="number"
                placeholder="金币数"
              />
            </view>
          </view>
        </view>

        <!-- 恢复默认 -->
        <view class="checkin-config__reset" @tap="resetConfig">
          <text class="checkin-config__reset-text">恢复默认配置</text>
        </view>
      </view>
    </scroll-view>

    <!-- 保存按钮 -->
    <view class="checkin-config__footer">
      <button class="checkin-config__save-btn" :disabled="saving" @tap="saveConfig">
        <text>{{ saving ? '保存中...' : '保存配置' }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getCheckinConfig, updateCheckinConfig, resetCheckinConfig } from "@/api/checkin";
import { getAppMessage } from "@/config/errors";

interface ConfigItem {
  percent: number;
  coins: number;
  title: string;
  emoji: string;
  sortOrder: number;
}

const loading = ref(false);
const saving = ref(false);
const config = ref<ConfigItem[]>([]);

/** 加载配置 */
async function loadConfig() {
  loading.value = true;
  try {
    const result = await getCheckinConfig();
    if (result.success && result.data) {
      config.value = result.data.config || [];
    }
  } catch {
    uni.showToast({ title: getAppMessage("LOAD_STATUS_FAILED"), icon: "none" });
  } finally {
    loading.value = false;
  }
}

/** 保存配置 */
async function saveConfig() {
  saving.value = true;
  try {
    const result = await updateCheckinConfig(config.value);
    if (result.success) {
      uni.showToast({ title: "保存成功", icon: "success" });
    } else {
      uni.showToast({ title: result.error || "保存失败", icon: "none" });
    }
  } catch {
    uni.showToast({ title: getAppMessage("UPDATE_FAILED"), icon: "none" });
  } finally {
    saving.value = false;
  }
}

/** 恢复默认配置 */
function resetConfig() {
  uni.showModal({
    title: "恢复默认",
    content: "确定要恢复默认签到配置吗？",
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await resetCheckinConfig();
          if (result.success) {
            uni.showToast({ title: "已恢复默认", icon: "success" });
            await loadConfig();
          } else {
            uni.showToast({ title: result.error || "操作失败", icon: "none" });
          }
        } catch {
          uni.showToast({ title: getAppMessage("UPDATE_FAILED"), icon: "none" });
        }
      }
    },
  });
}

onMounted(() => {
  loadConfig();
});
</script>

<style lang="scss" scoped>
.checkin-config {
  min-height: 100vh;
  background: $bg-primary;
  display: flex;
  flex-direction: column;

  &__scroll {
    flex: 1;
    height: calc(100vh - 140rpx);
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 80rpx 0;
  }

  &__spinner {
    width: 64rpx;
    height: 64rpx;
    border: 6rpx solid $border-subtle;
    border-top-color: $accent-cyan;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  &__content {
    padding: 32rpx;
  }

  &__desc {
    padding: 24rpx;
    background: $bg-card;
    border-radius: 20rpx;
    border: 2rpx solid $border-subtle;
    margin-bottom: 32rpx;
  }

  &__desc-text {
    font-size: 26rpx;
    color: $text-secondary;
  }

  /* 配置卡片 */
  &__items {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
    margin-bottom: 32rpx;
  }

  &__card {
    padding: 28rpx;
    background: $bg-card;
    border-radius: 32rpx;
    border: 2rpx solid $border-subtle;
  }

  &__card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }

  &__card-title {
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
  }

  &__card-percent {
    font-size: 24rpx;
    color: $accent-cyan;
    font-weight: 600;
  }

  &__card-input {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  &__card-label {
    font-size: 26rpx;
    color: $text-secondary;
  }

  &__input {
    flex: 1;
    height: 72rpx;
    padding: 0 20rpx;
    background: $bg-surface;
    border-radius: 16rpx;
    border: 2rpx solid $border-subtle;
    font-size: 28rpx;
    color: $text-primary;
    text-align: center;
  }

  /* 恢复默认 */
  &__reset {
    padding: 24rpx;
    text-align: center;
  }

  &__reset-text {
    font-size: 28rpx;
    color: $accent-orange;
  }

  /* 底部保存 */
  &__footer {
    padding: 32rpx;
  }

  &__save-btn {
    width: 100%;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: bold;
    color: $bg-primary;
    background: linear-gradient(135deg, $accent-cyan, #8be4ff);
    border-radius: 28rpx;
    border: none;
  }

  &__save-btn:disabled {
    opacity: 0.6;
  }
}
</style>
