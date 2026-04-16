# 小王子伴读互动页面 - 开发日志

---

## 2026-04-03

### 新增 S5 串场旁白 + S6 视频等待页
- Screen 5（全景合影）增加串场旁白覆盖层：5段文案通过 Typed.js 逐字显示，描述视频剧本概念
  - "小王子有B612，我也有一颗自己的星球——{planetName}" → 层层选拔 → 理想居民 → 美好星球 → 引出纪录片
  - 每段打完后1.5s暂停、淡出、播下一段
  - 全部结束后显示"观看我的星球纪录片"按钮
- 新增 Screen 6（视频等待页）：
  - 深空紫背景 + 用户星球居中 + 3圈轨道环旋转动画
  - "你的专属星球纪录片正在生成中" Typed.js 标题
  - 装饰性进度条（光点扫动）+ 浮动粒子
  - "返回我的星球"按钮回到 S5
- 新建 `js/video-wait.js` — S6 模块（init/enter/leave 模式）
- 修改 `js/panorama.js` — 增加旁白序列逻辑
- 修改 `js/app.js` — 注册 VideoWait 模块、_enterScreen/_leaveScreen 增加 case 6
- 修改 `css/screens.css` — narration-overlay 样式 + S6 全套样式
- 修改 `js/audio-manager.js` — 注册 narratorS5Narration 占位音频
- 生成 `assets/audio/narrator/s5-narration.mp3` 占位静音文件

---

## 2026-04-02

### 项目初始化
- 创建项目目录结构：`css/`、`js/`、`assets/`（含audio/images/fonts子目录）
- 技术栈确定：anime.js + Howler.js + wavesurfer.js + tsParticles + Typed.js + Three.js（仅全景合影）
- 全部通过CDN引入，纯前端HTML/CSS/JS，无构建工具

### 核心页面搭建
- 完成 `index.html` 主框架，5个Screen结构
- 完成 3 个 CSS 文件：`style.css`（全局）、`screens.css`（布局）、`animations.css`（关键帧）
- 完成 10 个 JS 模块：
  - `app.js` — 主控制器、Screen切换、转场动画
  - `planet-diy.js` — Screen 1 星球DIY（命名/颜色/装饰）
  - `recruitment.js` — Screen 2 招募令（卷轴展开/Typed.js/粒子爆发）
  - `characters.js` — 4个角色数据（玫瑰/国王/爱慕虚荣的人/商人）
  - `review.js` — Screen 3 审核交互（登场/印章/录音/波形）
  - `invite.js` — Screen 4 邀请身边人
  - `panorama.js` — Screen 5 Three.js全景合影
  - `audio-manager.js` — Howler.js音效统一管理
  - `recorder.js` — wavesurfer.js + Web Audio API录音/波形可视化
  - `particles-config.js` — tsParticles星空配置
- 生成 SVG 占位素材（星球、4个角色、审核助手）

### Screen 3 改造 — 第一人称控制台视角
- 参考用户提供的概念图（Hands_on_futuristic），将 Screen 3 从左右分栏布局改为：
  - 上半屏：窗外深空 + 星球悬浮
  - 下半屏：控制台桌面（透视倾斜）
  - 全息申请卡（半透明发光/扫描线动画）
  - 印章按钮（绿通过/黄待定/红拒绝，立体造型+盖章动画+卡片印记）
  - 审核助手浮在左下角

### Screen 3 背景图替换
- 用户提供紫色圆顶大厅背景图（Gemini生成），铺满 Screen 3 全屏
- 去掉CSS模拟的星空和桌面渐变，改为透明浮层让背景图穿透
- 全部配色从蓝色系调整为紫色系以匹配背景图
- 后续替换为更清晰的版本（图片清晰化.png）

### 尺寸自适应调整
- 所有Screen内容尺寸从固定px改为vh/min()/clamp()自适应
- 缩小星球、面板、按钮、输入框间距，确保100%缩放一屏可见

---

## 2026-04-03

### Bug修复 — 页面无法点击
- 症状：页面元素无法点击交互
- 排查：
  - `screen-content` 的 `overflow-y: auto` + `max-height: 100vh` 可能截断事件 → 移除
  - `font-size: clamp(12px, 1.4vh, 16px)` 中 1.4vh < 16px 导致 clamp 始终返回 12px → 改为固定 14px
  - tsParticles 生成的 canvas 可能拦截点击 → 给 `#particles-bg *` 加 `pointer-events: none !important`
- 修复已提交，待验证

