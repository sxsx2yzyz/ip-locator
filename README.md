# IP Locator

> 一个轻量级的Chrome插件，能够自动检测网页上的IP地址并显示其地理位置信息，包括国家、城市和ISP信息。

---

## 🔍 功能特性

- 🧠 自动检测网页中的所有IPv4地址
- 📝 文本选中触发，选中IP地址后显示详细信息
- 🌍 使用 [ip-api.com](http://ip-api.com/) 查询IP地理位置数据
- 🇺🇸 显示国家旗帜、城市、地区和ISP信息
- 📋 一键复制：复制IP地址+完整地理位置信息
- ⚡ 快速响应，无性能影响
- 🔒 不收集用户数据，保护隐私
- 💾 智能缓存，避免重复查询
- 📱 响应式设计，支持移动设备
- 🌙 支持深色模式

---

## 📦 安装方法

### 方法一：开发者模式安装

1. 克隆或下载此仓库：
   ```bash
   git clone https://github.com/your-username/ip-locator.git
   cd ip-locator
   ```

2. 打开Chrome浏览器，进入扩展程序页面：
   - 在地址栏输入：`chrome://extensions/`
   - 或者点击菜单 → 更多工具 → 扩展程序

3. 开启"开发者模式"（右上角开关）

4. 点击"加载已解压的扩展程序"，选择项目文件夹

5. 插件安装完成！在工具栏可以看到IP Locator图标

### 方法二：打包安装

1. 在扩展程序页面点击"打包扩展程序"
2. 选择项目根目录
3. 生成.crx文件后拖拽到扩展程序页面安装

---

## 🚀 使用方法

1. **选中查看**：安装插件后，选中任何IP地址，即可显示详细信息弹窗

2. **一键复制**：
   - 点击弹窗中的"📋 复制"按钮
   - 自动复制IP地址+完整地理位置信息
   - 复制成功后会显示绿色通知提示

3. **查看统计**：点击工具栏的IP Locator图标，可以查看：
   - 缓存的地理位置数据数量
   - API查询次数
   - 插件运行状态

4. **管理功能**：
   - 点击"清除缓存"清空地理位置缓存
   - 点击"测试功能"验证插件是否正常工作

5. **测试页面**：打开项目中的 `test.html` 文件来测试插件功能

---

## 🛠️ 技术实现

### 核心功能
- **IP检测**：使用正则表达式 `/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g` 检测IPv4地址
- **地理位置查询**：调用 ip-api.com 的免费API获取位置信息
- **DOM监听**：使用 MutationObserver 监听页面动态内容变化
- **智能缓存**：避免重复查询相同IP地址

### 文件结构
```
ip-locator/
├── manifest.json          # 插件配置文件
├── content.js            # 内容脚本，处理页面IP检测
├── popup.html            # 弹出窗口界面
├── popup.js              # 弹出窗口逻辑
├── styles.css            # 样式文件
├── icons/                # 图标文件夹
├── test.html             # 测试页面
└── README.md             # 说明文档
```

### API使用
插件使用 ip-api.com 的免费API服务：
- 请求格式：`http://ip-api.com/json/{ip}?fields=status,message,country,countryCode,region,regionName,city,isp,org,as,query`
- 响应包含：国家、城市、地区、ISP等信息
- 限制：免费版每分钟45次请求

---

## 🎨 界面特性

- **美观设计**：渐变背景、圆角边框、悬停效果
- **智能定位**：工具提示会根据屏幕边缘自动调整位置，避免被遮挡
- **响应式布局**：适配不同屏幕尺寸
- **深色模式**：自动适配系统主题
- **国家旗帜**：使用Unicode旗帜emoji显示国家
- **加载动画**：查询过程中显示加载状态

---

## 🔧 自定义配置

### 修改API服务
如需使用其他地理位置API服务，修改 `content.js` 中的 `getLocationInfo` 方法：

```javascript
// 替换为其他API服务
const response = await fetch(`https://your-api.com/ip/${ip}`);
```

### 调整样式
修改 `styles.css` 文件来自定义显示样式：

```css
.ip-locator-wrapper {
  /* 自定义样式 */
}
```

---

## 🐛 故障排除

### 常见问题

1. **页面卡死或响应缓慢**
   - 刷新页面重新加载插件
   - 检查浏览器控制台是否有错误信息
   - 尝试使用调试版本：将 `content.js` 替换为 `content-debug.js`
   - 禁用插件后重新启用

2. **插件不工作**
   - 检查是否已启用插件
   - 确认页面包含有效的IP地址
   - 查看浏览器控制台是否有错误信息
   - 确认manifest.json文件配置正确

3. **地理位置查询失败**
   - 检查网络连接
   - 确认API服务可用性
   - 查看是否达到API请求限制（每分钟45次）
   - 检查浏览器是否阻止了跨域请求

4. **样式显示异常**
   - 检查CSS文件是否正确加载
   - 确认没有样式冲突
   - 尝试刷新页面

5. **无限循环或重复处理**
   - 使用调试版本查看详细日志
   - 检查页面是否有大量动态内容
   - 考虑禁用动态内容监听功能

### 调试方法

1. 打开浏览器开发者工具
2. 查看Console标签页的错误信息
3. 在Network标签页检查API请求状态
4. 使用 `test.html` 页面进行功能测试

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至：[your-email@example.com]

---

## 🙏 致谢

- [ip-api.com](http://ip-api.com/) - 提供免费的地理位置API服务
- Chrome Extension API - 提供插件开发框架