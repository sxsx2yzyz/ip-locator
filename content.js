// IP地址检测和地理位置显示脚本 - 文本选中模式
class IPLocator {
  constructor() {
    // 防止重复初始化
    if (window.ipLocatorInstance) {
      return window.ipLocatorInstance;
    }
    
    this.ipCache = new Map();
    this.queryCount = 0;
    this.tooltip = null;
    this.currentIP = null;
    this.init();
    
    // 保存实例到全局
    window.ipLocatorInstance = this;
  }

  init() {
    // 等待页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupSelectionDetection());
    } else {
      this.setupSelectionDetection();
    }
    
    // 监听来自弹出窗口的消息
    this.setupMessageListener();
    
    // 创建工具提示元素
    this.createTooltip();
  }

  // 创建工具提示
  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'ip-locator-tooltip';
    this.tooltip.style.cssText = `
      position: fixed;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 13px;
      z-index: 10000;
      pointer-events: auto;
      opacity: 0;
      transition: opacity 0.3s ease;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      max-width: 350px;
      white-space: normal;
      line-height: 1.4;
      transform: scale(0.95);
      transition: opacity 0.3s ease, transform 0.3s ease;
    `;
    document.body.appendChild(this.tooltip);
  }

  // 设置文本选中检测
  setupSelectionDetection() {
    // 监听文本选中事件
    document.addEventListener('mouseup', (e) => {
      setTimeout(() => this.handleTextSelection(e), 10);
    });

    // 监听键盘选中事件
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Meta') {
        setTimeout(() => this.handleTextSelection(e), 10);
      }
    });

    // 监听选择变化事件
    document.addEventListener('selectionchange', (e) => {
      setTimeout(() => this.handleTextSelection(e), 10);
    });

    // 点击其他地方隐藏工具提示
    document.addEventListener('click', (e) => {
      if (this.tooltip && !this.tooltip.contains(e.target)) {
        this.hideTooltip();
      }
    });
  }

  // 处理文本选中
  handleTextSelection(e) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();

    console.log('选中的文本:', selectedText); // 调试日志

    if (!selectedText) {
      this.hideTooltip();
      return;
    }

    // 检测选中的文本是否包含IP地址
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    const matches = selectedText.match(ipRegex);

    console.log('检测到的IP:', matches); // 调试日志

    if (matches && matches.length > 0) {
      const ip = matches[0];
      if (ip !== this.currentIP) {
        this.currentIP = ip;
        console.log('显示工具提示:', ip); // 调试日志
        this.showTooltip(ip, e.clientX, e.clientY);
      }
    } else {
      this.hideTooltip();
    }
  }

  // 显示工具提示
  async showTooltip(ip, x, y) {
    if (!this.tooltip) return;

    console.log('开始显示工具提示:', ip, '位置:', x, y); // 调试日志

    // 使用智能定位
    this.updateTooltipPosition(x, y);
    
    // 立即显示
    this.tooltip.style.opacity = '1';
    this.tooltip.style.transform = 'scale(1)';
    
    // 显示加载状态
    this.tooltip.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: bold; font-family: monospace; font-size: 14px;">${ip}</span>
            <span style="color: #ffd700;">⏳</span>
          </div>
          <button class="copy-btn" data-ip="${ip}" style="background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; font-size: 12px; padding: 4px 8px; border-radius: 4px; opacity: 0.7; transition: opacity 0.2s;">📋 复制</button>
        </div>
        <div style="font-size: 12px; opacity: 0.8;">正在查询地理位置信息...</div>
      </div>
    `;

    // 添加复制按钮事件监听器
    this.setupCopyButton(ip);

    console.log('工具提示已显示，开始查询地理位置'); // 调试日志

    // 获取地理位置信息
    await this.getLocationInfo(ip);
  }

  // 智能定位工具提示
  updateTooltipPosition(mouseX, mouseY) {
    if (!this.tooltip) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 估算工具提示尺寸
    const tooltipWidth = 350;
    const tooltipHeight = 120;
    const margin = 20;
    
    let left, top;
    
    // 水平定位：优先右侧，如果空间不够则左侧
    if (mouseX + tooltipWidth + margin < viewportWidth) {
      left = mouseX + margin;
    } else if (mouseX - tooltipWidth - margin > 0) {
      left = mouseX - tooltipWidth - margin;
    } else {
      left = Math.max(margin, (viewportWidth - tooltipWidth) / 2);
    }
    
    // 垂直定位：优先上方，如果空间不够则下方
    if (mouseY - tooltipHeight - margin > 0) {
      top = mouseY - tooltipHeight - margin;
    } else if (mouseY + tooltipHeight + margin < viewportHeight) {
      top = mouseY + margin;
    } else {
      top = Math.max(margin, (viewportHeight - tooltipHeight) / 2);
    }
    
    this.tooltip.style.left = left + 'px';
    this.tooltip.style.top = top + 'px';
  }

  // 隐藏工具提示
  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.opacity = '0';
      this.tooltip.style.transform = 'scale(0.95)';
      this.currentIP = null;
    }
  }

  // 设置复制按钮
  setupCopyButton(ip) {
    const copyBtn = this.tooltip.querySelector('.copy-btn');
    if (copyBtn) {
      copyBtn.addEventListener('mouseover', () => {
        copyBtn.style.opacity = '1';
      });
      copyBtn.addEventListener('mouseout', () => {
        copyBtn.style.opacity = '0.7';
      });
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.copyToClipboard(ip);
      });
    }
  }

  // 复制到剪贴板
  async copyToClipboard(ip) {
    try {
      // 获取完整的地理位置信息
      const locationInfo = this.ipCache.get(ip);
      let copyText = ip;
      
      if (locationInfo && !locationInfo.error) {
        const flag = this.getCountryFlag(locationInfo.countryCode);
        const locationText = [
          locationInfo.city,
          locationInfo.regionName,
          locationInfo.country
        ].filter(Boolean).join(', ');
        
        copyText = `${ip} - ${flag} ${locationText}`;
        if (locationInfo.isp) {
          copyText += ` (${locationInfo.isp})`;
        }
      }
      
      await navigator.clipboard.writeText(copyText);
      this.showCopyNotification(copyText);
    } catch (err) {
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea');
      textArea.value = copyText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showCopyNotification(copyText);
    }
  }

  // 显示复制成功通知
  showCopyNotification(text) {
    // 创建临时通知
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      font-size: 13px;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.3s ease;
      max-width: 300px;
      word-wrap: break-word;
    `;
    notification.innerHTML = `✅ 已复制: ${text}`;
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // 4秒后自动移除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    }, 4000);
  }

  // 获取地理位置信息
  async getLocationInfo(ip) {
    try {
      // 检查缓存
      if (this.ipCache.has(ip)) {
        this.updateTooltip(ip, this.ipCache.get(ip));
        return;
      }

      this.queryCount++;
      
      // 尝试多个API端点
      let data = null;
      let error = null;
      
      // 首先尝试HTTPS版本
      try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        if (response.ok) {
          data = await response.json();
          // 转换数据格式以匹配我们的期望
          data = {
            status: 'success',
            country: data.country_name,
            countryCode: data.country_code,
            city: data.city,
            region: data.region,
            regionName: data.region,
            isp: data.org,
            org: data.org
          };
        }
      } catch (e) {
        error = e;
      }
      
      // 如果HTTPS失败，尝试HTTP版本
      if (!data) {
        try {
          const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,isp,org,as,query`);
          data = await response.json();
        } catch (e) {
          error = e;
          console.error('所有API请求都失败了:', e);
        }
      }

      if (data && data.status === 'success') {
        // 缓存结果
        this.ipCache.set(ip, data);
        this.updateTooltip(ip, data);
      } else {
        // 显示错误信息
        const errorMessage = data?.message || error?.message || '网络错误';
        this.updateTooltip(ip, { error: errorMessage });
      }
    } catch (error) {
      console.error('获取地理位置信息时出错:', error);
      this.updateTooltip(ip, { error: '查询失败' });
    }
  }

  // 更新工具提示内容
  updateTooltip(ip, locationInfo) {
    if (!this.tooltip) return;

    if (locationInfo.error) {
      this.tooltip.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold; font-family: monospace; font-size: 14px;">${ip}</span>
              <span style="color: #ff6b6b;">❌</span>
            </div>
            <button class="copy-btn" data-ip="${ip}" style="background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; font-size: 12px; padding: 4px 8px; border-radius: 4px; opacity: 0.7; transition: opacity 0.2s;">📋 复制</button>
          </div>
          <div style="font-size: 12px; color: #ff6b6b;">查询失败: ${locationInfo.error}</div>
        </div>
      `;
    } else {
      const flag = this.getCountryFlag(locationInfo.countryCode);
      const locationText = [
        locationInfo.city,
        locationInfo.regionName,
        locationInfo.country
      ].filter(Boolean).join(', ');

      this.tooltip.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold; font-family: monospace; font-size: 14px;">${ip}</span>
              <span style="font-size: 16px;">${flag}</span>
            </div>
            <button class="copy-btn" data-ip="${ip}" style="background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; font-size: 12px; padding: 4px 8px; border-radius: 4px; opacity: 0.7; transition: opacity 0.2s;">📋 复制</button>
          </div>
          <div style="font-size: 12px; opacity: 0.9;">📍 ${locationText}</div>
          ${locationInfo.isp ? `<div style="font-size: 11px; opacity: 0.8; font-style: italic;">🏢 ${locationInfo.isp}</div>` : ''}
        </div>
      `;
    }

    // 重新设置复制按钮事件监听器
    this.setupCopyButton(ip);
  }

  // 获取国家旗帜
  getCountryFlag(countryCode) {
    if (!countryCode) return '🌐';
    
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    
    return String.fromCodePoint(...codePoints);
  }

  // 设置消息监听器
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.action) {
        case 'getStats':
          sendResponse({
            cacheCount: this.ipCache.size,
            queryCount: this.queryCount
          });
          break;
        case 'clearCache':
          this.ipCache.clear();
          sendResponse({ success: true });
          break;
        case 'test':
          // 测试功能：显示一个测试工具提示
          this.showTooltip('8.8.8.8', 100, 100);
          setTimeout(() => this.hideTooltip(), 5000);
          sendResponse({ success: true });
          break;
      }
    });
  }
}

// 初始化IP定位器
new IPLocator(); 