### Screen 3 尺寸大屏适配
- 症状：缩放到33%仍无法舒适体验面试环节；大屏上全息卡片、印章、录音面板相对全屏背景图极其微小
- 原因：所有UI组件使用固定px尺寸（卡片360px、头像60px、印章80×50px等），背景图用 `cover` 铺满全屏，大屏上比例严重失调
- 修复：
  - 全面改用 `clamp(最小值, vw比例, 最大值)` 响应式尺寸：
    - 全息卡片宽度：`360px` → `clamp(320px, 42vw, 620px)`
    - 头像：`60px` → `clamp(56px, 6vw, 96px)`
    - 印章：`80×50px` → `clamp(80px,8vw,140px) × clamp(48px,5vw,80px)`
    - 录音面板/波形卡片：max-width `420px` → `clamp(360px, 42vw, 620px)`
    - 审核助手气泡：`400px` → `clamp(320px, 35vw, 520px)`
    - 星球：`100px` → `clamp(80px, 8vw, 140px)`
  - 所有字号、padding、margin、gap 同样改为 clamp/vw/vh
  - cockpit-window 45%→30%，console-desk 55%→70%，给操作区更多空间
  - 对话框增加 `max-height: 20vh` + `overflow-y: auto` 防止长文本撑爆
  - Screen 5 `.panorama-screen` 的 `width: 100vw` 改为 `100%`，修复水平溢出
- 涉及文件：`css/screens.css`、`js/review.js`

### Screen 1 星球DIY改造 — 图片切换方案
- 原方案：1张SVG星球 + CSS hue-rotate滤镜变色 + emoji装饰叠加（6色×5装饰可叠加）
- 新方案：9张预生成PNG星球图片，根据色调+装饰组合直接切换图片src
- 色调选项：蓝色、粉色（2选1）
- 装饰选项：云朵、星环、小行星（3选1，单选，可取消）
- 图片清单（9张，均为无背景PNG）：
  1. `planet-base.png` — 初始星球（灰色调）
  2. `planet-blue.png` — 蓝色星球
  3. `planet-pink.png` — 粉色星球
  4. `planet-blue-cloud.png` — 蓝色+云朵
  5. `planet-blue-ring.png` — 蓝色+星环
  6. `planet-blue-asteroid.png` — 蓝色+小行星
  7. `planet-pink-cloud.png` — 粉色+云朵
  8. `planet-pink-ring.png` — 粉色+星环
  9. `planet-pink-asteroid.png` — 粉色+小行星
- 改动文件：
  - `index.html` — 色调按钮改为蓝色/粉色，装饰按钮改为云朵/星环/小行星，去掉decorations-layer，所有screen星球src更新
  - `js/planet-diy.js` — 完全重写，imageMap映射表驱动图片切换，去掉hue-rotate滤镜逻辑
  - `js/app.js` — state字段 planetHue/decorations 改为 planetColor/planetDeco
  - `js/panorama.js` — 3D全景星球颜色适配新的planetColor字段
  - `css/screens.css` — 去掉planet-main/mini-planet-img/review-planet-img的border-radius:50%（避免裁切装饰），装饰按钮改为带文字+active选中态，去掉decorations-layer相关样式

### Screen 3 背景图替换 — 暖色调控制台
- 用户提供新背景图（暖橙色黄昏城市天际线+圆顶控制台），替换原紫色穹顶
- 全面调色：紫色系 → 暖金色系（`rgba(180,150,255)` → `rgba(255,200,130)` 等）
- 在 `#screen-3` 上覆盖 CSS 变量（`--primary`, `--primary-light`, `--accent`），不影响其他Screen
- 涉及文件：`css/screens.css`、`css/animations.css`、`js/review.js`

### Screen 3 交互重构 — 去掉全息卡片，改为桌面道具展示
- 原方案：全息浮动申请卡片（holo-card）展示角色信息+对话，遮挡背景
- 新方案：角色以实物道具形式出现在背景图中央圆形平台上
  - 玫瑰 → 玻璃罩玫瑰大图（用户提供抠图PNG）
  - 其他角色暂用默认SVG头像，后续可添加专属道具图
- HTML结构：去掉 `holo-card-area` 和 `console-desk`，新增 `stage-center > stage-prop`
- 道具入场特效：传送光柱（金色半透明光柱升起 → 道具从模糊到清晰 materialize → 光柱消散）
- 道具映射表 `_propImages`：角色id → 道具图路径，方便扩展
- 涉及文件：`index.html`、`css/screens.css`、`js/review.js`

### Screen 3 对话框改为橙光游戏风格
- 原方案：左下角小气泡（助手头像+文字）
- 新方案：画面下方居中半透明对话板（`bottom: 12vh`, 宽 `60vw`）
  - 去掉助手头像
  - 新增说话者名字（金色，`.dialogue-name`），谁说话就显示谁的名字
  - 角色说话时显示角色名（如"玫瑰"），系统提示时显示"审核助手"
- 涉及文件：`index.html`、`css/screens.css`、`js/review.js`

