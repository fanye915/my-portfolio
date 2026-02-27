// 简单的配置
const stocks = ['sh513390', 'sz159652', 'sh588200', 'sh515880', 'sh518880', 'hk03455', 'hk03132', 'hk03147', 'hk03110', 'hk02840', 'gb_qqq', 'gb_spy', 'gb_ring', 'gb_copx', 'gb_bitb'];

function loadMarketData() {
    // 移除旧脚本
    const old = document.getElementById('sina-data');
    if (old) old.remove();

    // 重新创建脚本注入，直接调用新浪接口
    const script = document.createElement('script');
    script.id = 'sina-data';
    script.src = `https://hq.sinajs.cn/list=${stocks.join(',')}`;
    script.charset = 'GBK'; // 新浪数据必须用GBK编码
    
    script.onload = () => {
        console.log("数据加载成功，正在解析...");
        parseData();
    };
    document.body.appendChild(script);
}

function parseData() {
    stocks.forEach(code => {
        const raw = window[`hq_str_${code}`];
        if (!raw) return;
        
        const data = raw.split(',');
        let price = 0;
        if (code.includes('hk')) price = parseFloat(data[6]);
        else if (code.includes('gb_')) price = parseFloat(data[1]);
        else price = parseFloat(data[3]);
        
        console.log(`${code} 最新价: ${price}`);
        // 这里根据获取到的 price 去更新对应的 DOM 元素
        // 比如 document.getElementById(`${code}-price`).innerText = price;
    });
}

// 每分钟刷新
loadMarketData();
setInterval(loadMarketData, 60000);
