# IP Locator 安装指南

## 🚀 快速安装

### 步骤 1: 下载项目
```bash
git clone https://github.com/your-username/ip-locator.git
cd ip-locator
```

### 步骤 2: 打开Chrome扩展程序页面
1. 在Chrome地址栏输入：`chrome://extensions/`
2. 或者点击菜单 → 更多工具 → 扩展程序

### 步骤 3: 启用开发者模式
- 点击右上角的"开发者模式"开关

### 步骤 4: 加载插件
1. 点击"加载已解压的扩展程序"按钮
2. 选择项目文件夹（包含manifest.json的文件夹）
3. 点击"选择文件夹"

### 步骤 5: 验证安装
- 在Chrome工具栏中应该能看到IP Locator图标
- 访问任何包含IP地址的网页测试功能

## 🧪 测试插件

1. 打开项目中的 `test.html` 文件
2. 或者访问包含IP地址的网站（如：https://whatismyipaddress.com/）
3. 观察IP地址旁边是否显示地理位置信息

## 🔧 故障排除

### 插件不显示
- 确认已启用开发者模式
- 检查manifest.json文件是否存在
- 重新加载插件

### IP地址不检测
- 确认页面包含有效的IPv4地址
- 检查浏览器控制台是否有错误
- 刷新页面重试

### 地理位置查询失败
- 检查网络连接
- 确认ip-api.com服务可用
- 查看是否达到API请求限制

## 📱 移动端支持

Chrome插件在移动端Chrome浏览器中可能无法正常工作，这是Chrome的限制。

## 🔄 更新插件

1. 下载最新版本
2. 在扩展程序页面点击"重新加载"
3. 或者删除后重新安装

## 🗑️ 卸载插件

1. 在扩展程序页面找到IP Locator
2. 点击"删除"按钮
3. 确认删除

## 📞 获取帮助

如果遇到问题，请：
1. 查看README.md文件
2. 提交GitHub Issue
3. 检查浏览器控制台错误信息 