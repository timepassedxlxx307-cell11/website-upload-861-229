部署说明

本目录为纯静态电影网站，可直接上传到任意静态空间、对象存储或 CDN。

生成结果：
- 首页：index.html
- 分类总览页：categories.html
- 独立分类页：categories/*.html
- 排行榜：ranking.html
- 搜索页：search.html
- 影片详情页：detail/*.html
- 影片数量：2000

图片路径：页面已按规则引用网站根目录下的 1.jpg 到 150.jpg。请将对应图片文件放在网站根目录。

播放器：详情页使用 m3u8 播放地址，并在点击播放时初始化 HLS。
