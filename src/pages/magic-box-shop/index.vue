<!-- 扭蛋商城 - 购买扭蛋 -->
<template>
  <view class="gacha-shop">
    <scroll-view scroll-y class="gacha-shop__scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="handleRefresh">
      <!-- 余额显示 -->
      <view class="gacha-shop__balance">
        <text class="gacha-shop__balance-label">当前金币</text>
        <text class="gacha-shop__balance-value">💰 {{ userCoins }}</text>
      </view>

      <!-- 加载中 -->
      <view v-if="loading && items.length === 0" class="gacha-shop__loading">
        <view class="gacha-shop__spinner" />
      </view>

      <!-- 扭蛋列表 -->
      <view v-else class="gacha-shop__items">
        <view
          v-for="item in items"
          :key="item.tier"
          class="gacha-shop__card"
        >
          <view class="gacha-shop__card-emoji">{{ item.emoji }}</view>
          <view class="gacha-shop__card-info">
            <text class="gacha-shop__card-name">{{ item.name }}</text>
            <text class="gacha-shop__card-range">可开出 {{ item.coinMin }}~{{ item.coinMax }} 金币</text>
          </view>
          <view class="gacha-shop__card-price">
            <text class="gacha-shop__card-price-text">{{ item.shopPrice }} 💰</text>
          </view>
          <view
            class="gacha-shop__card-btn"
            :class="{ 'gacha-shop__card-btn--disabled': !item.canAfford }"
            @tap="buyBox(item)"
          >
            <text class="gacha-shop__card-btn-text">购买</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getGachaShop, buyMagicBox } from "@/api/magicBox";
import { getAppMessage } from "@/config/errors";

interface GachaShopItem {
  tier: number;
  name: string;
  emoji: string;
  shopPrice: number;
  coinMin: number;
  coinMax: number;
  canAfford: boolean;
}

const loading = ref(false);
const isRefreshing = ref(false);
const items = ref<GachaShopItem[]>([]);
const userCoins = ref(0);

/** 加载扭蛋商城 */
async function loadShop() {
  loading.value = true;
  try {
    const result = await getGachaShop();
    if (result.success && result.data) {
      items.value = result.data.items || [];
      userCoins.value = result.data.userCoins || 0;
    }
  } catch {
    uni.showToast({ title: getAppMessage("BUY_BOX_FAILED"), icon: "none" });
  } finally {
    loading.value = false;
  }
}

/** 购买扭蛋 */
async function buyBox(item: GachaShopItem) {
  if (!item.canAfford) {
    uni.showToast({ title: "金币不足", icon: "none" });
    return;
  }

  uni.showModal({
    title: "购买扭蛋",
    content: `确定要购买「${item.name}」吗？需要 ${item.shopPrice} 金币`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await buyMagicBox(item.tier);
          if (result.success) {
            uni.showToast({ title: "购买成功", icon: "success" });
            await loadShop();
          } else {
            uni.showToast({ title: result.error || "购买失败", icon: "none" });
          }
        } catch {
          uni.showToast({ title: getAppMessage("BUY_BOX_FAILED"), icon: "none" });
        }
      }
    },
  });
}

/** 下拉刷新 */
async function handleRefresh() {
  isRefreshing.value = true;
  await loadShop();
  isRefreshing.value = false;
}

onMounted(() => {
  loadShop();
});
</script>

<style lang="scss" scoped>
.gacha-shop {
  min-height: 100vh;
  background: $bg-primary;

  &__scroll {
    height: 100vh;
  }

  /* 余额显示 */
  &__balance {
    text-align: center;
    padding: 32rpx;
    background: linear-gradient(135deg, $bg-card, $bg-secondary);
    border-bottom: 2rpx solid $border-subtle;
  }

  &__balance-label {
    font-size: 24rpx;
    color: $text-secondary;
    display: block;
    margin-bottom: 8rpx;
  }

  &__balance-value {
    font-size: 48rpx;
    font-weight: bold;
    color: $accent-orange;
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

  /* 扭蛋列表 */
  &__items {
    padding: 32rpx;
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

  &__card-emoji {
    font-size: 56rpx;
    width: 96rpx;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(168, 85, 247, 0.1);
    border-radius: 24rpx;
    flex-shrink: 0;
  }

  &__card-info {
    flex: 1;
    min-width: 0;
    margin-left: 24rpx;
  }

  &__card-name {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-primary;
    display: block;
  }

  &__card-range {
    font-size: 22rpx;
    color: $text-secondary;
    display: block;
    margin-top: 4rpx;
  }

  &__card-price {
    margin-right: 16rpx;
    flex-shrink: 0;
  }

  &__card-price-text {
    font-size: 24rpx;
    font-weight: 600;
    color: $accent-orange;
  }

  &__card-btn {
    padding: 12rpx 28rpx;
    background: $accent-purple;
    border-radius: 40rpx;
    flex-shrink: 0;
  }

  &__card-btn--disabled {
    background: $border-subtle;
  }

  &__card-btn-text {
    font-size: 26rpx;
    font-weight: 600;
    color: #fff;
  }
}
</style>
