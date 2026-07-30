# 更新日志

> 记录产品开发计划与产品文档的所有变更。每次迭代中如有更新，需同步更新此处、`DEVELOPMENT_PLAN.md` 和 `PRODUCT_DOCUMENT.md`。

---

## [Unreleased]

### 修复: Tab 选项卡样式统一 + 排行榜段位显示中文 (2026-07-29)

**问题 1**: BOSS 战场、排行榜等页面使用 `ph-tab-bar` 组件（下划线指示器样式），与"我的待办"页面的胶囊样式不一致，影响视觉统一性。

**问题 2**: 排行榜中玩家昵称下方显示英文段位值（如 `bronze`），而非中文段位名称（如 `🥉 青铜`）。

**修复**:
- `pages/parent/battle/index.vue` — 移除 `ph-tab-bar`，改用内联胶囊样式 Tab；昵称下方显示中文段位
- `pages/child/battle/index.vue` — 同上
- `pages/parent/rank/index.vue` — 同上
- `pages/child/rank/index.vue` — 同上
- `pages/child/home/index.vue` — 同上
- `pages/child/profile/index.vue` — 使用集中式段位映射函数
- `models/boss.ts` — `BossDamageEntry` 接口新增 `rankTier?` 字段，解析函数同步更新
- `config/game.ts` — 新增 `RANK_TIER_LABELS` 映射表和 `getRankTierLabel()` 工具函数
- `docs/DEVELOPMENT_CONVENTIONS.md` — 新增 §8 UI 组件规范和 §9 显示文本本地化规范

### 修复: parent/battle 和 parent/rank 页面导入名冲突 (2026-07-05)

**问题**: `pages/parent/battle/index.vue` 和 `pages/parent/rank/index.vue` 中同时导入了 `@/custom-tab-bar/index.vue` 和 `@/components/ph-tab-bar/ph-tab-bar.vue`，两者都使用了 `CustomTabBar` 作为本地导入名，导致 Vue 编译器报错 "Identifier 'CustomTabBar' has already been declared"。

**修复**:
- `pages/parent/battle/index.vue` — ph-tab-bar 导入名从 `CustomTabBar` 改为 `PhTabBar`
- `pages/parent/rank/index.vue` — 同上
- `docs/DEVELOPMENT_CONVENTIONS.md` — 新增 §6.2 导入命名冲突规范，明确两个组件的导入名约定

### 修复: 登录/注册页布局问题 — logo 与垂直居中 (2026-07-04)

**问题 1**: logo 使用 `<view>` 包裹 emoji，在小程序中渲染异常；`padding-top: 80rpx` 使内容偏上，未垂直居中。
**问题 2**: 注册页同样存在 logo 渲染和布局偏上的问题。

**修复**:
- `pages/login/login.vue` — logo 从 `<view>` 改为 `<text>`；新增 `.content-center` 容器（flex + justify-content: center）实现垂直居中；移除无效的 `float` 动画
- `pages/register/register.vue` — 同上修复

### 修复: pages.json tabBar 页面未注册路由 (2026-07-04)

**问题**: tabBar 引用了 5 个孩子端页面路径（`pages/child/*`），但这些路径没有在 `pages` 数组中注册，导致编译报错 "need in pages"。

**修复**:
- `pages.json` — 在 `pages` 数组中注册 5 个孩子端 tabBar 页面路由（child/home, child/battle, child/rank, child/shop, child/profile）

---

### 修复: App.vue onLaunch 登录态恢复竞态问题 (2026-07-04)

### Phase 3: 家长端核心 — TypeScript 编译错误全部修复 (2026-07-04)

**配置层**
- `config/errors.ts` — `AppErrorMessages` 新增 5 个 Boss 相关 key（CREATE/UPDATE/END/REFRESH/DELETE_BOSS_FAILED）
- `config/game.ts` — 新增 `CARD_TYPE_LABELS` 导出

**Store 层**
- `stores/boss.ts` — `parseBoss` map 类型转换修复；`createBoss` 参数改为完整类型定义