### Screen 3 审核流程简化 & 素材更新
- 去掉"待定"选项，印章只保留"通过"和"不通过"
- 录音环节改为假录音（不请求麦克风权限），Canvas模拟波形动画，点开始→点停止自动进入下一步，去掉确认按钮
- 角色反应动画改进：通过→红色"通过"印章盖在道具上再飞走；不通过→"不通过"印章盖下后碎裂消散
- 玫瑰入场去掉光柱，改为柔和淡入，稳定不晃动；其他角色保留光柱传送入场
- 国王图片替换：用户提供半身皮克斯风格PNG（国王-无背景.png），替换原SVG简笔画
  - 修复 king.png 符号链接问题（原为指向king.svg的symlink），改为真实PNG文件
- 助手飞行员对话框增加圆形头像（pilot-avatar.png），头像尺寸放大至64-88px匹配对话框高度
- AudioManager 的 play/playBGM/playVoice 加 try-catch 保护，音频加载失败时静默跳过不阻塞流程
- 舞台名字（stage-name）隐藏（display:none）

### Screen 2/3 去掉浮动星球
- 隐藏 Screen 2 左上角 mini-planet 和 Screen 3 窗外 cockpit-window/window-planet
- 星球信息在 Screen 4（邀请）和 Screen 5（全景合影）正常显示

### Screen 3 对话框分离 & 录音交互重构
- 角色对话框（顶部）和助手飞行员对话框（底部）分离，两者不同时出现
  - 角色说话 → 顶部对话框；助手说话 → 底部对话框（带飞行员圆形头像）
  - 切换时先淡出当前对话框，再淡入另一个，避免重叠
- "审核助手" 全局改名为 "助手飞行员"，底部对话框不再显示文字名称，改用圆形头像（飞行员头像.png）
- 印章显示时隐藏助手对话框，避免印章和对话框位置冲突
- 录音面板（文字提示+波形+标签）整体移除，替换为画面上方居中的麦克风图片按钮（麦克风.png）
  - 流程：盖章后 → 助手提示"说说你的理由吧" → 对话框淡出 → 麦克风淡入 → 点击开始录音（脉冲发光）→ 再点停止 → 麦克风缩小消失 → 角色反应
- 串场词文案整理输出为 `串场词.txt`，覆盖全5个环节的内外串场，飞行员俏皮语气
- 涉及文件：`index.html`、`css/screens.css`、`js/review.js`、`串场词.txt`

### Screen 1 星球DIY 全面替换为「星球图 2」版本
- 将第一个环节（星球DIY）的视觉风格、背景、音频和交互逻辑全面替换为「星球图 2」文档中的完整版本
- **背景替换**：tsParticles 粒子背景替换为 CSS 星空（120颗闪烁星星 + 5颗流星），紫色深空渐变背景（`#0a0a2e → #1a1040 → #0d0d28`）
- **BGM 音频**：将 `星球图 2/星球音频背景音.MP3` 复制到 `assets/audio/bgm/space-ambient.mp3`，新增 `<audio>` 元素作为 Howler 备选播放方案
- **Screen 1 HTML**：颜色按钮隐藏文字（纯色圆圈）、装饰按钮去掉 emoji、星球默认图从 `planet-base.png` 改为 `planet-blue.png`、新增居中布局类 `screen-1-content`
- **Screen 1 CSS**：全面重写为星球图 2 风格 — 居中列布局（最大宽度 520px）、280px 星球舞台、220px 星球图片、紫色调半透明 DIY 面板、淡紫色标签、渐变紫色按钮
- **planet-diy.js**：图片映射表从扁平结构重构为嵌套结构 `{ blue: { base, cloud, ring, asteroid }, pink: {...} }`
- **app.js**：新增 `_generateStars()` 方法动态生成 CSS 星星，BGM 播放同时通过 `<audio>` 和 Howler 双通道
- **字体**：新增 Noto Sans SC 字体引用
- 涉及文件：`index.html`、`css/style.css`、`css/screens.css`、`js/planet-diy.js`、`js/app.js`

### 视觉参数调节器（tuner）
- 新增 `tuner.html` + `tuner-server.js`，用于可视化调节页面CSS参数
- 启动方式：`node tuner-server.js`，浏览器访问 `http://localhost:3456`
- 功能：
  - 左侧控制面板拖动滑杆，右侧 iframe 实时预览效果
  - 支持按 Screen 分组切换（S1星球DIY / S2招募令 / S3审核 / S4邀请 / 全局）
  - 可调参数：字号、间距、圆角、颜色、尺寸、透明度等
  - **"保存到CSS文件"**：通过本地 Node 服务器 API 直接将修改写回 `css/style.css`，预览自动刷新，无需复制粘贴
  - **"导出给Claude"**：生成结构化修改说明，适用于需要将固定px转为clamp/vh响应式写法的场景
