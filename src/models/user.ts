/**
 * 用户模型
 * 对应 Flutter 端的 User 模型
 */

export interface User {
  id: number;
  familyId: number;
  username: string;
  role: 'parent' | 'child';
  nickname: string;
  avatar?: string;
  coins: number;
  rankScore: number;
  rankTier: string;
  familyName?: string;
  inviteCode?: string;
  parentCode?: string;
}

export interface FamilyMember {
  id: number;
  username: string;
  nickname: string;
  role: 'parent' | 'child';
  coins: number;
  rankScore: number;
  rankTier: string;
  avatar?: string;
}

/**
 * 从后端响应数据解析 User
 * 后端返回 snake_case，这里做兼容
 */
export function parseUser(data: Record<string, unknown>): User {
  return {
    id: data.id as number,
    familyId: (data.family_id ?? data.familyId ?? 0) as number,
    username: data.username as string,
    role: (((data.role as string) === 'parent' || (data.role as string) === 'child') ? (data.role as string) : 'child') as 'parent' | 'child',
    nickname: (data.nickname || data.username) as string,
    avatar: data.avatar as string | undefined,
    coins: (data.coins ?? 0) as number,
    rankScore: (data.rank_score ?? data.rankScore ?? 0) as number,
    rankTier: (data.rank_tier ?? data.rankTier ?? 'bronze') as string,
    familyName: (data.family_name ?? data.familyName) as string | undefined,
    inviteCode: (data.invite_code ?? data.inviteCode) as string | undefined,
    parentCode: (data.parent_code ?? data.parentCode) as string | undefined,
  };
}
