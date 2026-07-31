<!-- 商品管理 - 家长端商城管理 -->
<template>
  <view class="shop-manage">
    <!-- Tab 选项卡 -->
    <view class="shop-manage__tabs">
      <view
        v-for="(tab, index) in tabs"
        :key="index"
        class="shop-manage__tab"
        :class="{ 'shop-manage__tab--active': tabIndex === index }"
        @tap="switchTab(index)"
      >
        <text class="shop-manage__tab-text">{{ tab.label }}</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <scroll-view scroll-y class="shop-manage__scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="handleRefresh">
      <!-- 加载中 -->
      <view v-if="loading && items.length === 0" class="shop-manage__loading">
        <view class="shop-manage__spinner" />
      </view>

      <!-- 空状态 -->
      <view v-else-if="filteredItems.length === 0" class="shop-manage__empty">
        <text class="shop-manage__empty-emoji">🎁</text>
        <text class="shop-manage__empty-title">还没有商品</text>
        <text class="shop-manage__empty-desc">点击右下角 + 创建第一个商品</text>
      </view>

      <!-- 商品列表 -->
      <view v-else class="shop-manage__items">
        <view
          v-for="item in filteredItems"
          :key="item.id"
          class="shop-manage__card"
          @tap="editItem(item)"
        >
          <!-- 表情图标 -->
          <view class="shop-manage__card-icon">
            <text class="shop-manage__card-emoji">{{ item.emoji }}</text>
          </view>

          <!-- 信息 -->
          <view class="shop-manage__card-info">
            <view class="shop-manage__card-header">
              <text class="shop-manage__card-name">{{ item.name }}</text>
              <view class="shop-manage__card-type-badge" :class="{ 'shop-manage__card-type-badge--gacha': item.itemType === 'gacha' }">
                <text class="shop-manage__card-type-text">{{ item.itemType === 'gacha' ? '扭蛋' : '普通' }}</text>
              </view>
            </view>

            <view class="shop-manage__card-meta">
              <view class="shop-manage__card-price">
                <text class="shop-manage__card-price-text">{{ item.price }} 💰</text>
              </view>
              <view class="shop-manage__card-tier">
                <text class="shop-manage__card-tier-text">{{ getTierLabel(item.tier) }}</text>
              </view>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="shop-manage__card-actions">
            <view class="shop-manage__delete-btn" @tap.stop="deleteItem(item)">
              <text class="shop-manage__delete-icon">🗑</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 悬浮创建按钮 -->
    <view class="shop-manage__fab" @tap="goToEdit">
      <text class="shop-manage__fab-icon">＋</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getShopItems, deleteShopItem } from "@/api/shop";
import { parseShopItem } from "@/models/shop";
import type { ShopItem } from "@/models/shop";
import { RANK_TIER_LABELS } from "@/config/game";
import { getAppMessage } from "@/config/errors";

/** Tab 配置 */
const tabs = [
  { label: "全部商品", key: "all" },
  { label: "扭蛋商品", key: "gacha" },
];

const tabIndex = ref(0);
const loading = ref(false);
const isRefreshing = ref(false);
const items = ref<ShopItem[]>([]);

/** 过滤后的商品列表 */
const filteredItems = computed(() => {
  if (tabIndex.value === 1) {
    return items.value.filter((item) => item.itemType === "gacha");
  }
  return items.value;
});

/** 获取段位中文名称 */
function getTierLabel(tier: string): string {
  return RANK_TIER_LABELS[tier] || "🥉 青铜";
}

/** 切换 Tab */
function switchTab(index: number) {
  tabIndex.value = index;
}

/** 加载商品列表 */
async function loadItems() {
  loading.value = true;
  try {
    const result = await getShopItems();
    if (result.success && result.data) {
      items.value = (result.data.items || []).map((item) =>
        parseShopItem(item as unknown as Record<string, unknown>)
      );
    }
  } catch {
    uni.showToast({ title: getAppMessage("LOAD_ITEMS_FAILED"), icon: "none" });
  } finally {
    loading.value = false;
  }
}