- 服务器提供静态文件服务 + 两个API：`GET /api/css`（读取CSS）、`POST /api/css`（写回CSS）
- 安全限制：只允许写 `css/` 目录下的 `.css` 文件
- 涉及文件：`tuner.html`、`tuner-server.js`

### Playwright 自动化测试 & 音效文件生成

- 安装 Playwright + Chromium，编写自动化测试脚本，对 Screen 1→2→3 完整流程进行截图验证
- 测试结果：
  - Screen 1（创建星球）：星球图片、命名输入、颜色/装饰选择、创建按钮 全部正常 ✅
  - Screen 2（招募令卷轴）：卷轴展开、Typed.js 打字效果、发布按钮 全部正常 ✅
  - Screen 3（角色审核）：控制台背景、助手对话框、角色入场+道具展示 全部正常 ✅
  - Screen 3-5 交互细节（印章/录音/邀请/全景）：待后续补充测试
- 发现 19 个音频文件 404 缺失（`assets/audio/sfx/` 和 `assets/audio/voice/` 目录为空）
- 使用 ffmpeg 合成生成 15 个音效文件（非静音，各有对应声音特征）：
  - `click.mp3` — 短促清脆点击（800Hz, 0.08s）
  - `type.mp3` — 打字按键声（600Hz, 0.05s）
  - `create.mp3` — 上升音阶+回响（400Hz vibrato, 0.8s）
  - `scroll-open.mp3` — 沙沙卷轴声（pink noise 高通滤波, 0.6s）
  - `publish.mp3` — 号角上升音+回响（523Hz, 1.2s）
  - `whoosh.mp3` — 风声（brown noise 带通滤波, 0.5s）
  - `pass.mp3` — 明亮双音和弦（C5+E5, 0.6s）
  - `reject.mp3` — 低沉下降音（300Hz, 0.5s）
  - `pending.mp3` — 轻柔提示音（440Hz, 0.3s）
  - `welcome.mp3` — 温暖三音和弦+回响（A4+C#5+E5, 1.0s）
  - `record-start.mp3` — 上升短提示（660Hz, 0.2s）
  - `record-end.mp3` — 下降短提示（440Hz, 0.2s）
  - `invite.mp3` — 轻快双铃声（A5→C6, 0.3s）
  - `finale.mp3` — 华丽三音和弦+长回响（C5+E5+G5, 1.5s）
  - `deco.mp3` — 装饰选择轻音（700Hz, 0.12s）
- 生成 4 个角色语音占位文件（1秒静音 MP3）：`rose.mp3`、`king.mp3`、`vain.mp3`、`merchant.mp3`
- 重新测试确认 404 错误从 19 个降为 0 ✅
- 测试用例文档输出为 `TESTCASE.md`
- 涉及文件：`assets/audio/sfx/*`（15个）、`assets/audio/voice/*`（4个）、`TESTCASE.md`

### tuner.html 调参器修复
- 症状：大量参数拖动滑杆后预览无变化，保存后也不生效
- 排查发现3类问题：
  1. **default 值与实际 CSS 不匹配**：滑杆初始位置不对应真实样式，拖动看似改了但值不对
     - `s1-title-fontsize`: 28px → 实际 32px
     - `s1-subtitle-mb`: 16px → 实际 0px
     - `s1-planet-size`: 200px → 实际 280px
     - `s1-planet-name-fontsize`: 22px → 实际 16px
     - `s1-panel-padding`: 单值 16px → 实际 `24px 28px`（上下/左右）
     - `s1-colorbtn-size`: 34px → 实际 40px
     - `s1-colorbtn-gap`: 10px → 实际 12px
     - `s1-decobtn-fontsize`: 15px → 实际 13px
     - `s1-label-fontsize`: 15px → 实际 14px
  2. **选择器优先级不够**：tuner 用 `.title-glow` 选元素，但 CSS 中是 `#screen-1 .title-glow`（ID选择器优先级更高）；保存时覆盖块写入 `style.css`，被 `screens.css` 中更高优先级规则覆盖
  3. **padding 简写属性处理错误**：面板 padding 是 `24px 28px`，单值控件无法正确覆盖
- 修复：
  - 修正所有 default 值与 CSS 实际值对齐
  - 更新选择器：`.title-glow` → `#screen-1 .title-glow`，`.subtitle` → `#screen-1 .subtitle`
  - 拆分面板 padding 为上下/左右两个独立控件
  - 保存目标从 `css/style.css` 改为 `css/screens.css`（最后加载，优先级更高），覆盖规则加 `!important`
  - 增加清理 `style.css` 中残留旧覆盖块的逻辑
  - 删除所有无用的 `file`/`match` 字段（保存逻辑已不使用字符串替换）
- 涉及文件：`tuner.html`

