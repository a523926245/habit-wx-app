# Habit-WX-App — 勇者乐园（微信小程序）

## 项目概述

家庭习惯养成微信小程序，游戏化打 BOSS，让孩子养成好习惯。
从 Flutter 客户端（habit-battle）迁移至 uni-app Vue3 技术栈，目标平台：微信小程序。

**后端 API 不变**：Node.js/Express + SQLite，所有 `/api/*` 接口直接复用。
API Base URL: `https://3000-yaozhaoyanghabitbat-1gr6hl9igpgqhf1558554-1317484434.ap-shanghai.app.tcloudbase.com/api`（开发环境）

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | uni-app Vue3 + TypeScript + Vite |
| 目标平台 | 微信小程序（mp-weixin） |
| 状态管理 | reactive + composables（替代 Riverpod） |
| 网络请求 | uni.request 封装（替代 Dio） |
| 本地存储 | uni.storage（替代 SharedPreferences） |
| 样式 | SCSS（替代 Flutter Widget） |
| 构建 | Vite + @dcloudio/vite-plugin-uni |

---

## 目录结构

```
habit-wx-app/
├── docs/                          # 产品文档 + 技术文档 + 开发计划 + 更新日志
│   ├── PRODUCT_DOCUMENT.md        # 产品需求文档
│   ├── TECHNICAL_DOCUMENT.md      # 后端/API/数据库技术文档
│   ├── DEVELOPMENT_PLAN.md        # 开发计划（分阶段实施路线）
│   └── CHANGELOG.md               # 更新日志（记录所有变更）
├── src/
│   ├── App.vue                    # 根组件
│   ├── main.ts                    # 入口
│   ├── pages.json                 # 路由 + tabBar 配置
│   ├── manifest.json              # 应用配置（appid 等）
│   ├── uni.scss                   # 全局 SCSS 变量
│   ├── static/                    # 静态资源
│   ├── api/                       # 后端 API 封装
│   │   ├── request.ts             # uni.request 封装（拦截器、token 注入）
│   │   ├── auth.ts                # 认证相关 API
│   │   ├── cards.ts               # 卡牌/任务 API
│   │   ├── boss.ts                # BOSS API
│   │   ├── shop.ts                # 商城 API
│   │   ├── rank.ts                # 排行/复盘 API
│   │   ├── checkin.ts             # 签到 API
│   │   ├── magicBox.ts            # 扭蛋 API
│   │   └── config.ts              # 配置 API（段位/连击/BOSS等级）
│   ├── models/                    # 数据模型（TypeScript 接口）
│   │   ├── user.ts                # User, FamilyMember
│   │   ├── card.ts                # TaskCard, CardAssignment
│   │   ├── boss.ts                # Boss, BossDamageEntry
│   │   ├── shop.ts                # ShopItem, Redemption
│   │   ├── magicBox.ts            # GachaConfig, MagicBox, Voucher
│   │   ├── checkin.ts             # CheckinStatus, CheckinCalendar
│   │   └── rank.ts                # RankTier, LeaderboardEntry
│   ├── stores/                    # 全局状态（替代 Riverpod Provider）
│   │   ├── auth.ts                # 认证状态（user, token, role）
│   │   ├── card.ts                # 卡牌/任务状态
│   │   ├── boss.ts                # BOSS 状态
│   │   ├── checkin.ts             # 签到状态
│   │   └── magicBox.ts            # 扭蛋状态
│   ├── config/                    # 配置中心（API、业务常量、游戏配置）
│   │   ├── index.ts               # 统一导出
│   │   ├── api.ts                 # API 地址、超时
│   │   ├── app.ts                 # 错误码、应用限制
│   │   └── game.ts                # 段位、连击、难度、表情选项
│   ├── utils/                     # 工具函数（纯函数 helper）
│   │   ├── storage.ts             # uni.storage 封装（token/user 持久化）
│   │   ├── debounce.ts            # 按钮防抖
│   │   ├── toast.ts               # 顶部提示
│   │   ├── dialog.ts              # 确认/表单弹框
│   │   └── date.ts                # 日期工具（中文本地化）
│   ├── components/                # 通用组件
│   │   ├── app-nav-bar/           # 自定义导航栏（替代 CustomAppBar）
│   │   ├── app-tab-bar/           # Tab 切换组件
│   │   ├── app-dialog/            # 确认/表单弹框（替代 CustomDialog）
│   │   ├── app-toast/             # 顶部提示（替代 AppToast）
│   │   ├── app-loading/           # 加载状态
│   │   └── app-empty/             # 空状态
│   └── pages/                     # 页面（对应产品文档中的页面导航）
│       ├── login/                 # 登录页
│       ├── register/              # 注册页
│       ├── join-family/           # 加入家庭
│       ├── create-family/         # 创建家庭
│       ├── choose-family/         # 选择家庭
│       ├── parent/                # 家长端 tabBar
│       │   ├── home/              # 家长首页
│       │   ├── battle/            # BOSS 战场
│       │   ├── rank/              # 排行榜
│       │   └── profile/           # 个人资料
│       ├── child/                 # 孩子端 tabBar
│       │   ├── home/              # 孩子首页
│       │   ├── battle/            # BOSS 战场
│       │   ├── rank/              # 排行榜
│       │   ├── shop/              # 商城
│       │   └── profile/           # 个人资料
│       ├── cards/                 # 卡牌管理 / 编辑
│       ├── boss-manage/           # BOSS 管理
│       ├── shop/                  # 商城 / 商品编辑 / 兑换记录
│       ├── pending/               # 我的待办（审核）
│       ├── family-manage/         # 家庭管理
│       ├── coins/                 # 金币流水
│       ├── review/                # 每日复盘
│       ├── checkin-calendar/      # 签到日历
│       ├── magic-box/             # 我的扭蛋 / 扭蛋商城
│       ├── voucher/               # 我的兑换券 / 兑换券使用
│       └── settings/              # 系统配置（签到/段位/BOSS等级/连击）
├── docs/
│   ├── PRODUCT_DOCUMENT.md
│   ├── TECHNICAL_DOCUMENT.md
│   ├── DEVELOPMENT_PLAN.md
│   ├── CHANGELOG.md
│   └── DEVELOPMENT_CONVENTIONS.md   # 开发规范（禁止硬编码、TS 类型约定等）
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CLAUDE.md                      # 本文件
```

