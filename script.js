// 1. 配置初始持仓数据 (买入价格需在2026年开盘后填入)
const portfolio = {
    A: {
        currency: 'CNY', capital: 1000000,
        stocks: [
            { code: 'sh513390', weight: 0.25, buyPrice: 2.108, name: '纳指100ETF' },
            { code: 'sz159652', weight: 0.25, buyPrice: 1.705, name: '有色50ETF' },
            { code: 'sh588200', weight: 0.25, buyPrice: 2.373, name: '科创芯片ETF' },
            { code: 'sh515880', weight: 0.15, buyPrice: 1.041, name: '通信ETF' },
            { code: 'sh518880', weight: 0.10, buyPrice: 9.421, name: '黄金ETF' }
        ]
    },
    HK: {
        currency: 'HKD', capital: 1000000,
        stocks: [
            { code: 'hk03455', weight: 0.25, buyPrice: 10.00, name: '纳指100ETF' },
            { code: 'hk03132', weight: 0.20, buyPrice: 10.00, name: '全球半导体ETF' },
            { code: 'hk03147', weight: 0.20, buyPrice: 10.00, name: '创业板ETF' },
            { code: 'hk03110', weight: 0.20, buyPrice: 10.00, name: '高股息ETF' },
            { code: 'hk02840', weight: 0.15, buyPrice: 10.00, name: '黄金ETF' }
        ]
    },
    US: {
        currency: 'USD', capital: 1000000,
        stocks: [
            { code: 'gb_qqq', weight: 0.25, buyPrice: 400.00, name: 'QQQ' },
            { code: 'gb_spy', weight: 0.25, buyPrice: 500.00, name: 'SPY' },
            { code: 'gb_ring', weight: 0.20, buyPrice: 30.00, name: 'RING' },
            { code: 'gb_copx', weight: 0.20, buyPrice: 40.00, name: 'COPX' },
            { code: 'gb_bitb', weight: 0.10, buyPrice: 30.00, name: 'BITB' }
        ]
    }
};

// 2. 获取新浪财经数据
async function fetchData() {
    const allCodes = [...portfolio.A.stocks, ...portfolio.HK.stocks, ...portfolio.US.stocks].map(s => s.code).join(',');
    // 注意：实际开发中，新浪接口在浏览器直接调用会有跨域限制，这里使用辅助接口或代理
    const url = `https://hq.sinajs.cn/list=${allCodes}`;
    
    // 这里模拟数据获取逻辑（因为GitHub静态页无法直接跨域请求新浪）
    // 实际操作中建议通过简单的 API 转发
    updateUI(); 
}

function updateUI() {
    // 模拟计算逻辑（实际中需解析新浪返回的字符串）
    calcPortfolio('A', 'a-nav', 'a-profit');
    calcPortfolio('HK', 'hk-nav', 'hk-profit');
    calcPortfolio('US', 'us-nav', 'us-profit');
    renderTable();
    renderChart();
}

function calcPortfolio(key, navId, profitId) {
    let currentTotal = portfolio[key].capital; // 简化模型：假设当前持仓平稳
    document.getElementById(navId).innerText = `${portfolio[key].currency} ${currentTotal.toLocaleString()}`;
    document.getElementById(profitId).innerText = `累计收益：0.00%`;
    document.getElementById(profitId).className = "text-sm text-green-500";
}

function renderTable() {
    const tbody = document.getElementById('stock-table-body');
    let html = '';
    [...portfolio.A.stocks, ...portfolio.HK.stocks, ...portfolio.US.stocks].forEach(s => {
        html += `<tr class="border-t">
            <td class="p-4">${s.name} (${s.code.replace('gb_','').toUpperCase()})</td>
            <td class="p-4 text-gray-400">${s.buyPrice}</td>
            <td class="p-4 font-mono">加载中...</td>
            <td class="p-4 text-red-500">+0.00%</td>
        </tr>`;
    });
    tbody.innerHTML = html;
}

function renderChart() {
    const ctx = document.getElementById('yieldChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2026-01', '2026-02'],
            datasets: [{
                label: '总资产价值',
                data: [3000000, 3050000],
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.1
            }]
        }
    });
}

window.onload = fetchData;