### Bug修复 — Screen 1 右侧出现从上到下的竖线
- 症状：页面右侧约 2/3 位置出现一条从上到下贯穿整个页面的细线
- 原因：`.screen-1-content` 设置了 `overflow-y: auto` + `height: 100vh`，当内容高度接近或超过视口高度时，Chrome 渲染 overlay scrollbar 轨道，表现为一条半透明竖线
- 修复：在 `css/screens.css` 中为 `.screen-1-content` 隐藏滚动条（保留滚动能力）：
  - `scrollbar-width: none`（Firefox）
  - `-ms-overflow-style: none`（IE/Edge）
  - `.screen-1-content::-webkit-scrollbar { display: none }`（Chrome/Safari）
- 涉及文件：`css/screens.css`

### Screen 2 招募令流程重构 — 添加过渡引导和剧情衔接
- 需求来源：老师建议星球创建后需要任务引导过渡，不能直接跳招募令
- 新流程（全自动推进，去掉"发布"按钮）：
  1. **思考气泡过渡**：进入Screen 2后先显示半透明气泡，打字效果显示"星球怎么能没有居民呢？赶紧去招募一些星球移民！"，停顿2秒后淡出
  2. **卷轴广播**：气泡消失后卷轴展开，标题打字+正文打字，内容改为老师指定文案（"本星球正式开放移民通道！不限星系、不限物种……"）
  3. **黑影登场**：广播读完后，画面右下角滑入一个模糊黑影，冒出对话"我要来面试！"
  4. **审核官提示**：卷轴和黑影淡出，屏幕中央打字显示金色文字"小小审核官，开始审核吧！"，闪烁强调后自动跳转Screen 3
- 去掉"向全宇宙发布！"按钮，整个Screen 2改为自动剧情推进
- 新增HTML元素：`.thought-bubble`（思考气泡+小圆点）、`.shadow-figure`（黑影+对话框）、`.announce-banner`（审核官提示横幅）
- 新增CSS：思考气泡（毛玻璃半透明）、黑影（径向渐变模糊人形）、审核官提示（金色发光文字居中）
- `recruitment.js` 完全重写，从4阶段自动推进架构：`_showThoughtBubble` → `_startBroadcast` → `_showShadowFigure` → `_showAnnounceBanner` → `goToScreen(3)`
- 涉及文件：`index.html`、`css/screens.css`、`js/recruitment.js`

### Screen 4 深度表达环节重构
- 将 Screen 4 从简单的"邀请身边人"表单改为沉浸式深度表达体验
- 来源：老师提供独立页面 `深度表达的环节/环节三.html`
- 新流程：
  1. **语音提问覆盖层**：进入Screen 4后，全屏覆盖层显示语音播放卡片（轨道环+播放按钮），文字"我能邀请谁加入我的星球呢？为什么？"
  2. **播放音频**：点击播放按钮，播放 `环节三语音.mp3`，播完后覆盖层淡出
  3. **主内容显示**：胶片轮播（小猫/妈妈/爸爸/好朋友照片无缝滚动）+ 全息投影发言提示框（毛玻璃椭圆悬浮）+ 麦克风按钮（台面底部，跳动动画+录音波纹）
  4. **麦克风录音**：点击开始/停止录音，录完后显示"查看星球全景合影"按钮
- 使用 Screen 3 同款背景图（`最新背景.png`）
- 素材文件从 `深度表达的环节/` 复制到项目目录：
  - 图片：`小猫.jpg`、`妈妈.jpg`、`爸爸.jpg`、`好朋友.jpg` → `assets/images/`
  - 音频：`环节三语音.mp3` → `assets/audio/voice/`
- 去掉旧的输入框/邀请列表/emoji头像/发送按钮等表单元素
- CSS：全部新增 Screen 4 专区样式（语音卡片、轨道环、胶片轮播、全息提示、麦克风状态）
- `invite.js` 完全重写
- 涉及文件：`index.html`、`css/screens.css`、`js/invite.js`

### index.html 按环节分类整理
- 每个 Screen section 上方添加环节说明注释块（环节编号、功能描述、对应JS文件）
- 全局元素（星空/流星/BGM/音效开关）统一归到顶部"全局背景 & 公共元素"区
- 底部脚本加载添加环节编号注释
- 去掉 Screen 2 中不再使用的"向全宇宙发布！"按钮

### Bug修复 — Screen 2 进入后卡死无法推进
- 症状：创建星球后进入 Screen 2，页面完全卡住，思考气泡/卷轴/黑影等全不出现
- 原因：`recruitment.js` 的 `_resetElements()` 中仍引用 `document.getElementById('btn-publish')`，但该按钮在 HTML 重构时已删除，返回 `null`，后续 `btn.style.display = 'none'` 抛出 `TypeError`，整个 `enter()` 流程中断
- 修复：删除 `_resetElements()` 中对 `btn-publish` 的引用（2行）
- 涉及文件：`js/recruitment.js`