**页面层（12 个文件）**
- `pages/cards/edit/index.vue` — `route` 改用 `onLoad` + `routeQuery` ref；`showPickerTime` 改为 `uni.chooseDate`；`parseTaskCard` 参数类型修复
- `pages/cards/manage/index.vue` — SCSS 变量 `$textDisabled/$textPrimary` 改为内联色值；`parseTaskCard` 类型转换修复
- `pages/parent/home/index.vue` — `loadCurrent` 改为 `loadBoss`；`ChildInfo` 类型 `as unknown as` 转换
- `pages/family-manage/index.vue` — SCSS 变量 `$accentCyan/$accentOrange/$hpRed` 改为内联色值；`currentUser.isParent` 改为 `currentUser?.role === 'parent'`
- `pages/boss-manage/index.vue` — `ComputedRef.filter` 拆分为 `allBossesList.value.filter`；`boss.hpPercent` 改用 `getHpPercent(boss)` 函数；`boss.difficulty` 添加默认值
- `pages/pending/index.vue` — `PendingRedemption` 新增可选 `status` 字段
- `pages/child/shop/index.vue` — `onRedeem` 参数类型添加 `name?` 字段
- `pages/child/battle/index.vue` — SCSS 变量 `$accent-red/$accent-green/$accent-cyan` 改为内联色值
- `components/boss-card/boss-card.vue` — SCSS 变量 `$accent-red/$accent-green/$accent-cyan` 改为内联色值

**编译验证**: `npx vue-tsc --noEmit` 零错误 ✅
**构建验证**: `uni build -p mp-weixin` DONE Build complete. ✅

### 构建修复 (2026-07-04)
- `pages.json` — 移除 20 个不存在页面的路由注册（Phase 4 未实现页面），保留 Phase 3 已完成的 6 个页面
- `pages.json` — 关闭 `easycom.autoscan`，改用显式声明避免与 `@dcloudio/uni-components` 内置组件冲突
- `pages.json` — 修复 `pages/parent/home/index` 重复注册
- 重命名 `components/custom-tab-bar` → `components/ph-tab-bar`，消除与 uni-app 官方组件的 easycom 冲突
- `uni.scss` — 新增 `$hp-bar-bg` 和 `$hp-bar-slot` SCSS 变量（boss-manage 页面使用）
- 更新 3 个 child 页面的 `custom-tab-bar` 引用为 `ph-tab-bar`

---

## [1.2.0] - 2026-07-03

### Phase 2: 孩子端核心 ✅

**数据模型层 (models/)**
- 新建 `models/card.ts` — TaskCard, CardAssignment, AssignmentWithCard 接口 + 解析函数
- 新建 `models/boss.ts` — Boss, BossDamageEntry 接口 + hpPercent/damageDealt/isDefeated 辅助函数
- 新建 `models/shop.ts` — ShopItem, Redemption, CoinTransaction 接口 + 解析函数
- 新建 `models/magicBox.ts` — GachaConfig, MagicBox, BoxOpeningResult, Voucher 接口 + 解析函数
- 新建 `models/checkin.ts` — CheckinMilestone, CheckinCalendar, DailyDetail, MonthlyReview 接口
- 新建 `models/rank.ts` — LeaderboardEntry, RankTierConfig, ChildProgress 接口

**API 封装层 (api/)**
- 新建 `api/cards.ts` — 卡牌 CRUD + 按类型查询 + 任务提交/审核/驳回/撤回
- 新建 `api/boss.ts` — 当前 BOSS + 排行 + 创建/编辑/删除/结束/刷新
- 新建 `api/shop.ts` — 商品列表 + 兑换 + 扭蛋购买 + 兑换记录
- 新建 `api/rank.ts` — 排行榜 + 孩子进度 + 复盘 + 流水 + 段位配置
- 新建 `api/checkin.ts` — 签到状态 + 日历 + 配置管理
- 新建 `api/magicBox.ts` — 扭蛋库存 + 开箱 + 购买 + 兑换券
- 新建 `api/config.ts` — Dashboard 总览 + 趋势 + 用户信息更新

**Store 状态层 (stores/)**
- 新建 `stores/card.ts` — 任务分配状态 + 提交/撤回/审核操作
- 新建 `stores/boss.ts` — BOSS 状态 + HP 百分比 + 排行
- 新建 `stores/shop.ts` — 商品列表 + 兑换操作
- 新建 `stores/rank.ts` — 积分榜/金币榜状态
- 新建 `stores/checkin.ts` — 签到状态 + 日历数据
- 新建 `stores/magicBox.ts` — 扭蛋库存 + 开箱 + 兑换券

