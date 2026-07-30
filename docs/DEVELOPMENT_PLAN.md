---
name: development-plan
description: 勇者乐园小程序开发计划 — 分阶段实施路线、文件清单、用户旅程
version: 1
created: 2026-07-02
lastUpdated: 2026-07-29
phase: 3
status: in-progress
---

# 勇者乐园 (Habit Battle Camp) — 开发计划

> 从 Flutter (habit-battle) 迁移至 uni-app Vue 3 微信小程序
> 后端 API 不变 (Node.js/Express + SQLite)
> 基准: 2026-07-02 | 项目目前为裸骨架

---

## 总体路线图

```
Phase 0: 基础设施搭建       --> 项目可编译运行，主题/工具链就绪 ✅
Phase 1: 认证 + 家庭流     --> 注册→建/加入家庭→进入首页（完整闭环）✅
Phase 2: 孩子端核心         --> 孩子能跑通"看任务→提交→审核→打BOSS→换奖励"
Phase 3: 家长端核心         --> 家长能跑通"建卡牌→审任务→管理BOSS"
Phase 4: 进阶功能           --> 商城/扭蛋/签到/排行/复盘/配置全量上线
```

---

## Phase 0: 基础设施搭建 ✅ COMPLETED

**目标**: 项目可编译运行，深色赛博朋克主题生效，工具链就绪，可支撑后续所有页面开发。

### 0.1 样式与主题 ✅

| 文件 | 状态 | 说明 |
|------|------|------|
| `src/uni.scss` | ✅ 完成 | 赛博朋克主题变量（替换 uni 默认浅色主题） |
| `src/pages.json` | ✅ 完成 | 全局深色样式，navigationBar 配色 |
| `src/App.vue` | ✅ 完成 | 全局样式 reset + 深色背景 |

### 0.2 工具函数 (utils/) ✅

| 文件 | 内容 | 对应 Flutter |
|------|------|-------------|
| `src/utils/constants.ts` | API_BASE_URL, ERROR_CODES, GAME_CONSTANTS | `app_constants.dart` |
| `src/utils/storage.ts` | set/get/remove/clearStorageSync + STORAGE_KEYS | `shared_preferences` |
| `src/utils/toast.ts` | showToast/showLoadingToast 封装 | `toast.dart` |
| `src/utils/debounce.ts` | 按钮防抖 Hook（useDebounce） | `debounce_button.dart` |

### 0.3 网络层 (api/) ✅

| 文件 | 内容 | 对应 Flutter |
|------|------|-------------|
| `src/api/request.ts` | uni.request 封装：token 注入、响应拦截(code/msg/data)、401 跳转 | `api_client.dart` |
| `src/api/auth.ts` | login, register, createFamily, joinFamily, getFamilyInfo 等 | `ApiClient` auth methods |

### 0.4 数据模型 (models/) ✅

| 文件 | 接口定义 | 对应 Flutter |
|------|---------|-------------|
| `src/models/user.ts` | User, FamilyMember | `user.dart` |

### 0.5 全局状态 (stores/) ✅

| 文件 | 职责 | 对应 Flutter |
|------|------|-------------|
| `src/stores/auth.ts` | user, token, role, family, isLoading, error | `auth_provider.dart` |

### 0.6 入口文件 ✅

| 文件 | 状态 |
|------|------|
| `src/main.ts` | ✅ 完成 |
| `src/App.vue` | ✅ 完成（onLaunch 恢复登录态） |
| `src/pages.json` | ✅ 完成（注册所有认证页面路由） |
| `src/manifest.json` | ✅ 已有微信 appid |

### 可测试用户旅程 ✅

> 打开小程序 → 看到深色赛博朋克风格的启动页 → 跳转到登录页 → 输入账号密码 → 登录成功 → 看到路由跳转

---

## Phase 1: 认证 + 家庭流 ✅ COMPLETED

**目标**: 完整的注册→创建/加入家庭→角色选择→进入首页流程闭环。