### Screen 1 星球发光效果 & 名称显示移除
- 移除 `.planet-glow`（星球周围光晕）和 `#planet-name-display`（星球下方名字文字）
- 保留星球图片、颜色/装饰切换、创建动画
- 清理相关 CSS（`.planet-glow`、`.planet-name`）和 `@keyframes planetGlow`
- 从 `tuner.html` 删除"星球尺寸"和"星球名字号"调参控件
- 涉及文件：`index.html`、`css/screens.css`、`css/animations.css`、`js/planet-diy.js`、`tuner.html`

### Screen 2 招募令样式重设计 — 卷轴改为全息面板
- 原方案：金色卷轴杆 + 羊皮纸底色（`#f5e6c4`）+ 棕色文字，与深空紫背景风格不搭
- 新方案：全息投影面板，融入整体深空紫主题
  - 面板：半透明毛玻璃（`backdrop-filter: blur(16px)`），紫色径向渐变底色，淡紫边框 + 发光投影
  - 卷轴杆（`.scroll-decoration`）隐藏
  - 入场动画：`scrollUnroll`（scaleY展开）→ `holoReveal`（scaleY + 轻微透视旋转 + 高亮模糊→清晰，全息质感）
  - 扫描线：顶部一道淡紫光线缓慢扫过面板，增强全息投影感
  - 标题：棕色 → 淡紫发光（`#e8d8ff` + `text-shadow`），emoji 📜 → ✦
  - 正文：深棕色 → 淡紫白色（`rgba(220,210,240,0.85)`）
- 涉及文件：`css/screens.css`、`css/animations.css`、`js/recruitment.js`

### Screen 3 角色名标签改造 — 全息名称标签
- 原方案：角色对话框顶部一个纯 `<div>` 显示名字，样式单调
- 新方案：全息风格名称标签
  - HTML 改为 `dialogue-name-tag > name-deco-line.left + name-text + name-deco-line.right`
  - 左右渐变装饰线从名字两端向外延伸，形成 `—— 玫瑰 ——` 效果
  - 名字文字：字号略大、4px 字间距、双层暖金色 text-shadow 发光、底部呼吸扫描线
  - 入场动画（anime.js）：装饰线从中心展开（scaleX 0→1）、名字从强发光收敛到柔和发光、letterSpacing 8px→4px（全息聚焦感）
- JS：`review.js` 中 `nameEl` 从 `getElementById` 改为 `querySelector('.name-text')`
- tuner.html 同步更新选择器
- 涉及文件：`index.html`、`css/screens.css`、`js/review.js`、`tuner.html`

### Screen 1 星球初始图片 & 默认选色修复
- 星球初始图片从 `planet-blue.png` 改为 `planet-base.png`（无色调基础星球）
- 蓝色按钮去掉默认 `active` class
- `planet-diy.js` 默认 `planetColor` 从 `'blue'` 改为 `''`
- `_getCurrentImageSrc()` 增加空色判断，返回 `planet-base.png`
- 进入页面时星球为灰色调，用户选色后才切换

### 飞行员旁白语音集成
- 新增 `assets/audio/narrator/` 目录，收录 16 段飞行员旁白语音
- 文件命名：`s1-intro.mp3`、`s1-naming.mp3`、`s1-decorate.mp3`、`s2-recruitment.mp3`、`s2-scroll-content.mp3`、`s3-welcome.mp3`、`s3-rose-signal.mp3`、`s3-king-signal.mp3`、`s3-vain-signal.mp3`、`s3-merchant-signal.mp3`、`s3-stamp-prompt.mp3`、`s3-record-prompt.mp3`、`s3-pass-reaction.mp3`、`s3-reject-reaction.mp3`、`s4-transition.mp3`、`s4-mic-prompt.mp3`
- `audio-manager.js`：注册所有旁白 Howl 实例，新增 `playNarrator(name, onEnd)` 和 `stopNarrator(name)` 方法
- 各模块集成旁白：
  - `app.js`：开场旁白（`narratorIntro`）
  - `planet-diy.js`：起名旁白（输入框聚焦时，仅一次）、装扮旁白（首次选色时）
  - `recruitment.js`：招募令串场旁白（进入 Screen 2 时）、招募令内容朗读（`s2-scroll-content.mp3`，14.8s，驱动卷轴展示时长）
  - `review.js`：欢迎旁白、信号检测、角色专属提示、盖章提示、录音提示、通过/拒绝反应、过渡旁白
  - `invite.js`：Screen 4 语音覆盖层改用 Howler 旁白（替换 `<audio>` 元素）

