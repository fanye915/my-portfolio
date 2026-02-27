import requests
import json
from datetime import datetime

# 你的持仓配置（与JS中保持一致）
portfolio = {
    "A": {"cap": 1000000, "stocks": {"sh513390": [0.25, 1.425], "sz159652": [0.25, 0.882], "sh588200": [0.25, 1.056], "sh515880": [0.15, 1.124], "sh518880": [0.10, 9.779]}},
    "HK": {"cap": 1000000, "stocks": {"hk03455": [0.25, 22.35], "hk03132": [0.20, 10.45], "hk03147": [0.20, 8.12], "hk03110": [0.20, 30.33], "hk02840": [0.15, 1560.5]}},
    "US": {"cap": 1000000, "stocks": {"gb_qqq": [0.25, 585.4], "gb_spy": [0.25, 562.15], "gb_ring": [0.20, 38.2], "gb_copx": [0.20, 88.65], "gb_bitb": [0.10, 52.3]}}
}

def get_total_value():
    all_codes = []
    for m in portfolio.values():
        all_codes.extend(m["stocks"].keys())
    
    url = f"https://hq.sinajs.cn/list={','.join(all_codes)}"
    headers = {'Referer': 'http://finance.sina.com.cn'}
    res = requests.get(url, headers=headers)
    data = res.text
    
    total_val = 0
    for m_key, m_val in portfolio.items():
        group_val = 0
        for code, config in m_val["stocks"].items():
            line = data.split(f'hq_str_{code}="')[1].split('";')[0]
            parts = line.split(',')
            # 价格解析逻辑
            price = float(parts[6] if 'hk' in code else (parts[1] if 'gb_' in code else parts[3]))
            group_val += m_val["cap"] * config[0] * (price / config[1])
        total_val += group_val
    return total_val

# 更新 JSON 文件
current_val = get_total_value()
today = datetime.now().strftime('%Y-%m-%d')

with open('data.json', 'r+') as f:
    history = json.load(f)
    # 如果今天还没记录过，就添加
    if history[-1]['date'] != today:
        history.append({"date": today, "value": round(current_val, 2)})
        f.seek(0)
        json.dump(history, f, indent=2)
        f.truncate()
