# backgrounds — 地球日夜壁纸渲染器

本目录是**本 fork 新增的内容**（不属于上游 `dsh-gui-customization`）。它做的事：把两张 NASA 地球贴图渲染成一段 **1920×1080 / 24 FPS / 30 秒无缝 360° 循环**的地球日夜视频，然后用插件的「视频背景」模式设为 DSH Web GUI 的背景。

## 文件

| 文件 | 作用 |
|---|---|
| `render-template.html` | WebGL2 + GLSL 渲染器。天空盒 / 地球球体（128×256 细分）/ 大气光晕三段 shader；`uDay` `uNight` 双贴图按 `uSunDir` 混合；暴露 `window.__renderFrame(t)` 做确定性逐帧渲染、`window.__ready` 供等待就绪 |
| `make-render.js` | 把 `earth-day.jpg` / `earth-night.jpg` 读成 base64 注入模板，生成单文件 `render.html` |
| `capture.js` | headless Edge + puppeteer-core，按 24 FPS 逐帧调 `__renderFrame(t)` 并截图，产出 `frames/frame-0000.png … frame-0719.png`（720 帧） |
| `earth-day.jpg` | 日面贴图（NASA，公有领域） |
| `earth-night.jpg` | 夜面贴图（NASA，公有领域） |

## 用法

```sh
# 1) 装依赖（只需 puppeteer-core；用系统已装的 Edge/Chrome，不下载 Chromium）
npm i puppeteer-core

# 2) 注入贴图，生成 render.html
node make-render.js

# 3) 抓 720 帧到 frames/（1920×1080，约几分钟）
#    若你的浏览器不在 C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe，
#    改 capture.js 顶部的 EDGE 常量
node capture.js

# 4) 编码成无缝循环视频
ffmpeg -framerate 24 -i frames/frame-%04d.png \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart earth-loop.mp4
```

然后在 DSH Web GUI 里：**设置 → 界面设定 → 背景 → 视频**，选 `earth-loop.mp4`，开启静音循环即可。想用静态图的话，直接选 `earth-day.jpg` / `earth-night.jpg`。

## 可调参数

都在 `render-template.html` 顶部与 shader uniform：

- `FPS = 24`、`DURATION = 30` —— 一个完整 360° 自转的秒数。`FPS × DURATION` 就是 `capture.js` 要抓的总帧数（当前 720）。改这里记得同步改 `capture.js`。
- `uSunDir` —— 太阳方向，决定昼夜分界线位置。
- `uCamPos` —— 相机位置，决定地球在画面中的大小与偏移。
- `uDebug`（运行时 `window.__debugEarth = true`）—— 调试可视化。
- WebGL2 上下文用 `antialias: true`，球体细分在 `makeSphere(1.0, 128, 256)`。

## 许可与署名

- `render-template.html`、`make-render.js`、`capture.js`：本 fork 作者自写。
- `earth-day.jpg`、`earth-night.jpg`：经 NASA Images API（`images-api.nasa.gov`）取得，NASA 素材一般不受版权保护，**须注明来自 NASA，且不得暗示 NASA 认可本项目，不得使用 NASA 标志徽标**。本项目与 NASA 无任何关联。

另见仓库根目录的 [`NOTICE`](../NOTICE)。
