# 开发规范

本文档记录项目的编码约定，所有开发者（含 AI 助手）必须遵守。

---

## 1. 禁止硬编码魔法值

### 1.1 状态码 / 错误码

**❌ 禁止：**

```typescript
if (body.code === 200) { /* ... */ }
if (body.code === 10008) { handleUnauthorized(); }
if (body.code === 10007) { /* ... */ }
```

**✅ 正确：**

```typescript
import { ErrorCode, ErrorMessages, HTTP_OK } from "@/config/errors";

if (body.code === ErrorCode.SUCCESS) { /* ... */ }
if (body.code === ErrorCode.UNAUTHORIZED) { handleUnauthorized(); }
if (body.code === ErrorCode.FORBIDDEN) { /* ... */ }
if (res.statusCode !== HTTP_OK) { /* ... */ }
```

**规则：**
- 所有后端业务错误码定义在 `src/config/errors.ts` 的 `ErrorCode` 对象中
- 所有用户可见的错误提示文本定义在 `src/config/errors.ts` 的 `ErrorMessages` 映射表中
- HTTP 状态码常量定义为 `HTTP_OK`
- **比较时必须使用命名常量，禁止使用数字字面量**

### 1.2 错误提示文本

**❌ 禁止：**

```typescript
resolve({ success: false, error: "登录已过期", code: body.code });
resolve({ success: false, error: "权限不足", code: body.code });
resolve({ success: false, error: "请求失败", code: body.code });
let msg = "网络异常，请稍后重试";
if (err.errMsg?.includes("timeout")) msg = "请求超时";
```

**✅ 正确：**

```typescript
import { ErrorMessages, NetworkError, NetworkMessages, NETWORK_ERROR_DEFAULT } from "@/config/errors";

resolve({ success: false, error: body.msg || ErrorMessages[ErrorCode.UNAUTHORIZED], code: body.code });
let msg = NETWORK_ERROR_DEFAULT;
if (err.errMsg?.includes(NetworkError.TIMEOUT)) msg = NetworkMessages[NetworkError.TIMEOUT];
```

**规则：**
- 所有用户可见的提示文本（包括 fallback 默认值）必须定义在 `src/config/errors.ts`
- 网络错误分类使用 `NetworkError` 常量（`"timeout"` / `"fail"`）
- 网络错误提示使用 `NetworkMessages` 映射表
- 通用默认提示使用 `NETWORK_ERROR_DEFAULT`
- **应用级业务错误**（store/page 中的 fallback 错误）使用 `getAppMessage("KEY")` 从 `AppErrorMessages` 映射表获取
- **禁止在 store/page 中直接使用中文字符串作为错误消息 fallback**

### 1.3 API 地址 / 端口号

**❌ 禁止：**

```typescript
const BASE_URL = "http://localhost:3000/api";
```

**✅ 正确：**

```typescript
import { API_BASE_URL } from "@/config/errors"; // 或 "@/config/api"
```

**规则：**
- API 地址定义在 `src/config/api.ts` 中
- 所有请求文件统一从 `@/config/api` 导入

---

## 2. 配置文件组织

### 2.1 目录职责

| 目录 | 职责 | 示例 |
|------|------|------|
| `src/config/` | 配置中心：所有常量、枚举、映射表、环境配置 | `errors.ts`, `api.ts`, `app.ts`, `game.ts` |
| `src/utils/` | 纯工具函数：无状态 helper，不携带业务语义 | `storage.ts`, `debounce.ts`, `toast.ts` |
| `src/api/` | API 请求封装：HTTP 方法、拦截器、类型定义 | `request.ts`, `auth.ts` |
| `src/models/` | 数据模型：TypeScript interface，对应后端 JSON 结构 | `user.ts`, `card.ts` |
| `src/stores/` | 状态管理：reactive + composables | `auth.ts` |

### 2.2 配置文件规则

- **所有配置集中放在 `src/config/` 下，禁止散落在 `utils/` 或其他目录**
- 每个配置文件只负责一个领域（错误码、API 地址、游戏配置等）
- 必须提供 `src/config/index.ts` 统一导出，方便外部引用
- 常量对象使用 `as const` 保证类型安全

