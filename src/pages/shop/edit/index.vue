<!-- 商品编辑 - 创建/编辑商城商品 -->
<template>
  <view class="shop-edit">
    <view class="shop-edit__form">
      <!-- 图标选择 -->
      <view class="shop-edit__section">
        <text class="shop-edit__section-title">图标</text>
        <view class="shop-edit__emoji-grid">
          <view
            v-for="emoji in emojiOptions"
            :key="emoji"
            class="shop-edit__emoji-item"
            :class="{ 'shop-edit__emoji-item--active': formData.emoji === emoji }"
            @tap="selectEmoji(emoji)"
          >
            <text class="shop-edit__emoji-text">{{ emoji }}</text>
          </view>
        </view>
      </view>

      <!-- 商品名称 -->
      <view class="shop-edit__section">
        <text class="shop-edit__section-title">商品名称</text>
        <input
          v-model="formData.name"
          class="shop-edit__input"
          placeholder="例如：周末去公园"
          maxlength="50"
        />
      </view>

      <!-- 描述 -->
      <view class="shop-edit__section">
        <text class="shop-edit__section-title">描述（可选）</text>
        <textarea
          v-model="formData.description"
          class="shop-edit__textarea"
          placeholder="商品详细说明"
          maxlength="200"
        />
      </view>

      <!-- 价格 -->
      <view class="shop-edit__section">
        <text class="shop-edit__section-title">💰 价格（金币）</text>
        <input
          v-model="formData.price"
          class="shop-edit__input shop-edit__input--number"
          type="digit"
          placeholder="输入金币数"
        />
      </view>

      <!-- 段位要求 -->
      <view class="shop-edit__section">
        <text class="shop-edit__section-title">段位要求</text>
        <view class="shop-edit__tier-row">
          <view
            v-for="tier in tierOptions"
            :key="tier.value"
            class="shop-edit__tier-chip"
            :class="{ 'shop-edit__tier-chip--active': formData.tier === tier.value }"
            @tap="formData.tier = tier.value"
          >
            <text class="shop-edit__tier-chip-text">{{ tier.label }}</text>
          </view>
        </view>
      </view>

      <!-- 商品类型 -->
      <view class="shop-edit__section">
        <text class="shop-edit__section-title">商品类型</text>
        <view class="shop-edit__type-row">
          <view
            class="shop-edit__type-chip"
            :class="{ 'shop-edit__type-chip--active': formData.itemType === 'regular' }"
            @tap="formData.itemType = 'regular'"
          >
            <text class="shop-edit__type-chip-text">普通商品</text>
          </view>
          <view
            class="shop-edit__type-chip"
            :class="{ 'shop-edit__type-chip--active': formData.itemType === 'gacha' }"
            @tap="formData.itemType = 'gacha'"
          >
            <text class="shop-edit__type-chip-text">扭蛋商品</text>
          </view>
        </view>
      </view>

      <!-- 扭蛋档位（仅扭蛋类型显示） -->
      <view v-if="formData.itemType === 'gacha'" class="shop-edit__section">
        <text class="shop-edit__section-title">扭蛋档位</text>
        <view class="shop-edit__gacha-row">
          <view
            v-for="gacha in gachaOptions"
            :key="gacha.tier"
            class="shop-edit__gacha-chip"
            :class="{ 'shop-edit__gacha-chip--active': formData.gachaTier === gacha.tier }"
            @tap="formData.gachaTier = gacha.tier"
          >
            <text class="shop-edit__gacha-chip-emoji">{{ gacha.emoji }}</text>
            <text class="shop-edit__gacha-chip-text">{{ gacha.name }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="shop-edit__footer">
      <button class="shop-edit__save-btn" :disabled="saving" @tap="handleSave">
        <view v-if="saving" class="shop-edit__save-spinner" />
        <text v-else>{{ isEdit ? '保存修改' : '创建商品' }}</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { getShopItems, createShopItem, updateShopItem } from "@/api/shop";
import { parseShopItem } from "@/models/shop";
import type { ShopItem } from "@/models/shop";
import { EMOJI_OPTIONS } from "@/config/game";
import { getAppMessage } from "@/config/errors";

const routeQuery = ref<Record<string, string>>({});

onLoad((query: Record<string, string> | undefined) => {
  if (query) {
    routeQuery.value = query;
  }
});

const isEdit = computed(() => !!routeQuery.value?.id);
const saving = ref(false);

/** 表单数据 */
const formData = ref({
  name: "",
  description: "",
  price: "",
  emoji: "🎁",
  tier: "bronze" as "bronze" | "silver" | "gold" | "legendary",
  itemType: "regular" as "regular" | "gacha",
  gachaTier: 1,
});

/** 表情选项 */
const emojiOptions = EMOJI_OPTIONS;

/** 段位选项 */
const tierOptions = [
  { value: "bronze" as const, label: "🥉 青铜" },
  { value: "silver" as const, label: "🥈 白银" },
  { value: "gold" as const, label: "🥇 黄金" },
  { value: "legendary" as const, label: "👑 传说" },
];

/** 扭蛋档位选项 */
const gachaOptions = [
  { tier: 1, name: "青铜扭蛋", emoji: "🔤" },
  { tier: 2, name: "白银扭蛋", emoji: "⚪" },
  { tier: 3, name: "黄金扭蛋", emoji: "🟡" },
  { tier: 4, name: "钻石扭蛋", emoji: "💎" },
];

/** 选择表情 */
function selectEmoji(emoji: string) {
  formData.value.emoji = emoji;
}

/** 加载已有商品数据（编辑模式） */
async function loadItemData() {
  try {
    const itemId = parseInt(routeQuery.value.id as string, 10);
    const result = await getShopItems();
    if (result.success && result.data?.items) {
      const items = result.data.items as unknown as Record<string, unknown>[];
      const item = items.find((i) => i.id === itemId);
      if (item) {
        const parsed = parseShopItem(item);
        formData.value = {
          name: parsed.name,
          description: parsed.description || "",
          price: String(parsed.price),
          emoji: parsed.emoji,
          tier: parsed.tier,
          itemType: parsed.itemType,
          gachaTier: parsed.gachaTier || 1,
        };
      }
    }
  } catch {
    uni.showToast({ title: "加载失败", icon: "none" });
  }
}

/** 保存商品 */
async function handleSave() {
  if (!formData.value.name.trim()) {
    uni.showToast({ title: "请输入商品名称", icon: "none" });
    return;
  }

  if (!formData.value.price || parseInt(formData.value.price, 10) <= 0) {
    uni.showToast({ title: "请输入有效的价格", icon: "none" });
    return;
  }

  saving.value = true;
  try {
    const params = {
      name: formData.value.name.trim(),
      description: formData.value.description.trim() || undefined,
      price: parseInt(formData.value.price, 10),
      emoji: formData.value.emoji,
      tier: formData.value.tier,
      item_type: formData.value.itemType,
      gacha_tier: formData.value.itemType === "gacha" ? formData.value.gachaTier : undefined,
    };

    let result;
    if (isEdit.value) {
      const itemId = parseInt(routeQuery.value.id as string, 10);
      result = await updateShopItem(itemId, params);
    } else {
      result = await createShopItem(params);
    }

    if (result?.success) {
      uni.showToast({ title: isEdit.value ? "保存成功" : "创建成功", icon: "success" });
      setTimeout(() => {
        uni.navigateBack();
      }, 1500);
    } else {
      uni.showToast({ title: result?.error || "操作失败", icon: "none" });
    }
  } catch {
    uni.showToast({ title: getAppMessage("UPDATE_FAILED"), icon: "none" });
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  if (isEdit.value) {
    loadItemData();
  }
});
</script>

<style lang="scss" scoped>
.shop-edit {
  min-height: 100vh;
  background: $bg-primary;
  display: flex;
  flex-direction: column;

  &__form {
    padding: 32rpx;
    flex: 1;
  }

  &__section {
    margin-bottom: 48rpx;
  }

  &__section-title {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 32rpx;
  }

  /* 表情选择网格 */
  &__emoji-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  &__emoji-item {
    width: 96rpx;
    height: 96rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 24rpx;
    border: 3rpx solid $border-subtle;
    background: $bg-card;
    transition: all 0.2s;
  }

  &__emoji-item--active {
    background: rgba(106, 214, 255, 0.15);
    border-color: $accent-cyan;
  }

  &__emoji-text {
    font-size: 48rpx;
  }

  /* 输入框 */
  &__input {
    width: 100%;
    height: 88rpx;
    padding: 0 28rpx;
    background: $bg-card;
    border-radius: 20rpx;
    border: 2rpx solid $border-subtle;
    font-size: 30rpx;
    color: $text-primary;
    box-sizing: border-box;
  }

  &__input--number {
    text-align: center;
  }

  &__textarea {
    width: 100%;
    height: 120rpx;
    padding: 20rpx 28rpx;
    background: $bg-card;
    border-radius: 20rpx;
    border: 2rpx solid $border-subtle;
    font-size: 30rpx;
    color: $text-primary;
    box-sizing: border-box;
  }

  /* 段位选择 */
  &__tier-row {
    display: flex;
    gap: 16rpx;
  }

  &__tier-chip {
    flex: 1;
    padding: 16rpx 8rpx;
    border-radius: 20rpx;
    border: 2rpx solid $border-subtle;
    background: $bg-card;
    text-align: center;
  }

  &__tier-chip--active {
    background: rgba(106, 214, 255, 0.15);
    border-color: $accent-cyan;
  }

  &__tier-chip-text {
    font-size: 24rpx;
    font-weight: 500;
    color: $text-secondary;
  }

  &__tier-chip--active &__tier-chip-text {
    color: $accent-cyan;
    font-weight: bold;
  }

  /* 商品类型选择 */
  &__type-row {
    display: flex;
    gap: 16rpx;
  }

  &__type-chip {
    flex: 1;
    padding: 20rpx 16rpx;
    border-radius: 20rpx;
    border: 2rpx solid $border-subtle;
    background: $bg-card;
    text-align: center;
  }

  &__type-chip--active {
    background: rgba(106, 214, 255, 0.15);
    border-color: $accent-cyan;
  }

  &__type-chip-text {
    font-size: 28rpx;
    font-weight: 500;
    color: $text-secondary;
  }

  &__type-chip--active &__type-chip-text {
    color: $accent-cyan;
    font-weight: bold;
  }

  /* 扭蛋档位选择 */
  &__gacha-row {
    display: flex;
    gap: 16rpx;
    flex-wrap: wrap;
  }

  &__gacha-chip {
    flex: 1;
    min-width: 45%;
    padding: 16rpx 12rpx;
    border-radius: 20rpx;
    border: 2rpx solid $border-subtle;
    background: $bg-card;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
  }

  &__gacha-chip--active {
    background: rgba(168, 85, 247, 0.15);
    border-color: $accent-purple;
  }

  &__gacha-chip-emoji {
    font-size: 28rpx;
  }

  &__gacha-chip-text {
    font-size: 24rpx;
    font-weight: 500;
    color: $text-secondary;
  }

  &__gacha-chip--active &__gacha-chip-text {
    color: $accent-purple;
    font-weight: bold;
  }

  /* 底部保存按钮 */
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
    background: linear-gradient(135deg, $accent-cyan, #8be4ff, $accent-cyan);
    border-radius: 28rpx;
    border: none;
    box-shadow: 0 8rpx 32rpx rgba(106, 214, 255, 0.3);
  }

  &__save-btn:disabled {
    opacity: 0.6;
  }

  &__save-spinner {
    width: 40rpx;
    height: 40rpx;
    border: 4rpx solid rgba(11, 12, 31, 0.3);
    border-top-color: $bg-primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
}
</style>
