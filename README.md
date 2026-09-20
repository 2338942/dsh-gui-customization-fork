# dsh-gui-customization-fork

> **非官方 fork。** 上游是 [LAN-TINA-WS/dsh-gui-customization](https://github.com/LAN-TINA-WS/dsh-gui-customization)（作者 LAN-TINA-WS，MIT，Copyright (c) 2026 LAN-TINA-WS）。本仓库与上游作者**无隶属关系**，也**未获其背书**。插件代码版权归上游作者所有，详见 [`LICENSE`](LICENSE) 与 [`NOTICE`](NOTICE)。

DeepSeek Harness Web GUI 的界面设定插件（配色 / 氛围光晕 / 动态图片·视频背景），加上本 fork 自带的**地球日夜壁纸渲染器**。

---

## 这个 fork 到底改了什么

**插件代码：零改动。** `lib/`、`assets/backgrounds/`、`cordis.patch.yml`、`package.json` 与 npm 上 `dsh-gui-customization@0.6.4` 的 tarball **逐文件 SHA256 完全一致**（未重新构建、未 patch、未改名）。

**新增内容（本 fork 的唯一增量）**：`backgrounds/` 目录 —— 一个自写的 WebGL2 地球日夜壁纸渲染器 + 两张 NASA 公有领域贴图。这部分不是上游的东西，版权与许可见下文。详见 [`backgrounds/README.md`](backgrounds/README.md)。

### 为什么零改动？

fork 的出发点是一个本地修复：**0.6.2 缺少 `exports.inject` 声明**，导致 client 模块注册时拿不到 `theme` / `slots` 服务。当时的做法是在 `lib/client.js` 里手工插入一行：

```js
exports.apply = apply;
exports.inject = ["theme", "slots"];   // ← 本地补丁
```

但在 0.6.4 上游**已经自己修了，而且更完整**：

```js
const inject = [
	"theme",
	"slots",
	"locale"   // ← 上游比你本地补丁多声明了一个服务
];
exports.inject = inject;
```

所以本地补丁已被上游覆盖，本 fork 无需再改代码 —— 直接用上游 0.6.4 原样。

### 为什么包名没有跟着改？

`lib/client.js` 的模块身份是硬编码的：

```js
window.__ModuleLoader__.load({ id: "dsh-gui-customization", ... });
const SOURCE = "dsh-gui-customization";   // 同时用作 localStorage / IndexedDB 持久化键
```

DSH 客户端按包名查模块表，**改包名而不改 client 模块 id 会导致"client 模块表未见本包"**（然后 shell 反复自动刷新）。因此：GitHub 仓库叫 `dsh-gui-customization-fork`，但 **npm 包名保持 `dsh-gui-customization`**，作为可直接顶替上游的 drop-in 包。`package.json` 里的 `repository` 字段也**故意保留指向上游**，作为署名。

---

## 安装

本仓库根目录本身就是一个合法的 DSH 插件包：

```sh
# 装进任意 profile（例子用 desktop）
dsh plugin --profile desktop add link:<本仓库绝对路径>

# 或先用 npm 打成 tgz 再装
npm pack
dsh plugin --profile desktop add ./dsh-gui-customization-0.6.4.tgz
```

装完重启（或重载）`dsh web` 生效。上游的 host 侧入口 `lib/index.js` 是空实现（`function apply() {}`），全部行为在浏览器侧，无需额外配置。

> 注意：本 fork 与上游**同名**，同一个 profile 里只能存在一个 —— 装本 fork 即顶替上游。要并存得先把 `lib/client.js` 的 `id` / `SOURCE` 与 `cordis.patch.yml` 的 `name` 一起改掉，本 fork 没有这么做。

## 目录结构

```
├── package.json              # 上游原样（name: dsh-gui-customization, version: 0.6.4）
├── cordis.patch.yml          # 上游原样：insert id=ui-gui-customization
├── lib/
│   ├── index.js              # host 入口（空实现）
│   ├── client.js             # 浏览器侧全部逻辑（模块 id 硬编码）
│   └── client.js.map
├── assets/backgrounds/       # 上游自带预设背景（deepseek-01/02/03.jpg）
├── backgrounds/              # ★ 本 fork 新增：自制壁纸渲染器 + NASA 贴图
├── UPSTREAM-README.md        # 上游原作者的开发台账（原样保留）
├── LICENSE                   # 上游 MIT 原文（Copyright (c) 2026 LAN-TINA-WS）
├── NOTICE                    # 新增内容的署名与第三方素材来源
└── README.md                 # 本文件
```

## 功能（上游特性，未经修改）

- Nous 蓝默认配色（明暗双模式）+ 四预设 + 13 色自定义
- 氛围层：角落光晕（随主题 `brand-primary`）+ 呼吸动画（幅度可调）+ 强度 + 位置 5 模式
- 背景：图片（真·文件选择对话框 + 内置预设）与视频（静音循环）双模式；主区透图 + 明暗自适应遮罩 + **背景透明度滑块** + 侧边栏透明开关
- 配色导入/导出（JSON + 剪贴板）
- 中英双语；持久化（设置走 localStorage，背景走 IndexedDB，跨刷新/跨重启保留）
- 设置页「界面设定」+ 插件配置区卡片（设置 → 插件）

## 许可

- **插件代码**：MIT，Copyright (c) 2026 LAN-TINA-WS，原文见 [`LICENSE`](LICENSE)。
- **本 fork 新增的 `backgrounds/`**：见 [`NOTICE`](NOTICE) 与 [`backgrounds/README.md`](backgrounds/README.md)（含 NASA 素材署名）。
