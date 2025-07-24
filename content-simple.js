// IP地址检测和地理位置显示脚本 - 简化版本（无动态监听）
class IPLocator {
  constructor() {
    this.ipCache = new Map();
    this.ipCount = 0;
    this.init();
  }

  init() {
    // 等待页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.processPage());
    } else {
      this.processPage();
    }
    
    // 监听来自弹出窗口的消息
    this.setupMessageListener();
  }

  // 处理页面内容
  processPage() {
    console.log('[IP Locator] 开始处理页面内容');
    
    const textNodes = this.getTextNodes(document.body);
    console.log(`[IP Locator] 找到 ${textNodes.length} 个文本节点`);
    
    let processedCount = 0;
    textNodes.forEach((node, index) => {
      if (this.processTextNode(node)) {
        processedCount++;
      }
    });
    
    console.log(`[IP Locator] 页面处理完成，处理了 ${processedCount} 个包含IP的节点`);
  }

  // 获取所有文本节点
  getTextNodes(element) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // 排除脚本、样式标签中的内容
          if (node.parentElement && 
              (node.parentElement.tagName === 'SCRIPT' || 
               node.parentElement.tagName === 'STYLE' ||
               node.parentElement.classList.contains('ip-locator-processed') ||
               node.parentElement.classList.contains('ip-locator-wrapper'))) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node);
    }
    return textNodes;
  }

  // 处理文本节点
  processTextNode(textNode) {
    const text = textNode.textContent;
    const ipRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
    const matches = text.match(ipRegex);

    if (!matches) return false;

    console.log(`[IP Locator] 在文本中找到 ${matches.length} 个IP地址:`, matches);

    // 标记父元素已处理
    if (textNode.parentElement) {
      textNode.parentElement.classList.add('ip-locator-processed');
    }

    // 为每个IP地址创建包装器
    let lastIndex = 0;
    const fragment = document.createDocumentFragment();

    matches.forEach((ip) => {
      const ipIndex = text.indexOf(ip, lastIndex);
      
      // 添加IP前的文本
      if (ipIndex > lastIndex) {
        const textNode = document.createTextNode(text.substring(lastIndex, ipIndex));
        fragment.appendChild(textNode);
      }

      // 创建IP包装器
      const ipWrapper = this.createIPWrapper(ip);
      fragment.appendChild(ipWrapper);

      lastIndex = ipIndex + ip.length;
    });

    // 添加剩余文本
    if (lastIndex < text.length) {
      const textNode = document.createTextNode(text.substring(lastIndex));
      fragment.appendChild(textNode);
    }

    // 替换原文本节点
    if (textNode.parentNode) {
      textNode.parentNode.replaceChild(fragment, textNode);
      console.log(`[IP Locator] 成功替换文本节点，包含IP: ${matches.join(', ')}`);
    }

    return true;
  }

  // 创建IP地址包装器
  createIPWrapper(ip) {
    const wrapper = document.createElement('span');
    wrapper.className = 'ip-locator-wrapper';
    wrapper.innerHTML = `
      <span class="ip-address">${ip}</span>
      <span class="ip-location" data-ip="${ip}">
        <span class="loading">查询中...</span>
      </span>
    `;

    // 增加IP计数
    this.ipCount++;
    console.log(`[IP Locator] 创建IP包装器: ${ip} (总计: ${this.ipCount})`);

    // 异步获取地理位置信息
    this.getLocationInfo(ip, wrapper);

    return wrapper;
  }

  // 获取地理位置信息
  async getLocationInfo(ip, wrapper) {
    try {
      // 检查缓存
      if (this.ipCache.has(ip)) {
        console.log(`[IP Locator] 使用缓存数据: ${ip}`);
        this.updateLocationDisplay(wrapper, this.ipCache.get(ip));
        return;
      }

      console.log(`[IP Locator] 开始查询IP地理位置: ${ip}`);
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,isp,org,as,query`);
      const data = await response.json();

      if (data.status === 'success') {
        const locationInfo = {
          country: data.country,
          countryCode: data.countryCode,
          city: data.city,
          region: data.regionName,
          isp: data.isp,
          org: data.org
        };

        console.log(`[IP Locator] 查询成功: ${ip} -> ${locationInfo.city}, ${locationInfo.country}`);

        // 缓存结果
        this.ipCache.set(ip, locationInfo);
        this.updateLocationDisplay(wrapper, locationInfo);
      } else {
        console.log(`[IP Locator] 查询失败: ${ip} - ${data.message}`);
        this.updateLocationDisplay(wrapper, { error: '查询失败' });
      }
    } catch (error) {
      console.log(`[IP Locator] 查询出错: ${ip} -`, error);
      this.updateLocationDisplay(wrapper, { error: '网络错误' });
    }
  }

  // 更新位置显示
  updateLocationDisplay(wrapper, locationInfo) {
    const locationElement = wrapper.querySelector('.ip-location');
    if (!locationElement) {
      console.log('[IP Locator] 找不到位置显示元素');
      return;
    }
    
    if (locationInfo.error) {
      locationElement.innerHTML = `<span class="error">${locationInfo.error}</span>`;
      return;
    }

    const flag = this.getCountryFlag(locationInfo.countryCode);
    const locationText = [
      locationInfo.city,
      locationInfo.region,
      locationInfo.country
    ].filter(Boolean).join(', ');

    locationElement.innerHTML = `
      <span class="flag">${flag}</span>
      <span class="location-text">${locationText}</span>
      ${locationInfo.isp ? `<span class="isp">${locationInfo.isp}</span>` : ''}
    `;
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
    console.log('[IP Locator] 设置消息监听器');
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('[IP Locator] 收到消息:', request);
      
      switch (request.action) {
        case 'getStats':
          sendResponse({
            success: true,
            ipCount: this.ipCount,
            cacheCount: this.ipCache.size
          });
          break;
        case 'clearCache':
          this.ipCache.clear();
          console.log('[IP Locator] 缓存已清除');
          sendResponse({ success: true });
          break;
        default:
          sendResponse({ success: false });
      }
    });
  }
}

// 初始化IP定位器
console.log('[IP Locator] 简化版本启动（无动态监听）');
new IPLocator(); 