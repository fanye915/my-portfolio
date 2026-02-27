// 1. 定义你的初始持仓（请根据2026年1月初的实际开盘价修改 buyPrice）
const portfolioData = {
    A: {
        currency: '¥', 
        capital: 1000000,
        stocks: [
            { code: 'sh513390', weight: 0.25, buyPrice: 2.108, name: '纳指100ETF' },
            { code: 'sz159652', weight: 0.25, buyPrice: 1.705, name: '有色50ETF' },
            { code: 'sh588200', weight: 0.25, buyPrice: 2.373, name: '科创芯片ETF' },
            { code: 'sh515880', weight: 0.15, buyPrice: 1.041, name: '通信ETF' },
            { code: 'sh518880', weight: 0.10, buyPrice: 9.421, name: '黄金ETF' }
        ]
    },
    HK: {
        currency: 'HK$', 
        capital: 1000000,
        stocks: [
            { code: 'hk03455', weight: 0.25, buyPrice: 15.2, name: '纳指100' },
            { code: 'hk03132', weight: 0.20, buyPrice: 8.5, name: '全球半导体' },
            { code: 'hk03147', weight: 0.20, buyPrice: 7.2, name: '创业板' },
            { code: 'hk03110', weight: 0.20, buyPrice: 12.0, name: '高股息' },
            { code: 'hk02840', weight: 0.15, buyPrice: 1500.0, name: '黄金ETF' }
        ]
    },
    US: {
        currency: '$', 
        capital: 1000000,
        stocks: [
            { code: 'gb_qqq', weight: 0.25, buyPrice: 450.0, name: 'QQQ' },
            { code: 'gb_spy', weight: 0.25, buyPrice: 520.0, name: 'SPY' },
            { code: 'gb_ring', weight: 0.20, buyPrice: 35.0, name: 'RING' },
            { code: 'gb_copx', weight: 0.20, buyPrice: 45.0, name: 'COPX' },
            { code: 'gb_bitb', weight: 0.10, buyPrice: 40.0, name: 'BITB' }
        ]
    }
};

// 2. 动态加载新浪数据的核心函数
function updateAllData() {
    const allCodes = [];
    Object.values(portfolioData).forEach(p => p.stocks.forEach(s => allCodes.push(s.code)));
    
    // 创建一个 script 标签，利用新浪 API 的 JS 回调机制
    const script = document.createElement('script');
    script.src = `https://hq.sinajs.cn/list=${allCodes.join(',')}`;
    // 新浪接口要求 GBK 编码
    script.charset = "GBK"; 
    
    script.onload = () => {
        calculateAndRender();
        document.body.removeChild(script);
    };
    document.body.appendChild(script);
}

// 3. 计算逻辑
function calculateAndRender() {
    let totalTableHtml = '';
    
    ['A', 'HK', 'US'].forEach(key => {
        let currentGroupValue = 0;
        const group = portfolioData[key];
        
        group.stocks.forEach(stock => {
            // 从新浪返回的全局变量中提取数据 (变量名如 hq_str_sh513390)
            const rawData = window[`hq_str_${stock.code}`];
            if (!rawData) return;
            
            const parts = rawData.split(',');
            let currentPrice = 0;
            
            // 处理不同市场的数据格式
            if (stock.code.includes('hk')) currentPrice = parseFloat(parts[6]); // 港股现价在第6位
            else if (stock.code.includes('gb_')) currentPrice = parseFloat(parts[1]); // 美股现价在第1位
            else currentPrice = parseFloat(parts[3]); // A股现价在第3位

            const changePercent = ((currentPrice - stock.buyPrice) / stock.buyPrice * 100).toFixed(2);
            const stockValue = group.capital * stock.weight * (currentPrice / stock.buyPrice);
            currentGroupValue += stockValue;

            totalTableHtml += `
                <tr class="border-t">
                    <td class="p-4 font-medium">${stock.name}</td>
                    <td class="p-4 text-gray-500">${stock.buyPrice}</td>
                    <td class="p-4 font-mono">${currentPrice.toFixed(3)}</td>
                    <td class="p-4 ${changePercent >= 0 ? 'text-red-500' : 'text-green-500'}">${changePercent}%</td>
                </tr>
            `;
        });

        // 更新顶部卡片
        const nav = currentGroupValue.toLocaleString(undefined, {minimumFractionDigits: 2});
        const totalProfit = ((currentGroupValue / group.capital - 1) * 100).toFixed(2);
        
        document.getElementById(`${key.toLowerCase()}-nav`).innerText = `${group.currency} ${nav}`;
        document.getElementById(`${key.toLowerCase()}-profit`).innerText = `累计收益: ${totalProfit}%`;
        document.getElementById(`${key.toLowerCase()}-profit`).className = `text-sm ${totalProfit >= 0 ? 'text-red-500' : 'text-green-500'}`;
    });

    document.getElementById('stock-table-body').innerHTML = totalTableHtml;
}

// 每 30 秒自动刷新一次
updateAllData();
setInterval(updateAllData, 30000);