/** 下拉刷新 */
async function handleRefresh() {
  isRefreshing.value = true;
  await loadItems();
  isRefreshing.value = false;
}

/** 跳转到编辑页面（新建） */
function goToEdit() {
  uni.navigateTo({ url: "/pages/shop/edit/index" });
}

/** 跳转到编辑页面（编辑） */
function editItem(item: ShopItem) {
  uni.navigateTo({ url: `/pages/shop/edit/index?id=${item.id}` });
}

/** 删除商品 */
function deleteItem(item: ShopItem) {
  uni.showModal({
    title: "确认删除",
    content: `确定要删除商品「${item.name}」吗？此操作不可恢复。`,
    confirmColor: "#e74c3c",
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await deleteShopItem(item.id);
          if (result.success) {
            uni.showToast({ title: "商品已删除", icon: "success" });
            await loadItems();
          } else {
            uni.showToast({ title: result.error || "删除失败", icon: "none" });
          }
        } catch {
          uni.showToast({ title: getAppMessage("UPDATE_FAILED"), icon: "none" });
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
.shop-manage {
  min-height: 100vh;
  background: $bg-primary;

  /* Tab 选项卡 */
  &__tabs {
    display: flex;
    margin: 32rpx;
    padding: 8rpx;
    background: $bg-card;
    border-radius: 60rpx;
    border: 2rpx solid rgba(106, 214, 255, 0.1);
    flex-shrink: 0;
  }

  &__tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16rpx 0;
    border-radius: 52rpx;
    transition: all 0.2s ease;
  }

  &__tab--active {
    background: $accent-cyan;
    box-shadow: 0 0 30rpx rgba(106, 214, 255, 0.3);
  }

  &__tab-text {
    font-size: 28rpx;
    font-weight: 500;
    color: $text-secondary;
  }

  &__tab--active &__tab-text {
    color: $bg-primary;
    font-weight: bold;
  }

  /* 列表区域 */
  &__scroll {
    height: calc(100vh - 120rpx);
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

  /* 商品卡片 */
  &__items {
    padding: 0 32rpx 180rpx;
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
    width: 96rpx;
    height: 96rpx;
    border-radius: 24rpx;
    background: rgba(106, 214, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__card-emoji {
    font-size: 48rpx;
  }

  &__card-info {
    flex: 1;
    min-width: 0;
    margin-left: 24rpx;
  }

  &__card-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 8rpx;
  }

  &__card-name {
    font-size: 30rpx;
    font-weight: 600;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__card-type-badge {
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    background: rgba(106, 214, 255, 0.1);
    flex-shrink: 0;
  }

  &__card-type-badge--gacha {
    background: rgba(168, 85, 247, 0.1);
  }

  &__card-type-text {
    font-size: 20rpx;
    font-weight: 500;
    color: $accent-cyan;
  }

  &__card-type-badge--gacha &__card-type-text {
    color: $accent-purple;
  }

  &__card-meta {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  &__card-price-text {
    font-size: 26rpx;
    font-weight: 600;
    color: $accent-orange;
  }

  &__card-tier-text {
    font-size: 24rpx;
    color: $text-secondary;
  }

  /* 操作按钮 */
  &__card-actions {
    margin-left: 16rpx;
    flex-shrink: 0;
  }

  &__delete-btn {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: rgba(231, 76, 60, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__delete-icon {
    font-size: 32rpx;
  }

  /* 悬浮创建按钮 */
  &__fab {
    position: fixed;
    bottom: 40rpx;
    right: 40rpx;
    width: 112rpx;
    height: 112rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, $accent-cyan, #8be4ff);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 32rpx rgba(106, 214, 255, 0.3);
    z-index: 100;
  }

  &__fab-icon {
    font-size: 56rpx;
    font-weight: 200;
    color: $bg-primary;
    line-height: 1;
  }
}
</style>