---

## 开发命令

```bash
# 微信小程序开发
pnpm dev:mp-weixin          # 开发模式
pnpm build:mp-weixin        # 生产构建

# H5 开发（调试用）
pnpm dev:h5
pnpm build:h5
```

> 使用 pnpm 作为包管理器（如未安装：`npm install -g pnpm`）

---

## 核心开发规范

> 详细规范见 [`docs/DEVELOPMENT_CONVENTIONS.md`](../docs/DEVELOPMENT_CONVENTIONS.md)，以下为必须遵守的核心约定。

### 0. 核心约定（必读）

**禁止硬编码魔法值：**
- 状态码（200, 10007, 10008）→ 使用 `ErrorCode.SUCCESS` / `ErrorCode.FORBIDDEN` / `ErrorCode.UNAUTHORIZED`
- 错误提示文本 → 使用 `ErrorMessages[ErrorCode.XXX]` 或 `NetworkMessages[NetworkError.XXX]`
- API 地址 → 使用 `API_BASE_URL`
- 以上全部定义在 `src/config/errors.ts`，统一从 `@/config/errors` 导入

**禁止使用 `any`：**
- 泛型默认 `unknown`，回调参数定义明确接口（`RequestSuccessResult<T>`、`UploadSuccessResult` 等）

**配置文件职责：**
- `src/config/` — 所有常量、枚举、映射表、环境配置
- `src/utils/` — 纯工具函数（无业务语义的 helper）