### 旁白音频时序修复 — onEnd 回调驱动
- 问题：多段旁白同时播放重叠（固定 setTimeout 无法适配音频实际时长）
- 修复：全部改为 `playNarrator(name, onEnd)` 回调驱动，前一段说完才触发下一步
  - `enter()` → `narratorS3Welcome` 播完 → 500ms → `_nextCharacter()`
  - `_nextCharacter()` → `narratorSignal` 播完 → 淡出 → `narratorXxxHint` 播完 → 角色入场
  - `_showRecorderPanel()` → `narratorRecordPrompt` 播完 → 淡出 → 显示麦克风
  - `_onAllReviewed()` → `narratorS4Transition` 播完 → 500ms → 跳转 Screen 4
- Screen 1 起名旁白等待开场旁白结束后才播放（轮询 `App.introNarratorDone`）

### 对话框文字与音频统一
- 对话框文字全部改为与旁白音频内容一致：
  - "移民审核控制台" → "移民审核办公室"
  - "你决定通过/拒绝XX的申请" → "嗯，你肯定有自己的考量，说说你的理由吧！"
  - "XX通过了审核！正在前往你的星球..." → "不错的选择！欢迎新居民，正在飞往你的星球……"
  - "XX的申请被拒绝了..." → "嗯，有自己的判断是好事。这位申请者，下次再见吧。"
  - "所有申请者审核完毕！..." → "你的星球还有空位呢。想想你的身边，还有谁值得一张宇宙船票？"
  - 省略号统一为中文 `……`

### Screen 2 黑影移除 & 审核官横幅位置修复
- 移除黑影角色（HTML 元素删除、JS 流程跳过、CSS tuner 覆盖清理）
- 卷轴打完字后直接淡出 → 显示审核官提示，不再经过黑影阶段
- 审核官横幅（`.announce-banner`）位置闪跳修复：
  - 原因：基础 CSS 用 `top:50%;left:50%;transform:translate(-50%,-50%)` 居中，anime.js 做 `scale` 动画时覆盖了 `transform`，导致失去 `translate` 偏移跳位
  - 修复：居中方式改为 `inset:0;margin:auto;width:fit-content;height:fit-content`，不依赖 transform

### Screen 2 招募令展示时长由音频驱动
- 新增 `s2-scroll-content.mp3`（14.8s 招募令内容朗读）
- 卷轴打字速度减慢（`typeSpeed: 60/30` → `140/140`）配合音频朗读节奏
- 淡出时机由音频 `onEnd` 回调驱动，不再靠 Typed.js `onComplete`

### 开始体验覆盖层 — 解决浏览器音频自动播放拦截
- 新增全屏 `.start-overlay`（"小王子星球 / 点击任意位置，开始你的星际旅程"）
- 用户点击覆盖层 → 在 click 回调内播放开场旁白（不被拦截）→ 覆盖层淡出 → Screen 1 入场动画
- 开场旁白从第一帧就响起，零滞后
- 涉及文件：`index.html`、`css/style.css`、`js/app.js`

---

## 2026-04-15

### 线上部署 & 极致性能优化（96MB → 3.4MB）

项目已部署至 GitHub Pages：**https://saturday-script.github.io/little-prince/**

部署仓库：`Saturday-Script/little-prince`，`main` 分支通过 GitHub Actions 自动构建部署。

#### 第一轮压缩（96MB → 30MB）
- TTF 字体转 WOFF2：48MB → 20MB
- 大图 PNG 有损压缩：36MB → 5MB
- BGM 降码率：4MB → 2MB

#### 第二轮压缩（30MB → 21MB）
- 删除未使用的字体字重：NotoSansSC-Light / Regular 未被引用，删除后字体 20MB → 12MB
- `console-bg.png`（468KB）转 JPG 压缩
- `vain.png`（952KB）压缩
- `index.html` 添加 `<link rel="preload">` 预加载 8 张星球图片 + 2 个关键字体
- 页面底部添加后台预加载脚本，用户看 Screen 1 时后台下载角色图 / 背景图

#### 第三轮极致压缩（21MB → 3.4MB）

**字体子集化（12MB → 339KB，缩小 97%）**
- 用 `pyftsubset`（fonttools）扫描 `index.html` + `js/*.js` + `css/*.css` 中所有可见字符，共 498 个唯一字符
- 4 个字体（NotoSansSC-Medium/Bold、MaShanZheng、ZCOOLKuaiLe）全部子集化为仅包含这 498 个字符的 WOFF2
- 单个字体从 3-4MB 降到 44-170KB

**图片全转 WebP（3.7MB → 469KB，缩小 87%）**
- 所有 PNG/JPG 通过 `cwebp` 转为 WebP 格式
- 星球图片：150KB/张 → 6-15KB/张
- 角色图片：250-377KB/张 → 22-30KB/张
- 背景图：119KB → 55KB
- 更新全部引用（`index.html`、`js/planet-diy.js`、`js/characters.js`、`css/screens.css`、`tuner.html`），删除旧 PNG/JPG 文件

