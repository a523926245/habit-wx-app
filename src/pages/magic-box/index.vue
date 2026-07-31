<!-- 我的扭蛋 - 查看扭蛋库存和开箱 -->
<template>
  <view class="magic-box">
    <scroll-view scroll-y class="magic-box__scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="handleRefresh">
      <!-- 加载中 -->
      <view v-if="loading && boxes.length === 0" class="magic-box__loading">
        <view class="magic-box__spinner" />
      </view>

      <!-- 空状态 -->
      <view v-else-if="boxes.length === 0" class="magic-box__empty">
        <text class="magic-box__empty-emoji">🎡</text>
        <text class="magic-box__empty-title">暂无扭蛋</text>
        <text class="magic-box__empty-desc">击败BOSS或在商城购买扭蛋</text>
        <view class="magic-box__empty-btn" @tap="goToShop">
          <text class="magic-box__empty-btn-text">去商城看看</text>
        </view>
      </view>

      <!-- 扭蛋列表 -->
      <view v-else class="magic-box__items">
        <view
          v-for="box in boxes"
          :key="box.id"
          class="magic-box__card"
          @tap="openBox(box)"
        >
          <view class="magic-box__card-emoji">{{ box.emoji }}</view>
          <view class="magic-box__card-info">
            <text class="magic-box__card-name">{{ box.name }}</text>
            <text class="magic-box__card-source">{{ getSourceLabel(box.source) }}</text>
          </view>
          <view class="magic-box__card-action">
            <text class="magic-box__card-action-text">开启</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getMagicBoxes, openMagicBox } from "@/api/magicBox";
import { getAppMessage } from "@/config/errors";

interface Box {
  id: number;
  tier: number;
  source: string;
  name: string;
  emoji: string;
}

const loading = ref(false);
const isRefreshing = ref(false);
const boxes = ref<Box[]>([]);

/** 获取来源标签 */
function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    boss_drop: "BOSS掉落",
    shop_purchase: "商城购买",
  };
  return labels[source] || "其他";
}

/** 加载扭蛋列表 */
async function loadBoxes() {
  loading.value = true;
  try {
    const result = await getMagicBoxes();
    if (result.success && result.data) {
      boxes.value = (result.data.boxes || []).filter((b) => !b.opened);
    }
  } catch {
    uni.showToast({ title: getAppMessage("LOAD_BOXES_FAILED"), icon: "none" });
  } finally {
    loading.value = false;
  }
}

/** 开启扭蛋 */
async function openBox(box: Box) {
  uni.showModal({
    title: "开启扭蛋",
    content: `确定要开启「${box.name}」吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await openMagicBox(box.id);
          if (result.success && result.data) {
            const r = result.data.result;
            let msg = "";
            if (r.resultType === "coins") {
              msg = `获得 ${r.coinsReward} 金币！`;
            } else {
              msg = `获得 ${r.voucherEmoji} ${r.voucherTierName}！`;
            }
            uni.showModal({
              title: "🎉 开启成功",
              content: msg,
              showCancel: false,
            });
            await loadBoxes();
          } else {
            uni.showToast({ title: result.error || "开启失败", icon: "none" });
          }
        } catch {
          uni.showToast({ title: getAppMessage("OPEN_BOX_FAILED"), icon: "none" });
        }
      }
    },
  });
}

/** 跳转商城 */
function goToShop() {
  uni.switchTab({ url: "/pages/child/shop/index" });
}

/** 下拉刷新 */
async function handleRefresh() {
  isRefreshing.value = true;
  await loadBoxes();
  isRefreshing.value = false;
}

onMounted(() => {
  loadBoxes();
});
</script>

<style lang="scss" scoped>
.magic-box {
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
      margin-bottom: 32rpx;
    }

    &-btn {
      padding: 16rpx 48rpx;
      background: $accent-cyan;
      border-radius: 40rpx;
    }

    &-btn-text {
      font-size: 28rpx;
      font-weight: 600;
      color: $bg-primary;
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

  &__card-source {
    font-size: 24rpx;
    color: $text-secondary;
    display: block;
    margin-top: 4rpx;
  }

  &__card-action {
    padding: 12rpx 32rpx;
    background: $accent-purple;
    border-radius: 40rpx;
    flex-shrink: 0;
  }

  &__card-action-text {
    font-size: 26rpx;
    font-weight: 600;
    color: #fff;
  }
}
</style>