**编码规范：**
- 函数必须添加注释
- 关键代码必须添加注释

### 1. 页面开发优先级

按产品文档"页面导航结构"章节，分阶段开发：

**Phase 1 — 认证 + 家庭**（登录流程闭环）
- 登录页 → 注册页 → 创建家庭 → 加入家庭 → 选择家庭

**Phase 2 — 孩子端核心**（孩子能跑通完整流程）
- 孩子首页（任务列表 + 签到）→ BOSS 战场 → 提交/撤回任务
- 排行榜 → 商城 → 个人资料

**Phase 3 — 家长端核心**（家长管理闭环）
- 家长首页 → 卡牌管理 → 我的待办（审核）→ BOSS 管理

**Phase 4 — 进阶功能**
- 签到日历 → 扭蛋系统 → 兑换券 → 每日复盘 → 金币流水
- 系统配置 → 家庭管理 → 兑换记录

### 2. API 调用规范

- 所有后端接口封装在 `src/api/` 下，页面不直接调用 `uni.request`
- 请求封装 `src/api/request.ts` 处理：
  - Token 注入（从 uni.getStorageSync 读取）
  - 响应拦截（解析 `{code, msg, data}` 格式）
  - 401 自动跳转登录
  - 统一错误提示
- 后端错误码：200=成功, 10001=参数错误, 10005=重复, 10007=权限不足, 10008=认证失败

### 3. 状态管理规范

- 每个核心模块一个 store 文件（`src/stores/*.ts`）
- 使用 `reactive` + 导出方法，替代 Flutter 的 Riverpod StateNotifier
- Token 和用户信息持久化到 uni.storage
- store 方法命名：`loadXxx()` / `saveXxx()` / `clearXxx()`

### 4. 数据模型规范

- 每个模型一个文件，使用 TypeScript interface
- 字段名与后端 JSON 保持一致（snake_case），不做强转 camelCase
- 需要时提供 getter 辅助（如 `user.isParent`、`boss.hpPercent`）

### 5. 样式规范

- 使用 SCSS，主题色从 `uni.scss` 定义
- 深色赛博朋克主题：
  - 背景: `#0B0C1F` → `#16172E`
  - 强调色: 霓虹青 `#6AD6FF`、霓虹橙 `#FF6B35`
  - 卡片背景: `#1A1B3E`
  - 文字主色: `#E8E8F0`
- 单位使用 `rpx`（响应式像素）
- 参考 Flutter 端的 `AppColors` 定义，在 `uni.scss` 中建立对应

### 5.1 间距规范（必读）

所有页面的**水平内边距**统一使用 **32rpx**，确保视觉一致性。

| 层级 | 标准值 | 说明 |
|------|--------|------|
| 页面内容水平 padding | `32rpx` | 页面级容器/区域的左右内边距 |
| 区块间距 | `32rpx` | 页面内各主要区块之间的垂直间距 |
| 区块标题 margin-bottom | `32rpx` | 分区标题下方间距 |
| 菜单项水平 padding | `32rpx` | 列表项内部左右内边距 |
| 分隔区域水平 padding | `32rpx` | 如退出登录等独立区块的水平内边距 |

**禁止事项：**
- ❌ 不要在页面级容器使用 `16rpx`、`24rpx`、`48rpx`、`64rpx` 等非常规水平 padding
- ❌ 不要在各区块标题使用 `8rpx`、`16rpx` 等非标准 margin-bottom
- ❌ 不要在菜单项使用 `24rpx` 等非标准水平 padding

**正确写法示例：**
```scss
/* ✅ 正确 */
.page-content { padding: 0 32rpx; }
.section-title { margin-bottom: 32rpx; }
.menu-item { padding: 28rpx 32rpx; }

/* ❌ 错误 */
.page-content { padding: 0 16rpx; }    /* 水平间距过小 */
.page-content { padding: 0 48rpx; }    /* 水平间距过大 */
.section-title { margin-bottom: 8rpx; } /* 间距不一致 */
```

