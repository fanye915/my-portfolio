const portfolioData = {
    A: { currency: '¥', capital: 1000000, stocks: [
        { code: 'sh513390', weight: 0.25, buyPrice: 1.425, name: '纳指100' },
        { code: 'sz159652', weight: 0.25, buyPrice: 0.882, name: '有色50' },
        { code: 'sh588200', weight: 0.25, buyPrice: 1.056, name: '科创芯片' },
        { code: 'sh515880', weight: 0.15, buyPrice: 1.124, name: '通信ETF' },
        { code: 'sh518880', weight: 0.10, buyPrice: 9.779, name: '黄金ETF' }
    ]},
    HK: { currency: 'HK$', capital: 1000000, stocks: [
        { code: 'hk03455', weight: 0.25, buyPrice: 22.35, name: '纳指100' },
        { code: 'hk03132', weight: 0.20, buyPrice: 10.45, name: '全球半导体' },
        { code: 'hk03147', weight: 0.20, buyPrice: 8.12, name: '创业板' },
        { code: 'hk03110', weight: 0.20, buyPrice: 30.33, name: '高股息' },
        { code: 'hk02840', weight: 0.15, buyPrice: 1560.50, name: '黄金ETF' }
    ]},
    US: { currency: '$', capital: 1000000, stocks: [
        { code: 'gb_qqq', weight: 0.25, buyPrice: 585.40, name: 'QQQ' },
        { code: 'gb_spy', weight: 0.25, buyPrice: 562.15, name: 'SPY' },
        { code: 'gb_ring', weight: 0.20, buyPrice: 38.20, name: 'RING' },
        { code: 'gb_copx', weight: 0.20, buyPrice: 88.65, name: 'COPX' },
        { code: 'gb_bitb', weight: 0.10, buyPrice: 52.30, name: 'BITB' }
    ]}
};

function updateAllData() {
    const allCodes = [];
    Object.values(portfolioData).forEach(p => p.stocks.forEach(s => allCodes.push(s.code)));
    
    // 清除旧的脚本标签，防止内存溢出
    const oldScript = document.getElementById('sina-api-script');
    if (oldScript) oldScript.remove();

    const script = document.createElement('script');
    script.id = 'sina-api-script';
    // 强制使用 https 并添加随机数防止缓存
    script.src = `https://hq.sinajs.cn/list=${allCodes.join(',')}?_=${Math.random()}`;
    script.charset = "GBK"; 
    
    script.onload = () => {
        try {
            calculateAndRender();
        } catch (e) {
            console.error("计算出错:", e);
        }
    };
    document.body.appendChild(script);
}

function calculateAndRender() {
    let totalTableHtml = '';
    
    ['A', 'HK', 'US'].forEach(key => {
        let currentGroupValue = 0;
        const group = portfolioData[key];
        
        group.stocks.forEach(stock => {
            const rawData = window[`hq_str_${stock.code}`];
            if (!rawData || rawData.length < 10) {
                console.warn(`未获取到数据: ${stock.code}`);
                return;
            }
            
            const parts = rawData.split(',');
            let currentPrice = 0;
            
            // 修正新浪 API 解析逻辑
            if (stock.code.includes('hk')) currentPrice = parseFloat(parts[6]); 
            else if (stock.code.includes('gb_')) currentPrice = parseFloat(parts[1]); 
            else currentPrice = parseFloat(parts[3]); 

            if (isNaN(currentPrice) || currentPrice === 0) return;

            const changePercent = ((currentPrice - stock.buyPrice) / stock.buyPrice * 100).toFixed(2);
            const stockValue = group.capital * stock.weight * (currentPrice / stock.buyPrice);
            currentGroupValue += stockValue;

            totalTableHtml += `
                <tr class="border-t">
                    <td class="p-4 font-medium">${stock.name}</td>
                    <td class="p-4 text-gray-500">${stock.buyPrice}</td>
                    <td class="p-4 font-mono">${currentPrice.toFixed(3)}</td>
                    <td class="p-4 ${changePercent >= 0 ? 'text-red-500' : 'text-green-500'} font-bold">${changePercent}%</td>
                </tr>`;
        });

        const nav = currentGroupValue.toLocaleString(undefined, {minimumFractionDigits: 2});
        const totalProfit = ((currentGroupValue / group.capital - 1) * 100).toFixed(2);
        
        const navEl = document.getElementById(`${key.toLowerCase()}-nav`);
        const profitEl = document.getElementById(`${key.toLowerCase()}-profit`);
        
        if (navEl) navEl.innerText = `${group.currency} ${nav}`;
        if (profitEl) {
            profitEl.innerText = `累计收益: ${totalProfit}%`;
            profitEl.className = `text-sm ${totalProfit >= 0 ? 'text-red-500' : 'text-green-500'}`;
        }
    });

    const tableBody = document.getElementById('stock-table-body');
    if (tableBody) tableBody.innerHTML = totalTableHtml;
}

// 确保 DOM 加载完成后再执行
window.addEventListener('load', () => {
    updateAllData();
    setInterval(updateAllData, 30000);
});