**通用组件 (components/)**
- 新建 `components/task-card/task-card.vue` — 任务卡片（表情+标题+奖励+状态徽章）
- 新建 `components/boss-card/boss-card.vue` — BOSS 卡片（HP 条+难度+状态+倒计时）
- 新建 `components/custom-tab-bar/custom-tab-bar.vue` — 药丸形 Tab 切换
- 新建 `components/profile-header/profile-header.vue` — 用户信息头（头像+统计行）
- 新建 `components/checkin-milestone/checkin-milestone.vue` — 签到里程碑时间线
- 新建 `components/empty-state/empty-state.vue` — 空状态占位

**孩子端页面 (pages/child/)**
- 新建 `pages/child/home/index.vue` — 孩子首页（个人信息+任务列表+签到里程碑）
- 新建 `pages/child/battle/index.vue` — BOSS 战场（BOSS 卡片+伤害排行）
- 新建 `pages/child/rank/index.vue` — 排行榜（积分榜/金币榜切换）
- 新建 `pages/child/shop/index.vue` — 商城（商品网格+兑换/购买）
- 新建 `pages/child/profile/index.vue` — 个人资料（头像+统计+菜单入口）

**配置更新**
- 更新 `pages.json` — 孩子端 5 tab tabBar（主页/战斗/排行/商城/我的）
- 更新 `App.vue` — 登录态恢复时孩子端使用 `switchTab` 跳转
- 更新 `stores/auth.ts` — 新增 `updateProfile` 方法

### 变更日志

## [1.1.0] - 2026-07-02

### Phase 0: 基础设施搭建 ✅
- 重写 `uni.scss` — 赛博朋克深色主题变量（背景、文字、强调色、语义色）
- 新建 `utils/constants.ts` — API_BASE_URL、ERROR_CODES、GAME_CONSTANTS、段位/连击/难度配置
- 新建 `utils/storage.ts` — uni.storage 封装 + STORAGE_KEYS 常量
- 新建 `utils/toast.ts` — showToast/showLoadingToast 封装（4种类型）
- 新建 `utils/debounce.ts` — 按钮防抖 Hook（useDebounce）
- 新建 `api/request.ts` — uni.request 封装：token 注入、响应拦截、401 自动登出、统一错误提示
- 新建 `api/auth.ts` — 认证相关 API（login/register/createFamily/joinFamily/getFamilyInfo 等）
- 新建 `models/user.ts` — User、FamilyMember 接口 + parseUser 解析函数
- 新建 `stores/auth.ts` — 认证状态管理（替代 Riverpod StateNotifier）
- 修改 `App.vue` — 全局样式 reset + onLaunch 恢复登录态
- 修改 `pages.json` — 注册所有认证页面路由 + 深色全局样式
- 修改 `tsconfig.json` — 添加 `@/*` 路径别名
- 修改 `vite.config.ts` — 添加 `@` 别名配置

### Phase 1: 认证 + 家庭流 ✅
- 重写 `pages/index/index.vue` — 赛博朋克品牌启动页（浮动 logo + 渐变标题 + 霓虹按钮）
- 重写 `pages/login/login.vue` — 登录表单（账号+密码+密码显隐+防抖+错误提示）
- 新建 `pages/register/register.vue` — 注册表单（昵称+账号+密码+强度指示条）
- 新建 `pages/family/choose-family/index.vue` — 选择家庭方式页（创建/加入两个按钮）
- 新建 `pages/family/create-family/index.vue` — 创建家庭表单 + 成功页（邀请码+复制）
- 新建 `pages/join-family/index.vue` — 加入家庭（6位邀请码输入+错误提示）

### 构建验证
- `npm run build:mp-weixin` 编译通过
- 生成的 `dist/build/mp-weixin/app.json` 包含全部 6 个页面路由
- TypeScript 零错误（`npx tsc --noEmit`）

### 认证流程闭环
```
启动 App → 恢复 token → 验证有效性 → 登录/注册 → 选择家庭 → 创建/加入 → 首页
```

---

## [1.0.0] - 2026-07-02

### 新增
- 初始版本：基于产品文档和技术文档制定完整开发计划
- 5 阶段路线图：基础设施 → 认证+家庭 → 孩子端核心 → 家长端核心 → 进阶功能
- 完整文件清单：~44 页面、9 API 模块、7 数据模型、5 Store、6 工具、6 通用组件
- 关键技术决策：双 tabBar 方案、登录态管理、图片上传、rpx 单位策略、组件复用模式
- 5 周开发排期（Day-by-Day 分解）
- 认证流程详细设计（启动→登录→注册→家庭→首页）
- 孩子端/家长端页面布局线框图
- 任务审核、商城兑换、扭蛋系统、签到系统、每日复盘业务流程图