---

## 3. TypeScript 类型规范

### 3.1 禁止使用 `any`

**❌ 禁止：**

```typescript
const data: any;
function handle(err: any) { ... }
interface Result<T = any> { ... }
```

**✅ 正确：**

```typescript
const data: unknown;
function handle(err: RequestFailError) { ... }
interface Result<T = unknown> { ... }
```

**规则：**
- 泛型默认使用 `unknown` 而非 `any`
- uni-app 回调参数必须定义明确的接口（如 `RequestSuccessResult<T>`、`UploadSuccessResult`、`RequestFailError`）
- 仅在无法精确描述的类型上使用 `any`，且必须加 JSDoc 注释说明原因

### 3.2 接口命名约定

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 导出接口 | `PascalCase` | `ApiResponse<T>`, `ApiResult<T>` |
| 内部接口 | `PascalCase`（无导出标记） | `RequestOptions`, `RequestFailError` |
| 回调参数 | 描述性名称 + `Result`/`Error` 后缀 | `UploadSuccessResult`, `RequestFailError` |

---

## 4. 文件组织规范

### 4.1 文件职责单一

- 一个文件只做一件事：`request.ts` 管请求封装，`auth.ts` 管认证接口
- 不要在一个文件中混合配置、工具、业务逻辑
- 配置文件（`config/`）不包含函数实现，只包含数据声明

### 4.2 导入路径顺序

```typescript
// 1. 第三方库
import { ref, computed } from "vue";

// 2. 项目内部模块（按优先级：config → api → models → stores → utils → components → pages）
import { ErrorCode } from "@/config/errors";
import * as storage from "@/utils/storage";
import { useAuthStore } from "@/stores/auth";
```

---

## 6. 代码格式规范

### 6.2 导入命名冲突：CustomTabBar vs PhTabBar

项目中存在两个不同的底部导航组件，**禁止使用相同的本地导入名**：

| 组件 | 路径 | 用途 | 推荐导入名 |
|------|------|------|------------|
| 底部 tabBar | `@/custom-tab-bar/index.vue` | 页面级固定底部导航 | `CustomTabBar` |
| Tab 切换器 | `@/components/ph-tab-bar/ph-tab-bar.vue` | 页面内 Tab 标签切换 | `PhTabBar` |

**❌ 错误示范（同名冲突）：**

```typescript
import CustomTabBar from "@/custom-tab-bar/index.vue";
import CustomTabBar from "@/components/ph-tab-bar/ph-tab-bar.vue";  // Identifier already declared!
```

**✅ 正确做法：**

```typescript
import CustomTabBar from "@/custom-tab-bar/index.vue";
import PhTabBar from "@/components/ph-tab-bar/ph-tab-bar.vue";
```

**规则：**
- `ph-tab-bar`（Tab 切换器）始终使用 `PhTabBar` 作为导入名
- 添加新组件时，先检查同一文件中是否已有同名标识符
- 模板中使用 kebab-case：`<custom-tab-bar />`、`<ph-tab-bar />`

### 6.3 if / else / try / catch 必须使用花括号

**❌ 禁止省略花括号：**

```typescript
if (condition) doSomething();

if (x > 0)
  return x;
else
  return -x;

try {
  doSomething();
} catch (e)
  handleError(e);
```

**✅ 正确：**

```typescript
if (condition) {
  doSomething();
}

if (x > 0) {
  return x;
} else {
  return -x;
}

try {
  doSomething();
} catch (e) {
  handleError(e);
}
```

**规则：**
- 所有 `if`、`else if`、`else`、`for`、`while`、`do`、`try`、`catch`、`finally` 后面的代码块**必须使用 `{ }` 包裹**，即使只有一行
- 禁止单行省略花括号，保持代码结构清晰一致

---

## 7. 检查清单

在提交代码前，确认：

