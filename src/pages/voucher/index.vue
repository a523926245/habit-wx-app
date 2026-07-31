<!-- 我的兑换券 - 查看持有的兑换券 -->
<template>
  <view class="voucher">
    <scroll-view scroll-y class="voucher__scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="handleRefresh">
      <!-- 加载中 -->
      <view v-if="loading && vouchers.length === 0" class="voucher__loading">
        <view class="voucher__spinner" />
      </view>

      <!-- 空状态 -->
      <view v-else-if="vouchers.length === 0" class="voucher__empty">
        <text class="voucher__empty-emoji">🎫</text>
        <text class="voucher__empty-title">暂无兑换券</text>
        <text class="voucher__empty-desc">开启扭蛋有机会获得兑换券</text>
      </view>

      <!-- 兑换券列表 -->
      <view v-else class="voucher__items">
        <view
          v-for="v in vouchers"
          :key="v.id"
          class="voucher__card"
          :class="{ 'voucher__card--used': v.status === 'used' }"
          @tap="handleTap(v)"
        >
          <view class="voucher__card-tier" :style="{ borderColor: getTierColor(v.tier) }">
            <text class="voucher__card-tier-emoji">{{ getTierEmoji(v.tier) }}</text>
          </view>
          <view class="voucher__card-info">
            <text class="voucher__card-name">{{ getTierName(v.tier) }}</text>
            <text class="voucher__card-date">{{ formatDate(v.createdAt) }}</text>
            <text v-if="v.status === 'used'" class="voucher__card-used-text">
              已使用: {{ v.usedItemName || '未知商品' }}
            </text>
          </view>
          <view v-if="v.status === 'unused'" class="voucher__card-action">
            <text class="voucher__card-action-text">使用</text>
          </view>
          <view v-else class="voucher__card-badge">
            <text class="voucher__card-badge-text">已使用</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getVouchers } from "@/api/magicBox";
import { VOUCHER_TIER_NAMES, VOUCHER_TIER_EMOJIS } from "@/models/magicBox";
import type { GachaTier } from "@/models/magicBox";
import { getAppMessage } from "@/config/errors";

interface VoucherItem {
  id: number;
  tier: GachaTier;
  status: "unused" | "used";
  source: string;
  usedItemName?: string;
  createdAt: string;
}

const loading = ref(false);
const isRefreshing = ref(false);
const vouchers = ref<VoucherItem[]>([]);

/** 获取档位颜色 */
function getTierColor(tier: number): string {
  const colors: Record<number, string> = {
    1: "#a9a9c2",
    2: "#6ad6ff",
    3: "#f0dc2b",
    4: "#a855f7",
  };
  return colors[tier] || "#a9a9c2";
}

/** 获取档位表情 */
function getTierEmoji(tier: number): string {
  return VOUCHER_TIER_EMOJIS[tier as GachaTier] || "🎫";
}

/** 获取档位名称 */
function getTierName(tier: number): string {
  return VOUCHER_TIER_NAMES[tier as GachaTier] || "兑换券";
}

/** 格式化日期 */
function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  return dateStr.substring(0, 10);
}

/** 处理点击 */
function handleTap(v: VoucherItem) {
  if (v.status === "unused") {
    uni.navigateTo({ url: `/pages/voucher-use/index?voucherId=${v.id}&tier=${v.tier}` });
  }
}

/** 加载兑换券列表 */
async function loadVouchers() {
  loading.value = true;
  try {
    const result = await getVouchers();
    if (result.success && result.data) {
      vouchers.value = (result.data.vouchers || []) as VoucherItem[];
    }
  } catch {
    uni.showToast({ title: getAppMessage("LOAD_VOUCHERS_FAILED"), icon: "none" });
  } finally {
    loading.value = false;
  }
}

/** 下拉刷新 */
async function handleRefresh() {
  isRefreshing.value = true;
  await loadVouchers();
  isRefreshing.value = false;
}

onMounted(() => {
  loadVouchers();
});
</script>

<style lang="scss" scoped>
.voucher {
  min-height: 100vh;
  background: $bg-primary;

  &__scroll {
    height: 100vh;
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
    padding: 160rpx 80rpx;

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

  /* 兑换券列表 */
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

  &__card--used {
    opacity: 0.6;
  }

  &__card-tier {
    width: 88rpx;
    height: 88rpx;
    border-radius: 50%;
    border: 3rpx solid;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: $bg-surface;
  }

  &__card-tier-emoji {
    font-size: 40rpx;
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

  &__card-date {
    font-size: 22rpx;
    color: $text-secondary;
    display: block;
    margin-top: 4rpx;
  }

  &__card-used-text {
    font-size: 22rpx;
    color: $text-disabled;
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

  &__card-badge {
    padding: 8rpx 20rpx;
    background: $border-subtle;
    border-radius: 20rpx;
    flex-shrink: 0;
  }

  &__card-badge-text {
    font-size: 22rpx;
    color: $text-secondary;
  }
}
</style>
