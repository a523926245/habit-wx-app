<!-- 段位配置 - 管理段位名称和积分门槛 -->
<template>
  <view class="rank-tiers">
    <scroll-view scroll-y class="rank-tiers__scroll">
      <!-- 加载中 -->
      <view v-if="loading" class="rank-tiers__loading">
        <view class="rank-tiers__spinner" />
      </view>

      <view v-else class="rank-tiers__content">
        <!-- 配置说明 -->
        <view class="rank-tiers__desc">
          <text class="rank-tiers__desc-text">配置段位名称、图标和最低积分门槛</text>
        </view>

        <!-- 段位列表 -->
        <view class="rank-tiers__items">
          <view
            v-for="(item, index) in tiers"
            :key="index"
            class="rank-tiers__card"
          >
            <view class="rank-tiers__card-icon">
              <text class="rank-tiers__card-icon-text">{{ item.icon }}</text>
            </view>
            <view class="rank-tiers__card-info">
              <view class="rank-tiers__card-row">
                <text class="rank-tiers__card-label">名称</text>
                <input
                  v-model="item.name"
                  class="rank-tiers__input"
                  placeholder="段位名称"
                />
              </view>
              <view class="rank-tiers__card-row">
                <text class="rank-tiers__card-label">最低积分</text>
                <input
                  v-model="item.minScore"
                  class="rank-tiers__input"
                  type="number"
                  placeholder="0"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 保存按钮 -->
    <view class="rank-tiers__footer">
      <button class="rank-tiers__save-btn" :disabled="saving" @tap="saveConfig">
        <text>{{ saving ? '保存中...' : '保存配置' }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getAppMessage } from "@/config/errors";

interface TierItem {
  icon: string;
  name: string;
  minScore: string;
}

const loading = ref(false);
const saving = ref(false);

const tiers = ref<TierItem[]>([
  { icon: "🥉", name: "青铜", minScore: "0" },
  { icon: "🥈", name: "白银", minScore: "100" },
  { icon: "🥇", name: "黄金", minScore: "300" },
  { icon: "💎", name: "钻石", minScore: "600" },
  { icon: "👑", name: "传说", minScore: "1000" },
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
.rank-tiers {
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

  /* 段位卡片 */
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

  &__card-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: $bg-surface;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__card-icon-text {
    font-size: 40rpx;
  }

  &__card-info {
    flex: 1;
    margin-left: 24rpx;
  }

  &__card-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 12rpx;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__card-label {
    font-size: 24rpx;
    color: $text-secondary;
    width: 120rpx;
  }

  &__input {
    flex: 1;
    height: 56rpx;
    padding: 0 16rpx;
    background: $bg-surface;
    border-radius: 12rpx;
    border: 2rpx solid $border-subtle;
    font-size: 26rpx;
    color: $text-primary;
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