### 1.1 页面 ✅

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 启动页 | `pages/index/index` | ✅ 完成 | 品牌展示 + "开启冒险" 按钮 |
| 登录页 | `pages/login/login` | ✅ 完成 | 账号+密码表单，支持注册跳转 |
| 注册页 | `pages/register/register` | ✅ 完成 | 昵称+账号+密码+强度指示条 |
| 选择家庭页 | `pages/family/choose-family/index` | ✅ 完成 | "创建家庭" / "加入家庭" 两个按钮 |
| 创建家庭页 | `pages/family/create-family/index` | ✅ 完成 | 家庭名称 + 家长密钥 |
| 加入家庭页 | `pages/join-family/index` | ✅ 完成 | 6位邀请码输入 |

### 1.2 认证流程

```
启动 App
  ├─ 本地有 token + user?
  │   ├─ 是 → 调用 /dashboard/overview 验证 token
  │   │   ├─ 成功 → 进入首页
  │   │   └─ 失败 → 清除本地 → 跳转登录页
  │   └─ 否 → 跳转登录页

登录页 → POST /auth/login → 成功 → 根据 role 跳转
注册页 → POST /auth/register → 成功 → 跳转选择家庭页
选择家庭 → 创建/加入家庭 → 成功 → 根据 role 跳转首页
```

### 可测试用户旅程 ✅

> 1. 新用户: 启动页 → 登录页 → 注册 → 选择家庭 → 创建家庭 → 成功
> 2. 已有账号: 登录页 → 输入账号密码 → 登录成功 → 进入首页
> 3. Token 恢复: 登录后关闭再打开 → 自动登录

---

## Phase 2: 孩子端核心 ✅ COMPLETED

**目标**: 孩子能跑通完整流程：查看任务 → 提交打卡 → 家长审核 → 获得金币/伤害 → 打 BOSS → 查看排行。

### 2.1 tabBar 页面 ✅

| 页面 | 路径 | TabBar | 说明 | 状态 |
|------|------|--------|------|------|
| 孩子首页 | `pages/child/home/index` | 主页 (tab 0) | 个人信息、今日/本周/本月任务列表、签到状态卡片 | ✅ 完成 |
| BOSS 战场 | `pages/child/battle/index` | 战斗 (tab 1) | BOSS HP 条、伤害排行、今日攻击次数 | ✅ 完成 |
| 排行榜 | `pages/child/rank/index` | 排行 (tab 2) | 积分榜/金币榜 Tab 切换 | ✅ 完成 |
| 商城 | `pages/child/shop/index` | 商城 (tab 3) | 商品列表、兑换按钮 | ✅ 完成 |
| 我的 | `pages/child/profile/index` | 我的 (tab 4) | 个人信息编辑、金币余额、菜单入口 | ✅ 完成 |

### 2.2 数据模型层 ✅

| 文件 | 内容 |
|------|------|
| `models/card.ts` | TaskCard, CardAssignment, AssignmentWithCard + parse 函数 |
| `models/boss.ts` | Boss, BossDamageEntry + hpPercent/damageDealt 辅助 |
| `models/shop.ts` | ShopItem, Redemption, CoinTransaction + parse 函数 |
| `models/magicBox.ts` | GachaConfig, MagicBox, BoxOpeningResult, Voucher |
| `models/checkin.ts` | CheckinMilestone, CheckinCalendar, MonthlyReview |
| `models/rank.ts` | LeaderboardEntry, RankTierConfig, ChildProgress |

### 2.3 API 封装层 ✅

| 文件 | 内容 |
|------|------|
| `api/cards.ts` | 卡牌 CRUD + 按类型查询 + 提交/审核/驳回/撤回 |
| `api/boss.ts` | 当前 BOSS + 排行 + 创建/编辑/删除/结束/刷新 |
| `api/shop.ts` | 商品列表 + 兑换 + 扭蛋购买 + 兑换记录 |
| `api/rank.ts` | 排行榜 + 孩子进度 + 复盘 + 流水 |
| `api/checkin.ts` | 签到状态 + 日历 + 配置管理 |
| `api/magicBox.ts` | 扭蛋库存 + 开箱 + 购买 + 兑换券 |
| `api/config.ts` | Dashboard 总览 + 趋势 + 用户信息 |

