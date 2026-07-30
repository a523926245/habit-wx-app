<!-- 孩子商城页面 -->
<template>
  <view class="child-shop-page">
    <scroll-view scroll-y class="page-scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh">
      <!-- 顶部导航栏 -->
      <view class="shop-header">
        <text class="shop-header__title">商城</text>
        <view class="shop-header__coin-pill" @tap="goCoins">
          <text class="shop-header__coin-text">💰 {{ coins }}</text>
        </view>
      </view>

      <!-- 加载中 -->
      <view v-if="isLoading" class="loading-wrap">
        <view class="loading-spinner" />
      </view>

      <!-- 空状态 -->
      <empty-state
        v-else-if="shopItems.length === 0"
        emoji="🎁"
        title="商城还没有奖品"
        description="家长正在准备中..."
      />

      <!-- 商品网格 -->
      <view v-else class="shop-grid">
        <view
          v-for="item in shopItems"
          :key="item.id"
          class="shop-item"
        >
          <!-- 商品卡片 -->
          <view class="shop-item__card">
            <!-- 表情图标 -->
            <text class="shop-item__emoji">{{ item.emoji }}</text>

            <!-- 名称 -->
            <text class="shop-item__name">{{ item.name }}</text>

            <!-- 段位/扭蛋徽章 -->
            <view class="shop-item__tag">
              <text class="shop-item__tag-text">{{ tagText(item) }}</text>
            </view>

            <!-- 价格 -->
            <view class="shop-item__price">
              <text class="shop-item__price-text">{{ item.price }} 💰</text>
            </view>

            <!-- 兑换按钮 -->
            <button
              class="shop-item__redeem-btn"
              :class="{ 'is-disabled': item.price > coins }"
              :disabled="item.price > coins"
              @tap="onRedeem(item)"
            >
              {{ item.itemType === 'gacha' ? '购买' : '兑换' }}
            </button>
          </view>
        </view>
      </view>

      <!-- 占位，防止内容被固定底部导航遮挡 -->
    </scroll-view>

    <!-- 自定义底部导航栏 -->
    <custom-tab-bar />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import CustomTabBar from "@/custom-tab-bar/index.vue";
import { useAuthStore } from "@/stores/auth";
import { useShopStore } from "@/stores/shop";
import { useMagicBoxStore } from "@/stores/magicBox";
import { showToast } from "@/utils/toast";
import EmptyState from "@/components/empty-state/empty-state.vue";

const authStore = useAuthStore();
const shopStore = useShopStore();
const magicBoxStore = useMagicBoxStore();

const isRefreshing = ref(false);

const coins = computed(() => authStore.user.value?.coins ?? 0);
const shopItems = computed(() => shopStore.shopItems.value);
const isLoading = computed(() => shopStore.isLoading.value);

// 标签文本
function tagText(item: { itemType: string; gachaTier?: number; tier: string }): string {
  if (item.itemType === "gacha") {
    const names = ["青铜", "白银", "黄金", "传说"];
    return names[item.gachaTier ?? 1 - 1] || "青铜";
  }
  const names: Record<string, string> = {
    bronze: "青铜",
    silver: "白银",
    gold: "黄金",
    legendary: "传说",
  };
  return names[item.tier] || "青铜";
}

// 兑换
async function onRedeem(item: { id: number; itemType: string; price: number; name?: string }) {
  if (item.price > coins.value) {
    showToast("金币不足", "warning");
    return;
  }

  uni.showModal({
    title: item.itemType === "gacha" ? "购买扭蛋" : "兑换商品",
    content: `确定要${item.itemType === "gacha" ? "购买" : "兑换"}「${item.name}」吗？需要 ${item.price} 金币`,
    success: async (res) => {
      if (!res.confirm) return;

      if (item.itemType === "gacha") {
        await redeemGacha(item);
      } else {
        await redeemRegular(item);
      }
    },
  });
}

// 兑换普通商品
async function redeemRegular(item: { id: number }) {
  const ok = await shopStore.redeemItem(item.id);
  if (ok) {
    showToast("已提交兑换申请，等待家长审核", "success");
  }
}

// 兑换扭蛋商品
async function redeemGacha(item: { id: number }) {
  const result = await shopStore.redeemGachaItem(item.id);
  if (result) {
    showToast("购买扭蛋成功", "success");
    // 询问是否立即开启
    uni.showModal({
      title: "扭蛋购买成功",
      content: "是否立即开启扭蛋？",
      success: async (res) => {
        if (res.confirm) {
          await magicBoxStore.openBox(result.boxId);
        }
      },
    });
  }
}

// 跳转金币流水
function goCoins() {
  uni.navigateTo({ url: "/pages/coins/index" });
}

async function onRefresh() {
  isRefreshing.value = true;
  try {
    await Promise.all([shopStore.loadItems(), authStore.refreshUser()]);
  } catch {
    showToast("刷新失败", "error");
  } finally {
    isRefreshing.value = false;
  }
}

onMounted(() => {
  shopStore.loadItems();
});
</script>

<style lang="scss" scoped>
.child-shop-page {
  min-height: 100vh;
  background: $bg-primary;
}

.page-scroll {
  height: 100vh;
  padding-bottom: 100rpx;
}

.loading-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid rgba($accent-cyan, 0.2);
  border-top-color: $accent-cyan;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== 顶部栏 ===== */
.shop-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 32rpx 24rpx;
}

.shop-header__title {
  font-size: 36rpx;
  font-weight: 800;
  color: $text-primary;
}

.shop-header__coin-pill {
  display: flex;
  align-items: center;
  padding: 8rpx 20rpx;
  background: rgba($accent-orange, 0.15);
  border-radius: 24rpx;
  border: 1rpx solid rgba($accent-orange, 0.3);
}

.shop-header__coin-text {
  font-size: 24rpx;
  font-weight: 700;
  color: $accent-orange;
}

/* ===== 商品网格 ===== */
.shop-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 0 32rpx;
}

.shop-item {
  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32rpx 24rpx;
    background: $bg-card;
    border-radius: 20rpx;
    border: 2rpx solid $border-subtle;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
  }

  &__emoji {
    font-size: 72rpx;
    margin-bottom: 12rpx;
  }

  &__name {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    font-size: 26rpx;
    font-weight: 600;
    color: $text-primary;
    text-align: center;
    margin-bottom: 8rpx;
    line-height: 1.4;
    overflow: hidden;
  }

  &__tag {
    margin-bottom: 8rpx;
  }

  &__tag-text {
    padding: 2rpx 12rpx;
    font-size: 18rpx;
    font-weight: 600;
    border-radius: 8rpx;
    background: rgba($accent-purple, 0.2);
    color: $accent-purple;
  }

  &__price {
    margin-bottom: 12rpx;
  }

  &__price-text {
    font-size: 24rpx;
    font-weight: 700;
    color: $accent-orange;
  }

  &__redeem-btn {
    width: 100%;
    padding: 12rpx 0;
    font-size: 24rpx;
    font-weight: 700;
    text-align: center;
    border-radius: 12rpx;
    background: $accent-cyan;
    color: $bg-primary;
    border: none;

    &.is-disabled {
      background: rgba($text-secondary, 0.3);
      color: $text-disabled;
    }

    &:active:not(.is-disabled) {
      opacity: 0.8;
    }
  }
}

.bottom-safe {
  height: 0;
}
</style>