> 注意：子元素内部间距（如卡片内文字 padding、图标 margin）可根据实际内容调整，但**页面级和内容区块级的水平 padding 必须统一为 32rpx**。

### 6. 组件开发规范

- 通用组件放 `src/components/`，页面组件放 `src/pages/`
- 组件命名：`app-` 前缀（如 `app-nav-bar`、`app-dialog`）
- 弹框统一使用 `src/components/app-dialog/`，不直接用 `uni.showModal`
- 按钮防抖使用 `src/utils/debounce.ts`

## 文档管理机制

### 文档清单

| 文档 | 路径 | 说明 |
|------|------|------|
| 产品需求 | `docs/PRODUCT_DOCUMENT.md` | 产品功能、页面导航、UI 规范 |
| 技术文档 | `docs/TECHNICAL_DOCUMENT.md` | 后端/API/数据库/业务流程 |
| 开发计划 | `docs/DEVELOPMENT_PLAN.md` | 分阶段实施路线、文件清单、用户旅程 |
| 更新日志 | `docs/CHANGELOG.md` | 所有文档变更记录 |

### 更新规则

**每次迭代中如有变更，必须同步更新以下三份文档：**

1. `docs/DEVELOPMENT_PLAN.md` — 更新计划状态、文件清单、阶段进度
2. `docs/PRODUCT_DOCUMENT.md` — 如有产品需求变更，更新对应章节
3. `docs/CHANGELOG.md` — 在 `[Unreleased]` 段落记录本次变更

**DEVELOPMENT_PLAN.md 头部元数据字段：**
- `version`: 版本号
- `created`: 创建日期
- `lastUpdated`: 最后更新日期
- `phase`: 当前实施阶段
- `status`: 状态 (`planned` / `in-progress` / `completed`)

### 文档引用

- **产品需求**：查阅 `docs/PRODUCT_DOCUMENT.md`
- **API/数据库/后端逻辑**：查阅 `docs/TECHNICAL_DOCUMENT.md`
- **开发计划**：查阅 `docs/DEVELOPMENT_PLAN.md`
- **变更记录**：查阅 `docs/CHANGELOG.md`
- **Flutter 参考实现**：查阅 `K:\workspace-rd\projects\habit-battle\habit_battle\lib\`（仅参考逻辑，不复制代码）

---

## 与 Flutter 端的映射关系

| Flutter | 小程序 | 说明 |
|---------|--------|------|
| `app.dart` 路由 | `pages.json` | 路由表直接映射 |
| `StatefulShellRoute` | `tabBar` 配置 | 家长/孩子端各一套 tabBar |
| `Riverpod StateNotifier` | `stores/*.ts` | reactive + 导出方法 |
| `Dio` | `api/request.ts` | uni.request 封装 |
| `SharedPreferences` | `utils/storage.ts` | uni.storage 封装 |
| `ApiResult<T>` | 响应拦截器 | code/msg/data 统一解析 |
| `CustomDialog` | `components/app-dialog/` | 自定义模态框 |
| `AppToast` | `components/app-toast/` | 顶部提示 |
| `DebounceButton` | `utils/debounce.ts` | 按钮防抖 |
| `AppColors` | `uni.scss` | SCSS 变量 |

---

## 重要提醒

1. **不要修改后端 API**：所有 `/api/*` 接口保持不变，小程序直接调用
2. **先读文档再编码**：新功能开发前先查阅 `docs/PRODUCT_DOCUMENT.md` 了解需求
3. **字段名保持一致**：模型字段使用后端 snake_case，避免不必要的转换
4. **深色主题**：所有页面使用深色赛博朋克风格，颜色统一从 `uni.scss` 引用
5. **家长/孩子双端**：根据 `user.role` 决定显示哪些功能和 tabBar
