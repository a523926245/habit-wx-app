/**
 * Tab 导航共享状态
 * 模块级 ref，所有 custom-tab-bar 实例共享同一个引用。
 * onTabTap 写入，模板响应式读取，不依赖任何页面生命周期。
 */
import { ref } from "vue";

/** 当前高亮的 tab 索引 */
export const activeTabIndex = ref(0);
