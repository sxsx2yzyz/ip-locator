// 弹出窗口脚本
document.addEventListener('DOMContentLoaded', function() {
  // 获取当前活动标签页
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    
    // 更新统计信息
    updateStats(currentTab);
    
    // 绑定按钮事件
    document.getElementById('clearCacheBtn').addEventListener('click', function() {
      clearCache(currentTab);
    });
    
    document.getElementById('testBtn').addEventListener('click', function() {
      testFunction(currentTab);
    });
  });
});

// 更新统计信息
function updateStats(tab) {
  // 向内容脚本发送消息获取统计信息
  chrome.tabs.sendMessage(tab.id, {action: 'getStats'}, function(response) {
    if (response && response.success) {
      document.getElementById('cacheCount').textContent = response.cacheCount || 0;
      document.getElementById('queryCount').textContent = response.queryCount || 0;
    } else {
      // 如果内容脚本没有响应，显示默认值
      document.getElementById('cacheCount').textContent = '0';
      document.getElementById('queryCount').textContent = '0';
    }
  });
}

// 清除缓存
function clearCache(tab) {
  chrome.tabs.sendMessage(tab.id, {action: 'clearCache'}, function(response) {
    if (response && response.success) {
      // 更新缓存计数
      document.getElementById('cacheCount').textContent = '0';
      
      // 显示成功消息
      showMessage('缓存已清除');
    } else {
      showMessage('清除缓存失败');
    }
  });
}

// 测试功能
function testFunction(tab) {
  chrome.tabs.sendMessage(tab.id, {action: 'test'}, function(response) {
    if (response && response.success) {
      showMessage('测试完成');
    } else {
      showMessage('测试失败');
    }
  });
}

// 显示消息
function showMessage(message) {
  const statusText = document.querySelector('.status-text');
  const originalText = statusText.textContent;
  
  statusText.textContent = message;
  statusText.style.color = '#4ade80';
  
  setTimeout(() => {
    statusText.textContent = originalText;
    statusText.style.color = '';
  }, 2000);
} 