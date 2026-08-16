import { enUS, zhCN } from "@edgeever/shared/i18n";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  readMobileLocalePreference,
  writeMobileLocalePreference,
  type MobileLocalePreference,
} from "./preferences";

type SupportedMobileLocale = "zh-CN" | "en-US";
type MobileLocaleContextValue = {
  preference: MobileLocalePreference;
  resolvedLocale: SupportedMobileLocale;
  setPreference: (preference: MobileLocalePreference) => void;
  translate: (value: string) => string;
};

type TranslationPair = { source: string; target: string; pattern?: RegExp; placeholders?: string[] };

const mobileOnlyTranslations = new Map<string, string>([
  ["返回", "Back"],
  ["关闭对话框", "Close dialog"],
  ["切换到深色模式", "Switch to dark mode"],
  ["切换到浅色模式", "Switch to light mode"],
  ["完成编辑", "Finish editing"],
  ["完成新建笔记", "Finish creating note"],
  ["Markdown 源代码编辑", "Edit Markdown source"],
  ["资源", "Resources"],
  ["笔记列表操作", "Note list actions"],
  ["搜索", "Search"],
  ["搜索标题、正文或标签", "Search titles, content, or tags"],
  ["输入关键词开始搜索", "Enter a keyword to search"],
  ["搜索本机同步缓存，结果会即时显示", "Search the local synced cache with instant results"],
  ["笔记操作", "Note actions"],
  ["AI 笔记助手", "AI note assistant"],
  ["版本历史", "Version history"],
  ["链接笔记", "Share note"],
  ["复制笔记 ID", "Copy note ID"],
  ["同步后复制笔记 ID", "Copy note ID after sync"],
  ["笔记 ID 已复制", "Note ID copied"],
  ["复制笔记 ID 失败", "Could not copy note ID"],
  ["无法分享", "Could not share"],
  ["无法创建分享链接。请检查你的连接，然后重试。", "Could not create a share link. Check your connection and try again."],
  ["同步冲突", "Sync conflict"],
  ["同步失败", "Sync failed"],
  ["待同步", "Pending sync"],
  ["已同步", "Synced"],
  ["立即同步", "Sync now"],
  ["查看同步状态和现在重试", "View sync status and retry now"],
  ["当前更改等待上传。你可以现在重试同步。", "Local changes are waiting to upload. You can retry sync now."],
  ["当前更改无法上传。你可以现在重试同步。", "Local changes could not upload. You can retry sync now."],
  ["当前更改无法上传。它们保留在这台设备上，你可以现在重试同步。", "Local changes could not upload. They remain on this device and you can retry sync now."],
  ["当前更改等待上传。下拉刷新或点击立即同步。", "Local changes are pending upload. Pull to refresh or tap to sync now."],
  ["查看并解决同步冲突", "Review and resolve the sync conflict"],
  ["无法加载", "Failed to load"],
  ["请稍后重试", "Please try again later"],
  ["重试", "Retry"],
  ["图片上传失败", "Image upload failed"],
  ["请检查网络连接后重试", "Check your connection and try again"],
  ["选择图片或附件", "Add image or attachment"],
  ["拍照或从相册选择", "Take a photo or choose from your library or device"],
  ["关闭图片源选择器", "Close image source picker"],
  ["拍照", "Take photo"],
  ["从相册选择", "Choose from library"],
  ["选择文件", "Choose file"],
  ["相机权限被拒绝", "Camera access required"],
  ["相机权限被拒绝。打开系统设置并允许 EdgeEver 使用相机。", "Camera access is disabled. Open system settings and allow EdgeEver to use the camera."],
  ["打开设置", "Open settings"],
  ["系统无法恢复之前选中的图片。请稍后重试。", "The system could not restore the previously selected image. Please try again later."],
  ["查看历史", "View history"],
  ["使用云版本", "Use cloud version"],
  ["使用云版本并重新加载", "Use cloud and reload"],
  ["无法使用云版本", "Could not use the cloud version"],
  ["复制本地草稿", "Copy local draft"],
  ["本地草稿已复制到剪贴板。", "Local draft copied to the clipboard."],
  ["没有本地草稿要复制。", "There is no local draft to copy."],
  ["已复制", "Copied"],
  ["更多", "More"],
  ["加载失败", "Failed to load"],
  ["请稍后重试", "Please try again later"],
  ["重试", "Retry"],
  ["图片上传失败", "Image upload failed"],
  ["请检查网络连接后重试", "Check your connection and try again"],
  ["更换图片或附件", "Add image or attachment"],
  ["拍照或从相册中选择", "Take a photo or choose from your library or device"],
  ["关闭图片源选择器", "Close image source picker"],
  ["拍照", "Take photo"],
  ["从相册中选择", "Choose from library"],
  ["选择文件", "Choose file"],
  ["摄像头权限被拒绝", "Camera access required"],
  ["摄像头权限被拒绝。打开系统设置并允许 EdgeEver 使用相机。", "Camera access is disabled. Open system settings and allow EdgeEver to use the camera."],
  ["打开设置", "Open settings"],
  ["系统无法恢复之前选中的图片。请稍后重试。", "The system could not restore the previously selected image. Please try again later."],
  ["查看历史", "View history"],
  ["使用云版本", "Use cloud version"],
  ["使用云版本并重新加载", "Use cloud and reload"],
  ["无法使用云版本", "Could not use the cloud version"],
  ["复制本地草稿", "Copy local draft"],
  ["本地草稿已复制到剪贴板。", "Local draft copied to the clipboard."],
  ["没有本地草稿要复制。", "There is no local draft to copy."],
  ["已复制", "Copied"],
  ["更多", "More"],
  ["退出新建笔记？", "Exit the new note?"],
  ["内容已自动保存为本地草稿，下次新建时会继续恢复。", "The content is saved as a local draft and will be restored the next time you create a note."],
  ["继续编辑", "Keep editing"],
  ["放弃草稿", "Discard draft"],
  ["保留并退出", "Keep and exit"],
  ["丢弃本地变更？", "Discard local changes?"],
  ["此操作会移除这条待同步记录，不会修改服务端笔记。", "This removes the queued local change without modifying the server note."],
  ["丢弃", "Discard"],
  ["正在同步新笔记", "New note is syncing"],
  ["首次同步完成后即可上传本地图片；图片链接现在就可以直接粘贴到正文。", "Local images can be uploaded after the first sync. Image links can already be pasted into the note."],
  ["保存更改？", "Save changes?"],
  ["当前笔记有未保存修改。", "This note has unsaved changes."],
  ["放弃修改", "Discard changes"],
  ["无法打开资源", "Unable to open resource"],
  ["系统没有可用应用打开此链接。", "No installed app can open this link."],
  ["已删除笔记不能上传附件，请先恢复笔记", "Deleted notes cannot receive attachments. Restore the note first."],
  ["图片预览", "Image preview"],
  ["放大", "Zoom in"],
  ["缩小", "Zoom out"],
  ["上一张", "Previous image"],
  ["下一张", "Next image"],
  ["打开原文件", "Open original file"],
  ["密码已更新", "Password updated"],
  ["下次登录请使用新密码。", "Use the new password the next time you sign in."],
  ["编辑笔记", "Edit note"],
  ["所在笔记本", "Notebook"],
  ["笔记标题", "Note title"],
  ["笔记标签", "Note tags"],
  ["选择笔记本", "Choose notebook"],
  ["选择现有标签或输入名称来创建新标签", "Select existing tags or enter a name to create a new one"],
  ["搜索或输入新标签", "Search or enter a new tag"],
  ["没有匹配的标签。你可以创建一个新的。", "No matching tags. You can create a new one."],
  ["创建", "Create"],
  ["{{count}} 已选中", "{{count}} selected"],
  ["{{count}} 条结果", "Results: {{count}}"],
  ["过滤：{{filter}} ➜ {{count}} 条笔记", "Filter: {{filter}} ➜ {{count}} notes"],
  ["已加载 {{loaded}} / {{total}} 条笔记", "Loaded {{loaded}} of {{total}} notes"],
  ["从模板新建", "New from template"],
  ["模板", "Templates"],
  ["选择一个模板来开始。每个模板都可以在网页上编辑或删除。", "Choose a template to get started. Every template can be edited or deleted on the web."],
  ["没有模板。在网页上创建一个或将笔记保存为模板。", "No templates yet. Create one or save a note as a template on the web."],
  ["加载模板中", "Loading templates"],
  ["新建笔记", "New note"],
  ["选择如何创建", "Choose how to create"],
  ["空白笔记", "Blank note"],
  ["从空白页开始", "Start with an empty page"],
  ["使用会议笔记、周度复盘等���多模板", "Use meeting notes, weekly reviews, and more"],
  ["模板", "Template"],
  ["应用模板？", "Apply template?"],
  ["当前内容将被模板的内容替换。", "The current content will be replaced by the template."],
  ["替换", "Replace"],
  ["关闭", "Close"],
  ["刷新 Token", "Refresh tokens"],
  ["Token 名称", "Token name"],
  ["没有正文预览", "No content preview"],
  ["原生运行时启动", "Native runtime startup"],
  ["启动至 JS 执行", "Launch to JavaScript execution"],
  ["启动至会话/缓存就绪", "Launch to session/cache ready"],
  ["启动至工作区首帧", "Launch to workspace first frame"],
  ["启动至列表数据就绪", "Launch to list data ready"],
  ["启动至交互空闲", "Launch to interaction idle"],
  ["最近一次本地编辑器启动", "Latest local editor startup"],
  ["暂不可用", "Unavailable"],
  ["尚未记录", "Not recorded"],
  ["搜索", "Searching"],
  ["退出搜索", "Exit search"],
  ["重置", "Reset"],
  ["标签", "Tagged"],
  ["标签", "Pinned"],
  ["已取消标签", "Untagged"],
  ["正在同步笔记", "Syncing your notes"],
  ["准备你的笔记首帧…", "Preparing your notes for the first sync…"],
  ["加载笔记", "Loading notes"],
  ["加载笔记本和笔记…", "Loading notebooks and notes…"],
  ["同步暂停", "Sync paused"],
  ["加载的笔记保持可用。检查你的连接并重试。", "Loaded notes remain available. Check your connection and retry."],
  ["已选中 {{count}} 条", "{{count}} selected"],
  ["{{count}} 条结果", "Results: {{count}}"],
  ["过滤：{{filter}} ➜ {{count}} 条笔记", "Filter: {{filter}} ➜ {{count}} notes"],
  ["已加载 {{loaded}} / {{total}} 条笔记", "Loaded {{loaded}} of {{total}} notes"],
]);

