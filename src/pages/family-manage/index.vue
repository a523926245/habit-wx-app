<!-- 家庭管理 - 勇者乐园深色赛博朋克主题 -->
<template>
  <view class="family-manage">
    <scroll-view scroll-y class="family-manage__scroll" refresher-enabled :refresher-triggered="isRefreshing" @refresherrefresh="handleRefresh">
      <view v-if="loading" class="family-manage__loading">
        <view class="family-manage__spinner" />
      </view>
      <view v-else class="family-manage__content">
        <!-- 家庭名称 -->
        <view class="family-manage__header">
          <view class="family-manage__name-row" @tap="showEditName">
            <text class="family-manage__name-text">{{ familyName }}</text>
            <text class="family-manage__edit-icon">✏️</text>
          </view>
        </view>

        <!-- 成员列表 -->
        <view class="family-manage__section">
          <view class="family-manage__section-header">
            <text class="family-manage__section-title">冒险团成员</text>
            <text class="family-manage__section-count">{{ members.length }}人</text>
          </view>
          <view class="family-manage__members">
            <view v-for="member in members" :key="member.id" class="family-manage__member-card" :class="{ 'family-manage__member-card--clickable': canChangeRole(member) }" @tap="handleMemberTap(member)">
              <!-- 头像 -->
              <view class="family-manage__member-avatar" :style="{ background: member.role === 'parent' ? 'rgba(106, 214, 255, 0.15)' : 'rgba(255, 107, 53, 0.15)' }">
                <text class="family-manage__member-avatar-text" :style="{ color: member.role === 'parent' ? '#6ad6ff' : '#ff6b35' }">
                  {{ getFirstChildLetter(member.nickname) }}
                </text>
              </view>

              <!-- 信息 -->
              <view class="family-manage__member-info">
                <view class="family-manage__member-name-row">
                  <text class="family-manage__member-name">{{ member.nickname || '未知' }}</text>
                  <view v-if="isMe(member)" class="family-manage__member-me-badge">
                    <text class="family-manage__member-me-text">我</text>
                  </view>
                </view>
                <view class="family-manage__member-role-badge" :style="{ background: member.role === 'parent' ? 'rgba(106, 214, 255, 0.1)' : 'rgba(255, 107, 53, 0.1)', borderColor: member.role === 'parent' ? 'rgba(106, 214, 255, 0.3)' : 'rgba(255, 107, 53, 0.3)' }">
                  <text class="family-manage__member-role-text" :style="{ color: member.role === 'parent' ? '#6ad6ff' : '#ff6b35' }">
                    {{ member.role === 'parent' ? '家长' : '孩子' }}
                  </text>
                </view>
              </view>

              <!-- 操作按钮 -->
              <view v-if="currentUser?.role === 'parent'" class="family-manage__member-actions">
                <view v-if="canChangeRole(member)" class="family-manage__action-btn" @tap.stop="showRoleDialog(member)">
                  <text class="family-manage__action-icon" style="color: #6ad6ff;">👤</text>
                </view>
                <view v-if="!isMe(member)" class="family-manage__action-btn" @tap.stop="showRemoveDialog(member)">
                  <text class="family-manage__action-icon" style="color: #e74c3c;">🚫</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 安全凭证 -->
        <view class="family-manage__section">
          <view class="family-manage__section-header">
            <text class="family-manage__section-title" style="color: #ff6b35;">安全凭证</text>
          </view>

          <!-- 邀请码 -->
          <view class="family-manage__credential-card">
            <view class="family-manage__credential-info">
              <text class="family-manage__credential-label">家庭邀请码</text>
              <text class="family-manage__credential-value">{{ inviteCode }}</text>
            </view>
            <view class="family-manage__credential-action" @tap="copyToClipboard(inviteCode, '邀请码')">
              <text class="family-manage__credential-copy">📋</text>
            </view>
          </view>

          <!-- 家长密匙 -->
          <view class="family-manage__credential-card">
            <view class="family-manage__credential-info">
              <text class="family-manage__credential-label">家庭密匙</text>
              <view class="family-manage__credential-key-row">
                <text class="family-manage__credential-value family-manage__credential-value--key">{{ obscuredParentCode }}</text>
                <view class="family-manage__credential-toggle" @tap="toggleParentCode">
                  <text class="family-manage__credential-toggle-icon">{{ showParentCode ? '👁' : '👁‍🗨' }}</text>
                </view>
              </view>
            </view>
            <view class="family-manage__credential-action" @tap="copyToClipboard(parentCode, '家长密匙')">
              <text class="family-manage__credential-copy">📋</text>
            </view>
          </view>
        </view>

        <!-- 解散家庭 -->
        <view class="family-manage__danger-zone">
          <view class="family-manage__danger-btn" @tap="showDissolveDialog">
            <text class="family-manage__danger-icon">💔</text>
            <text class="family-manage__danger-text">解散家庭战团</text>
          </view>
        </view>

        <view style="height: 80rpx;" />
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { getFamilyInfo, updateFamilyName, updateMemberRole, removeMember } from "@/api/auth";

