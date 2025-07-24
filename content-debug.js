// IP地址检测和地理位置显示脚本 - 调试版本
class IPLocator {
  constructor() {
    // 防止重复初始化
    if (window.ipLocatorInstance) {
      this.log('检测到已存在的实例，返回现有实例');
      return window.ipLocatorInstance;
    }
    
    this.ipCache = new Map();
    this.queryCount = 0;
    this.tooltip = null;
    this.currentIP = null;
    this.debugMode = true;
    this.init();
    
    // 保存实例到全局
    window.ipLocatorInstance = this;
    this.log('IPLocator实例已创建并保存到全局');
  }

  log(message, data = null) {
    if (this.debugMode) {
      console.log(`[IP Locator] ${message}`, data || '');
    }
  }

  init() {
    this.log('初始化IP定位器');
    
    // 等待页面加载完成
    if (document.readyState === 'loading') {
      this.log('页面正在加载，等待DOMContentLoaded事件');
      document.addEventListener('DOMContentLoaded', () => {
        this.log('DOMContentLoaded事件触发');
        this.setupHoverDetection();
      });
    } else {
      this.log('页面已加载完成，直接设置');
      this.setupHoverDetection();
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
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 10000;
      pointer-events: auto;
      opacity: 0;
      transition: opacity 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 300px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    `;
    document.body.appendChild(this.tooltip);
    this.log('工具提示元素已创建');
  }

  // 设置悬停检测
  setupHoverDetection() {
    this.log('设置悬停检测');
    
    // 使用事件委托监听鼠标移动
    document.addEventListener('mouseover', (e) => {
      this.handleMouseOver(e);
    });

    document.addEventListener('mouseout', (e) => {
      this.handleMouseOut(e);
    });

    document.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });

    // 添加双击复制功能
    document.addEventListener('dblclick', (e) => {
      this.handleDoubleClick(e);
    });
  }

  // 处理鼠标悬停
  handleMouseOver(e) {
    const text = e.target.textContent || '';
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    const matches = text.match(ipRegex);

    if (matches && matches.length > 0) {
      const ip = matches[0];
      this.log(`检测到IP地址: ${ip}`);
      
      if (ip !== this.currentIP) {
        this.currentIP = ip;
        this.showTooltip(ip, e.clientX, e.clientY);
      }
    }
  }

  // 处理鼠标移出
  handleMouseOut(e) {
    this.hideTooltip();
    this.currentIP = null;
  }

  // 处理鼠标移动
  handleMouseMove(e) {
    // 只有在工具提示刚显示时才更新位置，避免跟随鼠标移动
    if (this.tooltip && this.currentIP && !this.tooltipFixed) {
      this.updateTooltipPosition(e.clientX, e.clientY);
    }
  }

  // 处理双击复制
  handleDoubleClick(e) {
    const text = e.target.textContent || '';
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    const matches = text.match(ipRegex);

    if (matches && matches.length > 0) {
      const ip = matches[0];
      this.log(`双击复制IP地址: ${ip}`);
      this.copyToClipboard(ip);
    }
  }

  // 复制到剪贴板
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.log(`复制成功: ${text}`);
      this.showCopyNotification(text);
    } catch (err) {
      this.log(`现代API复制失败，使用降级方案: ${err.message}`);
      // 降级方案：使用传统方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.log(`降级方案复制成功: ${text}`);
      this.showCopyNotification(text);
    }
  }

  // 显示复制成功通知
  showCopyNotification(ip) {
    this.log(`显示复制通知: ${ip}`);
    // 创建临时通知
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      font-size: 14px;
      z-index: 10001;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `✅ 已复制: ${ip}`;
    
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
    
    // 3秒后自动移除
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      this.log('复制通知已移除');
    }, 3000);
  }

  // 显示工具提示
  async showTooltip(ip, x, y) {
    if (!this.tooltip) return;

    this.log(`显示工具提示: ${ip} at (${x}, ${y})`);

    // 重置固定状态
    this.tooltipFixed = false;
    
    // 使用智能定位
    this.updateTooltipPosition(x, y);
    this.tooltip.style.opacity = '1';
    
    // 显示加载状态
    this.tooltip.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-weight: bold; font-family: monospace;">${ip}</span>
        <span style="color: #ffd700;">查询中...</span>
      </div>
    `;

    // 获取地理位置信息
    await this.getLocationInfo(ip);
  }

  // 智能定位工具提示（使用页面内验证过的逻辑）
  updateTooltipPosition(mouseX, mouseY) {
    if (!this.tooltip) return;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 保守的估算尺寸
    const tooltipWidth = 320;
    const tooltipHeight = 100;
    const margin = 20;
    
    let left, top;
    
    // 水平定位
    if (mouseX + tooltipWidth + margin < viewportWidth) {
      left = mouseX + margin;
      this.log(`工具提示显示在右侧: ${left}px`);
    } else if (mouseX - tooltipWidth - margin > 0) {
      left = mouseX - tooltipWidth - margin;
      this.log(`工具提示显示在左侧: ${left}px`);
    } else {
      left = Math.max(margin, (viewportWidth - tooltipWidth) / 2);
      this.log(`工具提示居中显示: ${left}px`);
    }
    
    // 垂直定位
    if (mouseY - tooltipHeight - margin > 0) {
      top = mouseY - tooltipHeight - margin;
      this.log(`工具提示显示在上方: ${top}px`);
    } else if (mouseY + tooltipHeight + margin < viewportHeight) {
      top = mouseY + margin;
      this.log(`工具提示显示在下方: ${top}px`);
    } else {
      top = Math.max(margin, (viewportHeight - tooltipHeight) / 2);
      this.log(`工具提示垂直居中: ${top}px`);
    }
    
    this.tooltip.style.left = left + 'px';
    this.tooltip.style.top = top + 'px';
    
    this.log(`最终工具提示位置: (${left}, ${top})`);
  }

  // 隐藏工具提示
  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.style.opacity = '0';
    }
  }

  // 获取地理位置信息
  async getLocationInfo(ip) {
    try {
      // 检查缓存
      if (this.ipCache.has(ip)) {
        this.log(`使用缓存数据: ${ip}`);
        this.updateTooltip(ip, this.ipCache.get(ip));
        return;
      }

      this.log(`开始查询IP地理位置: ${ip}`);
      this.queryCount++;
      
      // 测试网络连接
      this.log('测试网络连接...');
      
      // 首先尝试HTTPS版本
      let data = null;
      let error = null;
      
      this.log('尝试HTTPS API: ipapi.co');
      try {
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        this.log(`HTTPS响应状态: ${response.status}`);
        
        if (response.ok) {
          data = await response.json();
          this.log('HTTPS API响应数据:', data);
          
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
        } else {
          this.log(`HTTPS API错误: ${response.status} ${response.statusText}`);
        }
      } catch (e) {
        error = e;
        this.log('HTTPS API请求失败:', e);
      }
      
      // 如果HTTPS失败，尝试HTTP版本
      if (!data) {
        this.log('尝试HTTP API: ip-api.com');
        try {
          const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,isp,org,as,query`);
          this.log(`HTTP响应状态: ${response.status}`);
          
          if (response.ok) {
            data = await response.json();
            this.log('HTTP API响应数据:', data);
          } else {
            this.log(`HTTP API错误: ${response.status} ${response.statusText}`);
          }
        } catch (e) {
          error = e;
          this.log('HTTP API请求失败:', e);
        }
      }

      if (data && data.status === 'success') {
        const locationInfo = {
          country: data.country,
          countryCode: data.countryCode,
          city: data.city,
          region: data.regionName,
          isp: data.isp,
          org: data.org
        };

        this.log(`查询成功: ${ip} -> ${locationInfo.city}, ${locationInfo.country}`);

        // 缓存结果
        this.ipCache.set(ip, locationInfo);
        this.updateTooltip(ip, locationInfo);
      } else {
        this.log(`查询失败: ${ip} - ${data?.message || '未知错误'}`);
        this.updateTooltip(ip, { error: `查询失败: ${data?.message || '未知错误'}` });
      }
    } catch (error) {
      this.log(`查询出错: ${ip} -`, error);
      this.updateTooltip(ip, { error: `网络错误: ${error.message}` });
    }
  }

  // 更新工具提示内容
  updateTooltip(ip, locationInfo) {
    if (!this.tooltip || this.currentIP !== ip) return;
    
    // 固定工具提示位置，不再跟随鼠标移动
    this.tooltipFixed = true;
    this.log('工具提示位置已固定');
    
    if (locationInfo.error) {
      this.tooltip.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold; font-family: monospace;">${ip}</span>
              <span style="color: #ff6b6b;">❌</span>
            </div>
            <button class="copy-btn" data-ip="${ip}" style="background: none; border: none; color: white; cursor: pointer; font-size: 12px; padding: 2px 6px; border-radius: 3px; opacity: 0.7; transition: opacity 0.2s;">📋</button>
          </div>
          <div style="font-size: 11px; color: #ff6b6b;">${locationInfo.error}</div>
        </div>
      `;
    } else {
      const flag = this.getCountryFlag(locationInfo.countryCode);
      const locationText = [
        locationInfo.city,
        locationInfo.region,
        locationInfo.country
      ].filter(Boolean).join(', ');

      this.tooltip.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: bold; font-family: monospace;">${ip}</span>
              <span style="font-size: 14px;">${flag}</span>
            </div>
            <button class="copy-btn" data-ip="${ip}" style="background: none; border: none; color: white; cursor: pointer; font-size: 12px; padding: 2px 6px; border-radius: 3px; opacity: 0.7; transition: opacity 0.2s;">📋</button>
          </div>
          <div style="font-size: 11px; opacity: 0.9;">${locationText}</div>
          ${locationInfo.isp ? `<div style="font-size: 10px; opacity: 0.8; font-style: italic;">${locationInfo.isp}</div>` : ''}
        </div>
      `;
    }

    // 添加复制按钮事件监听器
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
        const ip = copyBtn.getAttribute('data-ip');
        this.log(`点击复制按钮: ${ip}`);
        this.copyToClipboard(ip);
      });
    }
  }

  // 获取国家旗帜emoji
  getCountryFlag(countryCode) {
    if (!countryCode) return '🌍';
    
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    
    return String.fromCodePoint(...codePoints);
  }

  // 设置消息监听器
  setupMessageListener() {
    this.log('设置消息监听器');
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.log('收到消息:', request);
      
      switch (request.action) {
        case 'getStats':
          sendResponse({
            success: true,
            cacheCount: this.ipCache.size,
            queryCount: this.queryCount
          });
          break;
        case 'clearCache':
          this.ipCache.clear();
          this.queryCount = 0;
          this.log('缓存已清除');
          sendResponse({ success: true });
          break;
        case 'test':
          // 测试功能：显示一个测试工具提示
          this.showTooltip('8.8.8.8', 100, 100);
          setTimeout(() => this.hideTooltip(), 3000);
          sendResponse({ success: true });
          break;
        default:
          sendResponse({ success: false });
      }
    });
  }
}

// 初始化IP定位器
console.log('IP Locator 调试版本启动');
new IPLocator(); 