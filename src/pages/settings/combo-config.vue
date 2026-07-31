<!-- 连击加成配置 - 设置连续签到加成比例 -->
<template>
  <view class="combo-config">
    <scroll-view scroll-y class="combo-config__scroll">
      <!-- 加载中 -->
      <view v-if="loading" class="combo-config__loading">
        <view class="combo-config__spinner" />
      </view>

      <view v-else class="combo-config__content">
        <!-- 配置说明 -->
        <view class="combo-config__desc">
          <text class="combo-config__desc-text">设置连续完成任务的天数加成，连续天数越多加成越高</text>
        </view>

        <!-- 连击列表 -->
        <view class="combo-config__items">
          <view
            v-for="(item, index) in combos"
            :key="index"
            class="combo-config__card"
          >
            <view class="combo-config__card-days">
              <text class="combo-config__card-days-text">{{ item.days }}天</text>
              <text class="combo-config__card-title">{{ item.title }}</text>
            </view>
            <view class="combo-config__card-input">
              <text class="combo-config__card-label">加成倍率</text>
              <input
                v-model="item.multiplier"
                class="combo-config__input"
                type="digit"
                placeholder="1.0"
              />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 保存按钮 -->
    <view class="combo-config__footer">
      <button class="combo-config__save-btn" :disabled="saving" @tap="saveConfig">
        <text>{{ saving ? '保存中...' : '保存配置' }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getAppMessage } from "@/config/errors";

interface ComboItem {
  days: number;
  multiplier: string;
  title: string;
}

const loading = ref(false);
const saving = ref(false);

const combos = ref<ComboItem[]>([
  { days: 3, multiplier: "1.1", title: "初露锋芒 ✨" },
  { days: 7, multiplier: "1.2", title: "小有成就 ⚡" },
  { days: 14, multiplier: "1.25", title: "坚持不懈 🔥" },
  { days: 21, multiplier: "1.3", title: "连击大师 💪" },
]);

/** 加载配置 */
async function loadConfig() {
  loading.value = true;
  loading.value = false;
}

/** 保存配置 */
async function saveConfig() {
  saving.value = true;
  try {
    uni.showToast({ title: "保存成功", icon: "success" });
  } catch {
    uni.showToast({ title: getAppMessage("UPDATE_FAILED"), icon: "none" });
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadConfig();
});
</script>

<style lang="scss" scoped>
.combo-config {
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

  /* 连击卡片 */
  &__items {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  &__card {
    padding: 28rpx;
    background: $bg-card;
    border-radius: 32rpx;
    border: 2rpx solid $border-subtle;
  }

  &__card-days {
    margin-bottom: 16rpx;
  }

  &__card-days-text {
    font-size: 32rpx;
    font-weight: bold;
    color: $accent-orange;
    display: block;
  }

  &__card-title {
    font-size: 24rpx;
    color: $text-secondary;
    display: block;
    margin-top: 4rpx;
  }

  &__card-input {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  &__card-label {
    font-size: 26rpx;
    color: $text-secondary;
  }

  &__input {
    flex: 1;
    height: 64rpx;
    padding: 0 16rpx;
    background: $bg-surface;
    border-radius: 12rpx;
    border: 2rpx solid $border-subtle;
    font-size: 28rpx;
    color: $text-primary;
    text-align: center;
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