### 2.4 Store 状态层 ✅

| 文件 | 内容 |
|------|------|
| `stores/card.ts` | 任务分配状态 + 提交/撤回/审核操作 |
| `stores/boss.ts` | BOSS 状态 + HP 百分比 + 排行 |
| `stores/shop.ts` | 商品列表 + 兑换操作 |
| `stores/rank.ts` | 积分榜/金币榜状态 |
| `stores/checkin.ts` | 签到状态 + 日历数据 |
| `stores/magicBox.ts` | 扭蛋库存 + 开箱 + 兑换券 |

### 2.5 通用组件 ✅

| 组件 | 文件 | 说明 |
|------|------|------|
| TaskCard | `components/task-card/` | 任务卡片（表情+标题+奖励+状态徽章） |
| BossCard | `components/boss-card/` | BOSS 卡片（HP 条+难度+状态） |
| CustomTabBar | `components/custom-tab-bar/` | 药丸形 Tab 切换 |
| ProfileHeader | `components/profile-header/` | 用户信息头（头像+统计行） |
| CheckinMilestone | `components/checkin-milestone/` | 签到里程碑时间线 |
| EmptyState | `components/empty-state/` | 空状态占位 |

### 2.6 配置更新 ✅

- 更新 `pages.json` — 孩子端 5 tab tabBar（主页/战斗/排行/商城/我的）
- 更新 `App.vue` — 孩子端使用 `switchTab` 跳转
- 更新 `stores/auth.ts` — 新增 `updateProfile` 方法

---

## Phase 3: 家长端核心 ✅ TS 错误全部修复

### 3.1 TS 编译修复 (2026-07-04)

所有 `vue-tsc --noEmit` 错误已清零。修复清单：

| 问题 | 文件 | 修复 |
|------|------|------|
| `AppErrorMessages` 缺少 Boss 相关 key | `config/errors.ts` | 新增 CREATE/UPDATE/END/REFRESH/DELETE_BOSS_FAILED |
| `parseBoss` 类型不匹配 | `stores/boss.ts` | `.map((b: unknown) => parseBoss(b as Record<string, unknown>))` |
| `createBoss` 参数类型 | `stores/boss.ts` | 改为完整类型定义 |
| `CARD_TYPE_LABELS` 缺失 | `config/game.ts` | 新增导出 |
| `route` 未定义 | `pages/cards/edit/index.vue` | 改用 `onLoad` + `routeQuery` ref |
| `showPickerTime` 不存在 | `pages/cards/edit/index.vue` | 改用 `uni.chooseDate` |
| `parseTaskCard` 参数类型 | `pages/cards/edit/index.vue` | `as unknown as Record<string, unknown>` |
| `$textDisabled/$textPrimary` SCSS 变量 | `pages/cards/manage/index.vue` | 改用内联十六进制色值 |
| `parseTaskCard` 类型 | `pages/cards/manage/index.vue` | 添加 `as Record<string, unknown>` 转换 |
| `loadCurrent` 不存在 | `pages/parent/home/index.vue` | 改为 `loadBoss` |
| `ChildInfo` 类型转换 | `pages/parent/home/index.vue` | `as unknown as ChildInfo[]` |
| `$accentCyan/$accentOrange` SCSS 变量 | `pages/family-manage/index.vue` | 改用内联色值 |
| `currentUser.isParent` 不存在 | `pages/family-manage/index.vue` | 改为 `currentUser?.role === 'parent'` |
| `PendingRedemption.status` 缺失 | `pages/pending/index.vue` | 新增可选 `status?` 字段 |
| `ComputedRef.filter` 不存在 | `pages/boss-manage/index.vue` | 拆分为 `allBossesList` + `.value.filter` |
| `boss.hpPercent` 不存在 | `pages/boss-manage/index.vue` | 改用 `getHpPercent(boss)` 函数 |
| `boss.difficulty` undefined | `pages/boss-manage/index.vue` | 添加 `|| '1'` 默认值 |
| `$accent-red/$accent-cyan` SCSS 变量 | `components/boss-card/boss-card.vue` | 改用内联色值 |
| `$accent-red/$accent-cyan` SCSS 变量 | `pages/child/battle/index.vue` | 改用内联色值 |
| `item.name` 类型缺失 | `pages/child/shop/index.vue` | 添加 `name?: string` |

