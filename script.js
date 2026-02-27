/* 版本号：3.0 - 代理绕路版 */
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

async function updateAllData() {
    const allCodes = [];
    Object.values(portfolioData).forEach(p => p.stocks.forEach(s => allCodes.push(s.code)));
    
    const sinaUrl = `https://hq.sinajs.cn/list=${allCodes.join(',')}`;
    // 改用 Codetabs 代理，这个代理非常直接，不需要二次解析 JSON
    const proxyUrl = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(sinaUrl)}`;

    try {
        const response = await fetch(proxyUrl);
        const text = await response.text();
        if (text.includes('hq_str')) {
            parseSinaData(text);
        } else {
            console.error("数据格式异常");
        }
    } catch (error) {
        console.error("代理请求失败:", error);
    }
}

function parseSinaData(rawString) {
    let totalTableHtml = '';
    
    ['A', 'HK', 'US'].forEach(key => {
        let currentGroupValue = 0;
        const group = portfolioData[key];
        
        group.stocks.forEach(stock => {
            const searchStr = `hq_str_${stock.code}="`;
            const start = rawString.indexOf(searchStr);
            if (start === -1) return;
            
            const end = rawString.indexOf('";', start);
            const content = rawString.substring(start + searchStr.length, end);
            const parts = content.split(',');
            
            let currentPrice = 0;
            if (stock.code.includes('hk')) currentPrice = parseFloat(parts[6]); 
            else if (stock.code.includes('gb_')) currentPrice = parseFloat(parts[1]); 
            else currentPrice = parseFloat(parts[3]); 

            if (!isNaN(currentPrice) && currentPrice > 0) {
                const changePercent = ((currentPrice - stock.buyPrice) / stock.buyPrice * 100).toFixed(2);
                const stockValue = group.capital * stock.weight * (currentPrice / stock.buyPrice);
                currentGroupValue += stockValue;

                totalTableHtml += `
                    <tr class="border-t">
                        <td class="p-4 font-medium">${stock.name}</td>
                        <td class="p-4 text-gray-500">${stock.buyPrice}</td>
                        <td class="p-4 font-mono font-bold">${currentPrice.toFixed(3)}</td>
                        <td class="p-4 ${changePercent >= 0 ? 'text-red-600' : 'text-green-600'}">
                            ${changePercent >= 0 ? '▲' : '▼'} ${Math.abs(changePercent)}%
                        </td>
                    </tr>`;
            }
        });

        const nav = currentGroupValue.toLocaleString(undefined, {minimumFractionDigits: 2});
        const totalProfit = ((currentGroupValue / group.capital - 1) * 100).toFixed(2);
        
        document.getElementById(`${key.toLowerCase()}-nav`).innerText = `${group.currency} ${nav}`;
        document.getElementById(`${key.toLowerCase()}-profit`).innerText = `累计收益: ${totalProfit}%`;
        document.getElementById(`${key.toLowerCase()}-profit`).className = `text-sm font-bold ${totalProfit >= 0 ? 'text-red-600' : 'text-green-600'}`;
    });

    document.getElementById('stock-table-body').innerHTML = totalTableHtml;
}

// 首次执行
updateAllData();
// 每分钟自动刷新
setInterval(updateAllData, 60000);