**音频降码率（4.7MB → 2.3MB，缩小 52%）**
- BGM：128kbps stereo → 48kbps mono（1.4MB → 1.1MB）
- 旁白语音：全部降至 48kbps mono（语音质量足够）
- 角色配音：同上
- SFX 音效：降至 32kbps mono

**JS 库延迟加载**
- tsparticles（243KB）、wavesurfer（39KB）、typed.js（10KB）加 `defer` 属性，不阻塞首屏渲染
- 仅 anime.js（17KB）和 howler.js（35KB）同步加载（首屏必需）

**图片预加载策略调整**
- `<link rel="preload">` 改为 `<link rel="prefetch">`（低优先级），消除浏览器 "preloaded but not used" 警告

#### 最终部署资源清单

| 类别 | 大小 |
|------|------|
| 字体（4个 WOFF2 子集） | 339KB |
| 图片（22个 WebP） | 469KB |
| 音频（45个 MP3） | 2,287KB |
| JS 库（6个） | 344KB |
| JS 代码（11个模块） | 70KB |
| CSS（4个） | 72KB |
| **部署总计** | **3.4MB** |

**首屏关键路径**：字体 232KB + CSS 72KB + JS 52KB + HTML 15KB + 首屏图 10KB = **~381KB**（GitHub Pages gzip 后约 150KB）

### 音频播放修复 — HTML5 Audio Pool 耗尽问题

- **症状**：点击进入后第一段旁白播不出来，控制台大量 "HTML5 Audio pool exhausted" 警告
- **根因**：`audio-manager.js` 中所有 30+ 个 Howl 实例都设置了 `html5: true`，每个实例立即分配一个 HTML5 `<audio>` 元素，超过浏览器并发限制（~16个），导致后续音频无法获取 audio 对象
- **修复**：
  - 去掉所有 `html5: true`，改用 Howler 默认的 Web Audio API 模式（通过 AudioContext 解码，不受 `<audio>` 元素数量限制）
  - Screen 2+ 的旁白和角色配音加 `preload: false`，按需加载减少初始化开销
  - `playNarrator()` / `playVoice()` / `play()` 方法增加延迟加载处理：检测 `sound.state() === 'unloaded'` 时先 `load()` 再在 `load` 事件回调中 `play()`
- 涉及文件：`js/audio-manager.js`

### 倒计时启动动画 — 解决音频预加载时序

- **需求**：用户点击"开始星际旅程"后，给音频系统足够的缓冲时间
- **方案**：点击后显示 5 秒倒计时动画（"星际引擎启动中…"），期间完成音频准备
- **实现**：
  - HTML：倒计时容器（数字 + SVG 环形进度条 + 提示文字）
  - CSS：环形进度条（stroke-dasharray/dashoffset 动画）、数字弹跳动画（`countdownPop`）
  - JS `_startCountdown()`：每秒更新数字、环形进度（从满到空）、播放 click 音效；归零时播放 create 音效并触发回调
  - 点击回调内立即执行：`Howler.ctx.resume()` 解锁 AudioContext → `AudioManager.sounds.narratorIntro.load()` 预加载首段旁白
  - 倒计时结束后：淡出覆盖层 → 播放开场旁白 → 启动入场动画
- 覆盖层背景改为完全不透明（`rgba` → 纯色），避免穿透看到未加载完的 Screen 1
- 涉及文件：`index.html`、`css/style.css`、`js/app.js`

### Git 提交记录

| 提交 | 说明 |
|------|------|
| `1fb01a8` | 压缩静态资源：96MB → 30MB |
| `da29f95` | 进一步优化加载速度：96MB → 21MB |
| `e2bd395` | 极致压缩：96MB → 3.4MB，首屏关键路径仅381KB |
| `6c2d673` | 倒计时添加音效：每秒 tick 播 click，归零播 create |

---

## 待办 / 已知问题
- [ ] 用户替换皮克斯风格PNG素材后更新图片引用（注意：现在图片格式为 WebP）
- [x] ~~音效文件尚未就位（assets/audio/ 目录为空）~~ → 已用 ffmpeg 合成生成，后续可替换为精美音效
- [ ] 角色配音文件待制作（当前为静音占位）
- [ ] 移动端响应式适配尚未测试
- [ ] Screen 5 Three.js 全景合影需真实素材测试性能
- [ ] 背景图右下角有"豆包AI生成"水印，正式版需去除
- [ ] Screen 3-5 完整交互流程待补充自动化测试（见 TESTCASE.md）
- [x] ~~线上部署~~ → GitHub Pages 已部署，CI/CD 自动化
- [x] ~~页面加载慢~~ → 96MB → 3.4MB（字体子集化 + WebP + 音频压缩 + 延迟加载）
- [x] ~~音频播不出来~~ → 去掉 html5:true 解决 Audio Pool 耗尽 + 倒计时预加载
- [ ] 新增文字内容时需重新运行字体子集化（否则新字符显示为 fallback 字体）
