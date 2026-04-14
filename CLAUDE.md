# 小王子伴读互动页面

## 项目概述
这是一个《小王子》主题的伴读互动 H5 页面，纯前端项目（HTML/CSS/JS，无构建工具），所有库通过 CDN 引入。目标是让用户通过 6 个互动环节沉浸式体验小王子故事。

## 6 个环节流程
1. **环节一 · 创建星球**（Screen 1）：命名星球、选颜色（蓝/粉）、选装饰（云朵/星环/小行星），9张PNG切换。紫色深空+CSS星空。JS: `planet-diy.js`
2. **环节二 · 发布招募令**（Screen 2）：全自动推进 — 思考气泡("星球怎么能没有居民") → 卷轴广播(招募令文案) → 黑影出现("我要来面试") → "小小审核官，开始审核吧！" → 自动进入环节三。JS: `recruitment.js`
3. **环节三 · 角色审核**（Screen 3）：橙光游戏风格。4角色（玫瑰/国王/爱慕虚荣的人/商人）依次登场道具展示 → 对话 → 盖章(通过/不通过) → 假录音。暖色调控制台背景图。JS: `review.js`, `characters.js`
4. **环节四 · 深度表达**（Screen 4）：语音提问覆盖层(播放`环节三语音.mp3`) → 胶片轮播(小猫/妈妈/爸爸/好朋友) + 全息发言提示 + 麦克风录音。同款背景图。JS: `invite.js`
5. **环节五 · 全景合影 + 串场旁白**（Screen 5）：Three.js 全景场景 + 5段串场旁白（Typed.js逐字显示），描述视频剧本概念，结束后引导进入环节六。JS: `panorama.js`
6. **环节六 · 视频等待页**（Screen 6）：深空紫背景，星球+轨道环旋转，"你的专属星球纪录片正在生成中"等待状态。JS: `video-wait.js`

## 技术栈
- anime.js（动画）、Howler.js（音效）、wavesurfer.js（波形）、Typed.js（打字效果）、Three.js（仅Screen 5全景）
- CSS：`style.css`（全局变量+基础）、`screens.css`（各Screen布局）、`animations.css`（关键帧）
- JS模块：`app.js`（主控）、`planet-diy.js`、`recruitment.js`、`characters.js`、`review.js`、`invite.js`、`panorama.js`、`video-wait.js`、`audio-manager.js`、`recorder.js`、`particles-config.js`

## 项目结构
```
index.html          — 主页面（6个Screen）
css/                — style.css, screens.css, animations.css
js/                 — 11个JS模块
assets/audio/       — bgm/, sfx/, voice/（已用ffmpeg生成占位音效）
assets/images/      — 星球PNG、角色图片、背景图等
tuner.html          — 视觉参数调节器（左侧滑杆+右侧iframe预览）
tuner-server.js     — tuner配套Node服务（端口3456）
DEVLOG.md           — 详细开发日志
TESTCASE.md         — 测试用例
串场词.txt           — 飞行员串场词文案
```

## 当前状态与待办
- 环节1-4 主流程已完成，视觉和交互基本可用
- 环节5 全景合影+串场旁白已完成
- 环节6 视频等待页已完成（视频生成功能待对接后端）
- 尺寸全面使用 clamp/vw/vh 响应式，主要针对大屏优化
- 素材：部分角色仍为SVG占位，待替换为皮克斯风格PNG
- 音效：已有合成占位音效，角色配音待制作
- 移动端适配未测试
- Screen 5 全景合影需真实素材验证性能

## 开发约定
- 修改视觉参数优先用 `tuner.html`（`node tuner-server.js` 启动），调好后保存到CSS
- tuner 保存覆盖块写入 `css/screens.css` 末尾（带 `!important`），标记为 `/* === 调参器生成的覆盖样式 (tuner) === */`
- 所有改动记录到 `DEVLOG.md`
- 背景图右下角有AI水印，正式版需去除
