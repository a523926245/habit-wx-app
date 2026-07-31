<!-- 兑换券使用 - 选择商品使用兑换券 -->
<template>
  <view class="voucher-use">
    <!-- 兑换券信息 -->
    <view class="voucher-use__header">
      <view class="voucher-use__tier" :style="{ borderColor: getTierColor(tier) }">
        <text class="voucher-use__tier-emoji">{{ getTierEmoji(tier) }}</text>
      </view>
      <text class="voucher-use__tier-name">{{ getTierName(tier) }}</text>
    </view>

    <!-- 商品列表 -->
    <scroll-view scroll-y class="voucher-use__scroll">
      <!-- 加载中 -->
      <view v-if="loading" class="voucher-use__loading">
        <view class="voucher-use__spinner" />
      </view>

      <!-- 空状态 -->
      <view v-else-if="items.length === 0" class="voucher-use__empty">
        <text class="voucher-use__empty-emoji">🎁</text>
        <text class="voucher-use__empty-title">暂无可兑换商品</text>
        <text class="voucher-use__empty-desc">该段位没有可兑换的商品</text>
      </view>

      <!-- 商品列表 -->
      <view v-else class="voucher-use__items">
        <view
          v-for="item in items"
          :key="item.id"
          class="voucher-use__card"
          @tap="handleUseVoucher(item)"
        >
          <view class="voucher-use__card-emoji">{{ item.emoji }}</view>
          <view class="voucher-use__card-info">
            <text class="voucher-use__card-name">{{ item.name }}</text>
            <text class="voucher-use__card-price">{{ item.price }} 💰</text>
          </view>
          <view class="voucher-use__card-action">
            <text class="voucher-use__card-action-text">兑换</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getShopItems } from "@/api/shop";
import { useVoucher } from "@/api/magicBox";
import { parseShopItem } from "@/models/shop";
import type { ShopItem } from "@/models/shop";
import { VOUCHER_TIER_NAMES, VOUCHER_TIER_EMOJIS } from "@/models/magicBox";
import type { GachaTier } from "@/models/magicBox";
import { getAppMessage } from "@/config/errors";

const routeQuery = ref<Record<string, string>>({});
const voucherId = ref(0);
const tier = ref(1);
const loading = ref(false);
const items = ref<ShopItem[]>([]);

onLoad((query: Record<string, string> | undefined) => {
  if (query) {
    routeQuery.value = query;
    voucherId.value = parseInt(query.voucherId || "0", 10);
    tier.value = parseInt(query.tier || "1", 10) as GachaTier;
  }
});

/** 获取档位颜色 */
function getTierColor(t: number): string {
  const colors: Record<number, string> = {
    1: "#a9a9c2",
    2: "#6ad6ff",
    3: "#f0dc2b",
    4: "#a855f7",
  };
  return colors[t] || "#a9a9c2";
}

/** 获取档位表情 */
function getTierEmoji(t: number): string {
  return VOUCHER_TIER_EMOJIS[t as GachaTier] || "🎫";
}

/** 获取档位名称 */
function getTierName(t: number): string {
  return VOUCHER_TIER_NAMES[t as GachaTier] || "兑换券";
}

/** 加载可兑换商品 */
async function loadItems() {
  loading.value = true;
  try {
    const result = await getShopItems();
    if (result.success && result.data) {
      items.value = (result.data.items || [])
        .map((item) => parseShopItem(item as unknown as Record<string, unknown>))
        .filter((item) => item.itemType === "regular" && item.status === "active");
    }
  } catch {
    uni.showToast({ title: getAppMessage("LOAD_ITEMS_FAILED"), icon: "none" });
  } finally {
    loading.value = false;
  }
}

/** 使用兑换券 */
async function handleUseVoucher(item: ShopItem) {
  uni.showModal({
    title: "使用兑换券",
    content: `确定要使用兑换券兑换「${item.name}」吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await useVoucher(voucherId.value, item.id);
          if (result.success) {
            uni.showToast({ title: "兑换成功", icon: "success" });
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            uni.showToast({ title: result.error || "兑换失败", icon: "none" });
          }
        } catch {
          uni.showToast({ title: "兑换失败", icon: "none" });
        }
      }
    },
  });
}

onMounted(() => {
  loadItems();
});
</script>

<style lang="scss" scoped>
.voucher-use {
  min-height: 100vh;
  background: $bg-primary;

  /* 头部 */
  &__header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48rpx 32rpx;
    background: linear-gradient(135deg, $bg-card, $bg-secondary);
    border-bottom: 2rpx solid $border-subtle;
  }

  &__tier {
    width: 120rpx;
    height: 120rpx;
    border-radius: 50%;
    border: 4rpx solid;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-surface;
    margin-bottom: 16rpx;
  }

  &__tier-emoji {
    font-size: 56rpx;
  }

  &__tier-name {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-primary;
  }

  /* 列表区域 */
  &__scroll {
    height: calc(100vh - 240rpx);
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

  /* 空状态 */
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 80rpx;

    &-emoji {
      font-size: 128rpx;
      margin-bottom: 32rpx;
      opacity: 0.6;
    }

    &-title {
      font-size: 36rpx;
      font-weight: bold;
      color: $text-primary;
      margin-bottom: 16rpx;
    }

    &-desc {
      font-size: 28rpx;
      color: $text-secondary;
      text-align: center;
    }
  }

  /* 商品列表 */
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
    font-size: 48rpx;
    width: 88rpx;
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 107, 53, 0.1);
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

  &__card-price {
    font-size: 24rpx;
    color: $accent-orange;
    display: block;
    margin-top: 4rpx;
  }

  &__card-action {
    padding: 12rpx 28rpx;
    background: $accent-cyan;
    border-radius: 40rpx;
    flex-shrink: 0;
  }

  &__card-action-text {
    font-size: 26rpx;
    font-weight: 600;
    color: $bg-primary;
  }
}
</style>