- [ ] 没有硬编码的状态码数字（200, 10007, 10008 等）
- [ ] 没有硬编码的错误提示文本（中文字符串作为 fallback）
  - 网络错误使用 `NETWORK_ERROR_DEFAULT`
  - 业务错误使用 `getAppMessage("KEY")`
- [ ] 没有使用 `any` 类型
- [ ] 配置常量放在 `src/config/` 下
- [ ] 工具函数放在 `src/utils/` 下（纯函数，无业务语义）
- [ ] 所有导出接口都有 JSDoc 注释
- [ ] 所有控制语句（if/else/try/catch/for/while）都使用了花括号
- [ ] 导入路径顺序符合规范（config → api → models → stores → utils → components → pages）
- [ ] 没有导入名冲突：`ph-tab-bar` 使用 `PhTabBar`，`custom-tab-bar` 使用 `CustomTabBar`
- [ ] Tab 选项卡使用内联胶囊样式，不使用 `ph-tab-bar` 组件
- [ ] 显示给用户的文本（段位、等级等）使用中文，从 `src/config/` 映射表获取

---

## 8. UI 组件规范

### 8.1 Tab 选项卡样式

**❌ 禁止：使用 `ph-tab-bar` 组件（下划线指示器样式）**

```vue
<ph-tab-bar :tabs="['今日', '本周']" :default-index="currentTab" @change="onTabChange" />
```

**✅ 正确：使用内联胶囊样式（与 pending 页面一致）**

```vue
<view class="tab-bar">
  <view
    v-for="(tab, index) in tabs"
    :key="index"
    class="tab-bar__item"
    :class="{ 'tab-bar__item--active': currentTab === index }"
    @tap="onTabChange(index)"
  >
    <text class="tab-bar__text">{{ tab }}</text>
  </view>
</view>
```

**对应样式：**

```scss
.tab-bar {
  display: flex;
  margin: 32rpx;
  padding: 8rpx;
  background: $bg-card;
  border-radius: 60rpx;
  border: 2rpx solid rgba(106, 214, 255, 0.1);
  flex-shrink: 0;
}

.tab-bar__item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 0;
  border-radius: 52rpx;
  transition: all 0.2s ease;
}

.tab-bar__item--active {
  background: $accent-cyan;
  box-shadow: 0 0 30rpx rgba(106, 214, 255, 0.3);
}

.tab-bar__text {
  font-size: 28rpx;
  font-weight: 500;
  color: $text-secondary;
}

.tab-bar__item--active .tab-bar__text {
  color: $bg-primary;
  font-weight: bold;
}
```

**规则：**
- 所有页面的 Tab 选项卡必须使用上述胶囊样式
- `ph-tab-bar` 组件保留但不再用于新页面
- Tab 数据使用 `const tabs = [...]` 定义在 `<script setup>` 中

---

## 9. 显示文本本地化规范

### 9.1 段位/等级显示

**❌ 禁止：直接显示英文枚举值**

```vue
<text>{{ entry.rankTier }}</text>  <!-- 显示: bronze -->
```

**✅ 正确：使用映射函数转换为中文**

```vue
<text>{{ getRankTierLabel(entry.rankTier) }}</text>  <!-- 显示: 🥉 青铜 -->
```

**规则：**
- 所有面向用户的枚举值（段位、等级、状态等）必须显示中文
- 中文映射统一定义在 `src/config/` 对应文件中
- 使用 `get{EnumName}Label()` 函数获取中文名称
- 常用映射表：
  - 段位：`getRankTierLabel()` in `src/config/game.ts`
  - 错误码：`ErrorMessages` in `src/config/errors.ts`

### 9.2 通用枚举映射模式

```typescript
// src/config/game.ts
export const RANK_TIER_LABELS: Record<string, string> = {
  bronze: "🥉 青铜",
  silver: "🥈 白银",
  gold: "🥇 黄金",
  diamond: "💎 钻石",
  legendary: "👑 传说",
};

export function getRankTierLabel(tier?: string): string {
  if (!tier) return "🥉 青铜";
  return RANK_TIER_LABELS[tier] || "🥉 青铜";
}
```