const flattenStrings = (value: unknown, prefix = "", output = new Map<string, string>()) => {
  if (typeof value === "string") {
    output.set(prefix, value);
    return output;
  }
  if (!value || typeof value !== "object") {
    return output;
  }
  for (const [key, child] of Object.entries(value)) {
    flattenStrings(child, prefix ? `${prefix}.${key}` : key, output);
  }
  return output;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const createTranslationPair = (source: string, target: string): TranslationPair => {
  const placeholders: string[] = [];
  const patternSource = escapeRegExp(source).replace(/\\\{\\\{(\w+)\\\}\\\}/g, (_match, placeholder: string) => {
    placeholders.push(placeholder);
    return "(.+?)";
  });
  return {
    source,
    target,
    pattern: placeholders.length > 0 ? new RegExp(`^${patternSource}$`) : undefined,
    placeholders,
  };
};
const zhStrings = flattenStrings(zhCN);
const enStrings = flattenStrings(enUS);
const translationPairs: TranslationPair[] = Array.from(zhStrings.entries())
  .flatMap(([key, source]) => {
    const target = enStrings.get(key);
    if (!target || source === target) {
      return [];
    }
    return [createTranslationPair(source, target)];
  });
const exactTranslations = new Map(translationPairs.filter((pair) => !pair.pattern).map((pair) => [pair.source, pair.target]));
const mobileTemplateTranslations: TranslationPair[] = Array.from(mobileOnlyTranslations.entries())
  .filter(([source]) => source.includes("{{"))
  .map(([source, target]) => createTranslationPair(source, target));
const templateTranslations = [
  ...mobileTemplateTranslations,
  ...translationPairs.filter((pair) => pair.pattern),
].sort((left, right) => right.source.length - left.source.length);

const resolveSystemLocale = (): SupportedMobileLocale =>
  (Intl.DateTimeFormat().resolvedOptions().locale || "zh-CN").toLowerCase().startsWith("en") ? "en-US" : "zh-CN";

export const translateMobileText = (value: string, locale: SupportedMobileLocale) => {
  if (locale !== "en-US" || !/[\u3400-\u9fff]/.test(value)) {
    return value;
  }
  const exact = mobileOnlyTranslations.get(value) ?? exactTranslations.get(value);
  if (exact) {
    return exact;
  }
  for (const pair of templateTranslations) {
    const match = pair.pattern?.exec(value);
    if (!match) {
      continue;
    }
    return (pair.placeholders ?? []).reduce(
      (translated, placeholder, index) => translated.replace(`{{${placeholder}}}`, match[index + 1] ?? ""),
      pair.target
    );
  }
  return value;
};

let currentResolvedMobileLocale: SupportedMobileLocale = resolveSystemLocale();
export const translateCurrentMobileText = (value: string) => translateMobileText(value, currentResolvedMobileLocale);

const MobileLocaleContext = createContext<MobileLocaleContextValue>({
  preference: "system",
  resolvedLocale: resolveSystemLocale(),
  setPreference: () => undefined,
  translate: (value) => value,
});

export const MobileLocaleProvider = ({ children }: { children: ReactNode }) => {
  const [preference, setPreferenceState] = useState<MobileLocalePreference>("system");

  useEffect(() => {
    let active = true;
    void readMobileLocalePreference().then((storedPreference) => {
      if (active) {
        setPreferenceState(storedPreference);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const resolvedLocale = preference === "system" ? resolveSystemLocale() : preference;
  currentResolvedMobileLocale = resolvedLocale;
  const value = useMemo<MobileLocaleContextValue>(
    () => ({
      preference,
      resolvedLocale,
      setPreference: (nextPreference) => {
        setPreferenceState(nextPreference);
        void writeMobileLocalePreference(nextPreference);
      },
      translate: (text) => translateMobileText(text, resolvedLocale),
    }),
    [preference, resolvedLocale]
  );

  return <MobileLocaleContext.Provider value={value}>{children}</MobileLocaleContext.Provider>;
};

export const useMobileLocale = () => useContext(MobileLocaleContext);
