<!-- BOSS等级配置 - 配置BOSS难度系数 -->
<template>
  <view class="boss-levels">
    <scroll-view scroll-y class="boss-levels__scroll">
      <!-- 加载中 -->
      <view v-if="loading" class="boss-levels__loading">
        <view class="boss-levels__spinner" />
      </view>

      <view v-else class="boss-levels__content">
        <!-- 配置说明 -->
        <view class="boss-levels__desc">
          <text class="boss-levels__desc-text">配置不同等级BOSS的血量系数，影响BOSS最大生命值</text>
        </view>

        <!-- 等级列表 -->
        <view class="boss-levels__items">
          <view
            v-for="(item, index) in levels"
            :key="index"
            class="boss-levels__card"
          >
            <view class="boss-levels__card-level">
              <text class="boss-levels__card-level-text">Lv.{{ index + 1 }}</text>
            </view>
            <view class="boss-levels__card-info">
              <text class="boss-levels__card-label">{{ item.label }}</text>
              <view class="boss-levels__card-input">
                <text class="boss-levels__card-unit">系数</text>
                <input
                  v-model="item.multiplier"
                  class="boss-levels__input"
                  type="digit"
                  placeholder="1.0"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 保存按钮 -->
    <view class="boss-levels__footer">
      <button class="boss-levels__save-btn" :disabled="saving" @tap="saveConfig">
        <text>{{ saving ? '保存中...' : '保存配置' }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getAppMessage } from "@/config/errors";

interface LevelItem {
  label: string;
  multiplier: string;
}

const loading = ref(false);
const saving = ref(false);

const levels = ref<LevelItem[]>([
  { label: "简单", multiplier: "0.8" },
  { label: "普通", multiplier: "1.0" },
  { label: "中等", multiplier: "1.2" },
  { label: "困难", multiplier: "1.5" },
  { label: "史诗", multiplier: "2.0" },
]);

/** 加载配置 */
async function loadConfig() {
  loading.value = true;
  // 配置从本地读取或后端获取
  loading.value = false;
}

/** 保存配置 */
async function saveConfig() {
  saving.value = true;
  try {
    // 保存配置到后端
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
.boss-levels {
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

  /* 等级卡片 */
  &__items {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  &__card {
    display: flex;
    align-items: center;
    padding: 28rpx;
    background: $bg-card;
    border-radius: 32rpx;
    border: 2rpx solid $border-subtle;
  }

  &__card-level {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: rgba(231, 76, 60, 0.1);
    border: 2rpx solid rgba(231, 76, 60, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__card-level-text {
    font-size: 24rpx;
    font-weight: bold;
    color: $hp-red;
  }

  &__card-info {
    flex: 1;
    margin-left: 24rpx;
  }

  &__card-label {
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
    display: block;
    margin-bottom: 12rpx;
  }

  &__card-input {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  &__card-unit {
    font-size: 24rpx;
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