### 3.2 登录态恢复竞态修复 (2026-07-04)

| 问题 | 文件 | 修复 |
|------|------|------|
| `init()` 同步执行，`validateToken()` 异步未 await | `stores/auth.ts` | `init()` 改为 `async`，`validateToken()` 返回 `Promise<boolean>` |
| `onLaunch` 在 token 验证前就判断 `isLoggedIn` | `App.vue` | `onLaunch` 改为 `async`，`await authStore.init()` |

### 3.3 登录/注册页布局修复 (2026-07-04)

| 问题 | 文件 | 修复 |
|------|------|------|
| logo emoji 使用 `<view>` 包裹，小程序渲染异常 | `pages/login/login.vue` | 改为 `<text>` 标签 |
| 内容偏上，未垂直居中 | `pages/login/login.vue` | 新增 `.content-center` flex 容器，`justify-content: center` 垂直居中 |
| 无效的 `float` 动画 | `pages/login/login.vue` | 移除 |
| 注册页同样问题 | `pages/register/register.vue` | 同上修复 |

### 3.5 导入名冲突修复 (2026-07-05)

| 问题 | 文件 | 修复 |
|------|------|------|
| `custom-tab-bar` 和 `ph-tab-bar` 导入名同为 `CustomTabBar` | `pages/parent/battle/index.vue`, `pages/parent/rank/index.vue` | ph-tab-bar 导入名改为 `PhTabBar` |
| 缺乏导入命名约定 | `docs/DEVELOPMENT_CONVENTIONS.md` | 新增 §6.2 规范，明确两个组件的导入名约定 |

### 3.4 tabBar 页面路由注册 (2026-07-04)

| 问题 | 文件 | 修复 |
|------|------|------|
| tabBar 引用 5 个孩子端页面但未注册路由 | `pages.json` | 在 `pages` 数组中注册 child/home, child/battle, child/rank, child/shop, child/profile |

---

## Phase 4: 进阶功能

**目标**: 商城/扭蛋/签到/排行/复盘/金币流水全量上线，产品功能完整。

---

## 完整文件清单

### 基础设施 (Phase 0) ✅

```
src/
├── uni.scss                          # ✅ [重写] 赛博朋克主题变量
├── App.vue                           # ✅ [修改] 全局样式 + 启动恢复
├── main.ts                           # ✅ [修改] 全局注册
├── pages.json                        # ✅ [修改] 路由 + tabBar
├── utils/
│   ├── constants.ts                  # ✅ [新建] 应用常量
│   ├── storage.ts                    # ✅ [新建] uni.storage 封装 + STORAGE_KEYS
│   ├── toast.ts                      # ✅ [新建] Toast 封装
│   └── debounce.ts                   # ✅ [新建] 按钮防抖 Hook
├── api/
│   ├── request.ts                    # ✅ [新建] uni.request 封装
│   └── auth.ts                       # ✅ [新建] 认证 API
├── models/
│   └── user.ts                       # ✅ [新建] User, FamilyMember
├── stores/
│   └── auth.ts                       # ✅ [新建] 认证状态
└── pages/
    ├── index/index.vue               # ✅ [重写] 启动页
    ├── login/login.vue               # ✅ [重写] 登录页
    ├── register/register.vue         # ✅ [新建] 注册页
    ├── family/choose-family/index.vue # ✅ [新建] 选择家庭页
    ├── family/create-family/index.vue # ✅ [新建] 创建家庭页
    └── join-family/index.vue         # ✅ [新建] 加入家庭页
```

### 文件数量统计

