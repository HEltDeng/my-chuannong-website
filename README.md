# 我的川农官网

基于“我的长理”现有官网的页面布局和导航形式，为我的川农制作的绿色主题静态网站。页面内容参照本工作区中的川农 iOS、Android 和后台源码编写，板块是否开放以应用内状态为准。

## 本地运行

无需安装依赖或构建。进入本目录执行：

```sh
python3 -m http.server 5181 --bind 127.0.0.1
```

访问 <http://127.0.0.1:5181/>。停止服务按 `Ctrl+C`。本地开发服务器不会部署网站。不要直接双击 HTML 文件：下载配置、公告和一些交互需要通过 HTTP 加载。

## 页面与维护

- `index.html`：首页，顶部胶囊导航、快捷入口及产品概览。
- `features.html`：按学习、生活、校外园地、学校服务及个人工具介绍现有功能。
- `download.html`、`updates.html`：下载状态与版本记录；目前未启用公开下载。
- `guides.html`、`manual.html`：可搜索的入门指南及说明入口。
- `privacy.html`、`terms.html`、`collection.html`、`third-parties.html`、`services.html`：网站说明以及应用 iOS 2026-10-26.1 版协议内容快照。应用协议变化后应同步核对；各平台以应用内当前版本为准。
- `contact.html`、`commercial.html`、`thanks.html`：反馈、合作和致谢。
- `assets/`：网站样式、脚本、应用图标和 iOS 界面预览。界面图为 iOS 模拟器中的 Xcode 预览，使用明确标注的示例内容，不含学生账号或学习数据。

页面使用相对路径，可放在静态服务器根目录或子目录中。`config/site.json` 为公开配置，不得写入密码、密钥、个人隐私、测试账号或未授权公开的资料。

## 发布配置（未来使用，当前未上线）

1. `android.downloadUrl`、`version`、`releaseDate`、`size` 和 64 位十六进制 `sha256` 均填写且通过核验后，Android 下载按钮才会启用。URL 可使用 HTTPS 或本站绝对路径；正式安装包须由授权发布流程另行提供。本仓库不包含 APK。
2. `ios.downloadUrl` 设置为已核验的 HTTPS App Store 地址后才启用 iOS 下载入口。`releases` 可按最新在前配置 `{ "version", "status", "date", "summary", "items": [] }`，不要填入未发布版本。
3. `qqGroupUrl` 和 `filing.number` / `filing.url` 留空时不会显示未经确认的群链接或备案号。配置时只填用户确认的公开信息。
4. `announcementPath` 默认是同源 `/api/v1/public/website-announcements`，对应川农后台独立的网站公告接口。域名确定并获准部署时，需要由站点服务器把此路径反向代理到川农后台；不要把后台管理端口直接公开。接口不可用或没有公告时公告区域自动隐藏，静态页面仍可使用。显示的公告按 `id + updatedAt` 在本机保存已读状态；页面每五分钟重新查询，不读取 App 公告。内容使用纯文本渲染。
5. 确认网站静态文件、备案信息、隐私内容、下载附件、反向代理和实际发布状态后再进行部署。上传源码不等于公开发布网站或 App。

## 样式与素材

页面布局与 CSS 基于用户自有的 `HEltDeng/my-changli-website` 主线，已更换川农品牌和绿色配色，未使用长理产品截图、QQ群、下载地址或备案号。应用图标来自同一工作区的川农 iOS 工程。图标许可见 `THIRD_PARTY_NOTICES.md` 与 `TDESIGN_LICENSE.txt`。