const authStore = useAuthStore();

interface Member {
  id: number;
  nickname: string;
  role: string;
}

const familyName = ref("");
const inviteCode = ref("");
const parentCode = ref("");
const members = ref<Member[]>([]);
const loading = ref(true);
const isRefreshing = ref(false);
const currentUserId = ref<number | null>(null);
const showParentCode = ref(false);

const currentUser = computed(() => authStore.user.value);

const obscuredParentCode = computed(() => {
  if (showParentCode.value) return parentCode.value;
  if (!parentCode.value) return "";
  return "•".repeat(parentCode.value.length);
});

onMounted(() => {
  loadFamilyInfo();
});

async function handleRefresh() {
  isRefreshing.value = true;
  await loadFamilyInfo();
  isRefreshing.value = false;
}

async function loadFamilyInfo() {
  loading.value = true;
  try {
    const result = await getFamilyInfo();
    if (result.success && result.data) {
      const { family, members: memberList } = result.data as {
        family: { name: string; inviteCode: string; parentCode: string };
        members: Member[];
      };
      familyName.value = family?.name || "";
      inviteCode.value = family?.inviteCode || "";
      parentCode.value = family?.parentCode || "";
      members.value = memberList || [];
      currentUserId.value = currentUser.value?.id || null;
    }
  } catch {
    uni.showToast({ title: "加载失败", icon: "none" });
  } finally {
    loading.value = false;
  }
}

function isMe(member: Member): boolean {
  return member.id === currentUserId.value;
}

function canChangeRole(member: Member): boolean {
  return currentUser.value?.role === "parent" && !isMe(member);
}

function getFirstChildLetter(name: string): string {
  return name?.charAt(0) ?? "?";
}

function copyToClipboard(text: string, label: string) {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.showToast({ title: `${label} 已复制！`, icon: "success" });
    },
  });
}

function toggleParentCode() {
  showParentCode.value = !showParentCode.value;
}

function handleMemberTap(member: Member) {
  if (canChangeRole(member)) {
    showRoleDialog(member);
  }
}

function showEditName() {
  uni.showModal({
    title: "修改家庭名称",
    editable: true,
    placeholderText: "输入新家庭名称",
    content: familyName.value,
    success: async (res) => {
      if (res.confirm && res.content) {
        try {
          const result = await updateFamilyName(res.content.trim());
          if (result?.success) {
            familyName.value = res.content.trim();
            uni.showToast({ title: "家庭名称已更新！", icon: "success" });
          }
        } catch {
          uni.showToast({ title: "更新失败", icon: "none" });
        }
      }
    },
  });
}

function showRoleDialog(member: Member) {
  let selectedRole = member.role;

  uni.showModal({
    title: `修改 ${member.nickname} 的角色`,
    content: "",
    editable: false,
    showCancel: true,
    confirmText: "确认",
    success: () => {
      // 由于 uni.showModal 不支持 radio，使用简单选择
      uni.showActionSheet({
        itemList: ["家长", "孩子"],
        success: (res) => {
          const newRole = res.tapIndex === 0 ? "parent" : "child";
          if (newRole !== member.role) {
            updateMemberRoleFn(member.id, newRole);
          }
        },
      });
    },
  });
}

async function updateMemberRoleFn(memberId: number, role: string) {
  try {
    const result = await updateMemberRole(memberId, role);
    if (result?.success) {
      uni.showToast({ title: "角色修改成功！", icon: "success" });
      await loadFamilyInfo();
    }
  } catch {
    uni.showToast({ title: "操作失败", icon: "none" });
  }
}

function showRemoveDialog(member: Member) {
  uni.showModal({
    title: "移除成员",
    content: `确定要将 "${member.nickname}" 移出家庭吗？`,
    confirmColor: "#e74c3c",
    success: async (res) => {
      if (res.confirm) {
        try {
          const result = await removeMember(member.id);
          if (result?.success) {
            uni.showToast({ title: "成员已移除", icon: "success" });
            await loadFamilyInfo();
          }
        } catch {
          uni.showToast({ title: "操作失败", icon: "none" });
        }
      }
    },
  });
}