| 类别 | Phase 0 | Phase 1 | Phase 2 | Phase 3 | Phase 4 | 合计 |
|------|---------|---------|---------|---------|---------|------|
| 页面 | 1(重写) | 5 | 5 | 6+13 | 0+7(完善) | ~44 |
| API 文件 | 2 | 0 | 7 | 0 | 0 | 9 |
| Model 文件 | 1 | 0 | 6 | 0 | 0 | 7 |
| Store 文件 | 1 | 0 | 6 | 2 | 0 | 10 |
| Utils 文件 | 4 | 0 | 0 | 0 | 0 | 4 |
| 组件文件 | 0 | 0 | 6 | 0 | 7 | 13 |
| 配置文件 | 4 | 2 | 0 | 0 | 0 | 6 |

---

## 开发顺序建议

```
Week 1: Phase 0-1 基础设施 + 认证
  Day 1: uni.scss + utils (constants, storage, toast, debounce)
  Day 2: api/request.ts + api/auth.ts + models/user.ts
  Day 3: stores/auth.ts + App.vue + pages.json
  Day 4: 启动页 + 登录页 + 注册页
  Day 5: 选择家庭 + 创建家庭 + 加入家庭 + 联调测试

Week 2: Phase 2 孩子端核心
  Day 1-2: 孩子首页 (任务列表 + 签到卡片)
  Day 3:   BOSS 战场
  Day 4:   排行榜 + 商城
  Day 5:   孩子个人资料 + 独立页面 (金币流水/兑换记录/签到日历)

Week 3: Phase 3 家长端核心
  Day 1-2: 家长首页 + 卡牌管理/编辑
  Day 3:   我的待办 (审核 + 兑换确认)
  Day 4:   BOSS 管理 + 家庭管理
  Day 5:   系统配置页面群

Week 4: Phase 4 进阶功能
  Day 1-2: 扭蛋系统 (库存 + 开蛋 + 商城 + 兑换券)
  Day 3:   每日复盘 (月历 + 汇总)
  Day 4-5: 组件完善 + 联调 + Bug 修复
```

---

## 关键技术决策

### 1. 双 tabBar 方案

微信小程序不支持运行时切换 tabBar。方案：
- **家长端**: 4 个 tabBar 页 (主页/战斗/排行/我的)，商城通过首页入口进入
- **孩子端**: 5 个 tabBar 页 (主页/战斗/排行/商城/我的)

### 2. 登录态管理

- token 存储在 `uni.setStorageSync('auth_token')`
- user 对象存储在 `uni.setStorageSync('current_user')`
- App.vue onLaunch 时读取并验证
- request.ts 拦截器自动注入 Authorization header
- 401 响应自动清除本地 + 跳转登录

### 3. 样式单位

- 全部使用 `rpx` (750rpx = 屏幕宽度)

---

## 变更日志

### v1.2 (2026-07-03) - Phase 2 完成
- 完成 Phase 2 孩子端核心（5 个 tabBar 页面全部开发完成）
- 新建 6 个数据模型文件（card/boss/shop/magicBox/checkin/rank）
- 新建 7 个 API 模块（cards/boss/shop/rank/checkin/magicBox/config）
- 新建 6 个 Store 文件（card/boss/shop/rank/checkin/magicBox）
- 新建 6 个通用组件（task-card/boss-card/custom-tab-bar/profile-header/checkin-milestone/empty-state）
- 更新 pages.json tabBar 配置（孩子端 5 tab）
- 更新 App.vue 路由重定向逻辑（switchTab 跳转孩子端）
- 更新 auth store 新增 updateProfile 方法

### v1.1 (2026-07-02) - Phase 1 完成
- 完成 Phase 0 基础设施搭建（主题、工具链、网络层、模型、状态管理）
- 完成 Phase 1 认证 + 家庭流（6个页面全部开发完成）
- 项目可编译运行（`npm run build:mp-weixin` 通过）
- 完整认证流程：启动页 → 登录 → 注册 → 选择家庭 → 创建/加入家庭
