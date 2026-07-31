/**
 * 认证相关 API
 * 对应 Flutter 端 ApiClient 的 auth 方法
 */
import request from "@/api/request";
import type { User } from "@/models/user";

interface LoginResponse {
  token: string;
  user: User;
  family: { id: number; name: string; inviteCode: string; parentCode: string };
}

interface RegisterResponse {
  token: string;
  user: User;
}

interface FamilyResponse {
  token: string;
  user: User;
  family: { id: number; name: string; inviteCode: string; parentCode: string };
}

interface ProfileResponse {
  token: string;
  user: User;
}

interface AvatarResponse {
  avatar: string;
}

interface FamilyInfoResponse {
  family: { id: number; name: string; inviteCode: string; parentCode: string };
  members: FamilyMember[];
}

export interface FamilyMember {
  id: number;
  username: string;
  nickname: string;
  role: string;
  coins: number;
  rankScore: number;
  rankTier: string | Record<string, unknown>;
  avatar?: string;
}

interface UpdateMemberRoleResponse {
  member: FamilyMember;
}

interface RemoveMemberResponse {
  removedId: number;
}

interface DashboardOverviewResponse {
  coins: number;
  rankScore: number;
  rankTier: string | Record<string, unknown>;
}

/**
 * 登录
 * POST /api/auth/login
 */
export async function login(username: string, password: string) {
  return request.post<LoginResponse>("/auth/login", { username, password });
}

/**
 * 注册
 * POST /api/auth/register
 */
export async function register(username: string, password: string, nickname: string) {
  return request.post<RegisterResponse>(
    "/auth/register",
    { username, password, nickname }
  );
}

/**
 * 创建家庭
 * POST /api/auth/create-family
 */
export async function createFamily(parentKey: string, familyName: string) {
  return request.post<FamilyResponse>(
    "/auth/create-family",
    { parentKey, familyName }
  );
}

/**
 * 加入家庭
 * POST /api/auth/join
 */
export async function joinFamily(inviteCode: string) {
  return request.post<FamilyResponse>(
    "/auth/join",
    { inviteCode }
  );
}

/**
 * 登出
 * POST /api/auth/logout (如果有的话)
 */
export async function logout() {
  return request.post("/auth/logout");
}

/**
 * 更新个人信息
 * PUT /api/auth/profile
 */
export async function updateProfile(nickname: string) {
  return request.post<ProfileResponse>(
    "/auth/profile",
    { nickname }
  );
}

/**
 * 上传头像
 * POST /api/auth/avatar
 */
export async function uploadAvatar(filePath: string) {
  return request.upload<AvatarResponse>("/auth/avatar", filePath);
}

/**
 * 获取家庭信息
 * GET /api/auth/family-info
 */
export async function getFamilyInfo() {
  return request.get<FamilyInfoResponse>("/auth/family-info");
}

/**
 * 获取家庭成员列表
 * GET /api/auth/members
 */
export async function getMembers() {
  return request.get<{ members: FamilyMember[] }>("/auth/members");
}

/**
 * 更新家庭名称
 * PUT /api/auth/family
 */
export async function updateFamilyName(familyName: string) {
  return request.put<{ success: boolean; familyName: string }>(
    "/auth/family",
    { familyName }
  );
}

/**
 * 更新成员角色
 * PUT /api/auth/members/:id/role
 */
export async function updateMemberRole(memberId: number, role: string) {
  return request.put<UpdateMemberRoleResponse>(
    `/auth/members/${memberId}/role`,
    { role }
  );
}

/**
 * 移除成员
 * DELETE /api/auth/members/:id
 */
export async function removeMember(memberId: number) {
  return request.delete<RemoveMemberResponse>(`/auth/members/${memberId}`);
}

/**
 * 获取孩子进度（家长首页仪表盘）
 * GET /api/rank/children-progress
 */
export async function getChildrenProgress() {
  return request.get<{ children: Record<string, unknown>[] }>("/rank/children-progress");
}

/**
 * 获取每日复盘数据
 * GET /api/rank/review?month=YYYY-MM
 */
export async function getReview(month: string) {
  return request.get<Record<string, unknown>>(`/rank/review?month=${month}`);
}

/**
 * 获取家庭扭蛋配置
 * GET /api/magicbox/config
 */
export async function getGachaConfig() {
  return request.get<{ config: Record<string, unknown> }>("/magicbox/config");
}

/**
 * Dashboard Overview - 用于验证 token
 * GET /api/dashboard/overview
 */
export async function getDashboardOverview() {
  return request.get<DashboardOverviewResponse>(
    "/dashboard/overview"
  );
}