function showDissolveDialog() {
  uni.showModal({
    title: "确认解散家庭？",
    content: "解散后所有成员将被移出家庭，此操作不可恢复。",
    confirmColor: "#e74c3c",
    confirmText: "确认解散",
    success: async (res) => {
      if (res.confirm) {
        uni.showToast({ title: "功能开发中", icon: "none" });
      }
    },
  });
}
</script>

<style lang="scss" scoped>
.family-manage {
  min-height: 100vh;
  background: $bg-primary;

  &__scroll {
    height: 100vh;
  }

  &__loading {
    display: flex;
    justify-content: center;
    padding: 120rpx 0;
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
    to { transform: rotate(360deg); }
  }

  &__content {
    padding: 32rpx;
  }

  /* 家庭名称 */
  &__header {
    text-align: center;
    margin-bottom: 48rpx;
  }

  &__name-row {
    display: inline-flex;
    align-items: center;
    gap: 16rpx;
  }

  &__name-text {
    font-size: 56rpx;
    font-weight: bold;
    color: $accent-cyan;
  }

  &__edit-icon {
    font-size: 28rpx;
    opacity: 0.5;
  }

  /* 区块 */
  &__section {
    margin-bottom: 48rpx;
  }

  &__section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24rpx;
  }

  &__section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: $text-primary;
  }

  &__section-count {
    font-size: 26rpx;
    color: $text-secondary;
  }

  /* 成员卡片 */
  &__members {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }

  &__member-card {
    display: flex;
    align-items: center;
    padding: 28rpx;
    background: $bg-card;
    border-radius: 32rpx;
    border: 2rpx solid $border-subtle;
  }

  &__member-card--clickable {
    // 可点击样式
  }

  &__member-avatar {
    width: 112rpx;
    height: 112rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__member-avatar-text {
    font-size: 40rpx;
    font-weight: bold;
  }

  &__member-info {
    flex: 1;
    min-width: 0;
    margin-left: 28rpx;
  }

  &__member-name-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  &__member-name {
    font-size: 32rpx;
    font-weight: 600;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__member-me-badge {
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    background: rgba(0, 184, 148, 0.1);
    flex-shrink: 0;
  }

  &__member-me-text {
    font-size: 20rpx;
    font-weight: bold;
    color: $accent-green;
  }

  &__member-role-badge {
    display: inline-block;
    margin-top: 8rpx;
    padding: 4rpx 16rpx;
    border-radius: 16rpx;
    border: 2rpx solid;
  }

  &__member-role-text {
    font-size: 24rpx;
    font-weight: 500;
  }

  &__member-actions {
    display: flex;
    gap: 16rpx;
    margin-left: 16rpx;
    flex-shrink: 0;
  }

  &__action-btn {
    width: 80rpx;
    height: 80rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(106, 214, 255, 0.1);
  }

  &__action-icon {
    font-size: 32rpx;
  }

  /* 安全凭证 */
  &__credential-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    background: $bg-card;
    border-radius: 32rpx;
    border: 2rpx solid rgba(106, 214, 255, 0.15);
    margin-bottom: 24rpx;
  }

  &__credential-info {
    flex: 1;
  }

  &__credential-label {
    font-size: 24rpx;
    color: $text-secondary;
  }

  &__credential-value {
    font-size: 48rpx;
    font-weight: bold;
    color: $text-primary;
    letter-spacing: 8rpx;
    margin-top: 8rpx;
    display: block;
  }

  &__credential-value--key {
    letter-spacing: 0;
  }

  &__credential-key-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    margin-top: 8rpx;
  }

  &__credential-toggle {
    padding: 8rpx;
  }

  &__credential-toggle-icon {
    font-size: 32rpx;
  }

  &__credential-action {
    padding: 16rpx;
    flex-shrink: 0;
  }

  &__credential-copy {
    font-size: 40rpx;
  }

  /* 解散家庭 */
  &__danger-zone {
    display: flex;
    justify-content: center;
    margin-top: 64rpx;
    margin-bottom: 32rpx;
  }

  &__danger-btn {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 20rpx 48rpx;
    background: transparent;
  }

  &__danger-icon {
    font-size: 32rpx;
  }

  &__danger-text {
    font-size: 28rpx;
    color: $hp-red;
  }
}
</style>
