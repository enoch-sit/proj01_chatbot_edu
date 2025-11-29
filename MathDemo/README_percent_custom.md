# percent_custom.html 使用說明

這是一個完全可自訂的百分比與小數題目展示頁面，支援多種百分比運算和視覺化方式。

## 🌐 基礎 URL

```
https://enochpublicprojects.github.io/public_code/percent_custom.html
```

## 📋 URL 參數說明

### 基本數值參數

| 參數 | 說明 | 類型 | 預設值 | 範例 |
|------|------|------|--------|------|
| `value` | 數值（依運算類型而定） | 數字 | 依operation而定 | `value=200` |
| `percent` | 百分比數值 | 數字 | 依operation而定 | `percent=25` |
| `decimalPlaces` | 小數位數 | 0-10的整數 | 2 | `decimalPlaces=3` |

### 運算類型參數

| 參數 | 說明 | 可選值 | 預設值 |
|------|------|--------|--------|
| `operation` | 運算類型 | `percentOf`, `whatPercent`, `increase`, `decrease`, `toDecimal`, `fromDecimal` | `percentOf` |

#### 運算類型詳解：

- **percentOf**: 計算「X% 的 Y 是多少」
  - `value` = 總數, `percent` = 百分比
  - 預設: value=200, percent=25
  
- **whatPercent**: 計算「X 是 Y 的百分之幾」
  - `value` = 總數, `percent` = 部分數值
  - 預設: value=200, percent=50
  
- **increase**: 計算「X 增加 Y% 後是多少」
  - `value` = 原始值, `percent` = 增加百分比
  - 預設: value=100, percent=20
  
- **decrease**: 計算「X 減少 Y% 後是多少」
  - `value` = 原始值, `percent` = 減少百分比
  - 預設: value=100, percent=15
  
- **toDecimal**: 將百分比轉換成小數
  - `percent` = 百分比數值
  - 預設: percent=75
  
- **fromDecimal**: 將小數轉換成百分比
  - `value` = 小數值
  - 預設: value=0.6

### 視覺化參數

| 參數 | 說明 | 可選值 | 預設值 |
|------|------|--------|--------|
| `vizType` | 圖表類型 | `bar`, `pie` | `bar` |

### 自訂文字參數

| 參數 | 說明 | 預設值 | 範例 |
|------|------|--------|------|
| `question` | 自訂題目內容 | 自動生成 | `question=一件衣服原價500元，打8折後是多少元？` |
| `hint` | 自訂提示內容 | 自動生成 | `hint=先將80%轉換成小數0.8` |
| `warning` | 自訂警告訊息 | 無 | `warning=⚠️ 注意單位換算` |
| `chartTitle` | 圖表標題 | 依operation自動生成 | `chartTitle=📊 折扣計算` |
| `partLabel` | 部分數值標籤 | 部分 | `partLabel=折扣金額` |
| `wholeLabel` | 整體數值標籤 | 整體 | `wholeLabel=原價` |
| `resultLabel` | 答案標籤 | 答案 | `resultLabel=特價` |

## 🎯 使用範例

### 範例 1：計算百分比（預設）
```
percent_custom.html?value=200&percent=25
```
計算：25% 的 200 是多少？
答案：50

### 範例 2：計算佔比
```
percent_custom.html?operation=whatPercent&value=200&percent=50
```
計算：50 是 200 的百分之幾？
答案：25%

### 範例 3：百分比增加
```
percent_custom.html?operation=increase&value=100&percent=20
```
計算：100 增加 20% 後是多少？
答案：120

### 範例 4：百分比減少
```
percent_custom.html?operation=decrease&value=100&percent=15
```
計算：100 減少 15% 後是多少？
答案：85

### 範例 5：百分比轉小數
```
percent_custom.html?operation=toDecimal&percent=75
```
計算：75% 轉換成小數是多少？
答案：0.75

### 範例 6：小數轉百分比
```
percent_custom.html?operation=fromDecimal&value=0.6
```
計算：0.6 轉換成百分比是多少？
答案：60%

### 範例 7：使用圓餅圖
```
percent_custom.html?value=200&percent=25&vizType=pie
```
以圓餅圖顯示 25% 的部分

### 範例 8：完全自訂（折扣情境）
```
percent_custom.html?operation=decrease&value=500&percent=20&question=一件衣服原價500元，打8折（減20%）後是多少元？&hint=將原價乘以(1-0.2)&chartTitle=💰 折扣計算&partLabel=折扣金額&wholeLabel=原價&resultLabel=特價&vizType=bar
```

### 範例 9：考試成績（佔比計算）
```
percent_custom.html?operation=whatPercent&value=120&percent=96&question=小明數學考試滿分120分，他得了96分，請問他的得分率是多少？&chartTitle=📝 考試成績&partLabel=得分&wholeLabel=滿分&resultLabel=得分率&vizType=pie
```

### 範例 10：高精度計算
```
percent_custom.html?value=333.333&percent=33.333&decimalPlaces=5
```
計算並顯示到小數點後5位

## ⚠️ 異常處理

### 自動處理的異常情況：

1. **無效數值**
   - URL: `percent_custom.html?value=abc`
   - 結果：顯示錯誤訊息，使用預設值

2. **負數處理**
   - 負數是合法的，可用於計算負增長等情境
   - 圖表會正常顯示（條形圖顯示絕對值）

3. **超過100%的情況**
   - 自動處理，條形圖會顯示超過100%的部分
   - 圓餅圖會顯示完整的圓

4. **除以零**
   - 在 `whatPercent` 運算中，若 value=0，結果自動設為 0

5. **小數位數超出範圍**
   - URL: `percent_custom.html?decimalPlaces=20`
   - 結果：顯示錯誤訊息，使用預設值 2

6. **無效的運算類型**
   - 自動回退到 `percentOf`

## 💡 技術細節

### 運算邏輯

各種運算的計算方式：

1. **percentOf**: `result = (value × percent) / 100`
2. **whatPercent**: `result = (percent / value) × 100`
3. **increase**: `result = value × (1 + percent / 100)`
4. **decrease**: `result = value × (1 - percent / 100)`
5. **toDecimal**: `result = percent / 100`
6. **fromDecimal**: `result = value × 100`

### 圓餅圖實作

- 使用 SVG `<path>` 元素
- 計算扇形角度：`angle = (percentage / 100) × 360°`
- 使用極座標轉換計算路徑點
- 大於180°的扇形使用 largeArc 標記

### 浮點數精度處理

- 使用 `toFixed()` 方法四捨五入
- 先計算後四捨五入，避免累積誤差
- 支援 0-10 位小數精度

### 視覺化選擇建議

| 運算類型 | 建議圖表 | 原因 |
|---------|---------|------|
| percentOf | 兩者皆可 | 圓餅圖更直觀顯示部分與整體關係 |
| whatPercent | pie | 圓餅圖清楚顯示佔比 |
| increase | bar | 條形圖方便比較增加前後 |
| decrease | bar | 條形圖方便比較減少前後 |
| toDecimal | bar | 簡單對照即可 |
| fromDecimal | bar | 簡單對照即可 |

## 🔗 快速測試連結

在瀏覽器中直接點擊測試：

1. [預設範例 - 百分比計算](percent_custom.html)
2. [佔比計算](percent_custom.html?operation=whatPercent&value=200&percent=50)
3. [增加20%](percent_custom.html?operation=increase&value=100&percent=20)
4. [減少15%](percent_custom.html?operation=decrease&value=100&percent=15)
5. [百分比轉小數](percent_custom.html?operation=toDecimal&percent=75)
6. [小數轉百分比](percent_custom.html?operation=fromDecimal&value=0.6)
7. [圓餅圖範例](percent_custom.html?value=200&percent=25&vizType=pie)
8. [超過100%](percent_custom.html?value=50&percent=150&vizType=pie)
9. [折扣計算](percent_custom.html?operation=decrease&value=500&percent=20&question=一件衣服原價500元，打8折後是多少元？&chartTitle=💰折扣計算&vizType=bar)
10. [高精度計算](percent_custom.html?value=100&percent=33.333&decimalPlaces=4)

## 📝 注意事項

1. **參數大小寫**：參數名稱區分大小寫（使用小駝峰命名）
2. **運算類型選擇**：依據題目選擇正確的 operation 類型
3. **小數精度**：建議根據實際需求設定 decimalPlaces（預設2位已足夠多數情況）
4. **視覺化選擇**：圓餅圖適合顯示佔比關係，條形圖適合數值比較
5. **瀏覽器兼容**：支援所有現代瀏覽器（Chrome, Firefox, Safari, Edge）
6. **URL 編碼**：中文和特殊符號會自動編碼，可直接使用

## 🖼️ 嵌入網頁（iframe）

### 基本嵌入（計算百分比）

```html
<iframe 
  src="https://enochpublicprojects.github.io/public_code/percent_custom.html?value=200&percent=25" 
  width="100%" 
  height="650" 
  frameborder="0">
</iframe>
```

### 折扣計算嵌入

```html
<iframe 
  src="https://enochpublicprojects.github.io/public_code/percent_custom.html?operation=decrease&value=500&percent=20&question=一件衣服原價500元，打8折後是多少元？&chartTitle=💰折扣計算" 
  width="100%" 
  height="700" 
  frameborder="0"
  style="border: 1px solid #ddd; border-radius: 8px;">
</iframe>
```

### 圓餅圖嵌入

```html
<iframe 
  src="https://enochpublicprojects.github.io/public_code/percent_custom.html?operation=whatPercent&value=120&percent=96&vizType=pie&chartTitle=📝考試成績" 
  width="100%" 
  height="750" 
  frameborder="0">
</iframe>
```

### 響應式嵌入

```html
<div style="position: relative; padding-bottom: 80%; height: 0; overflow: hidden;">
  <iframe 
    src="https://enochpublicprojects.github.io/public_code/percent_custom.html?operation=increase&value=100&percent=20" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
  </iframe>
</div>
```

### 建議尺寸

- **最小寬度**：800px
- **最小高度**：650px
- **建議高度**：700-750px

## 🎓 教學應用情境

### 情境 1：折扣計算
教師可設定不同的折扣題目，讓學生理解百分比減少的概念。

### 情境 2：考試成績分析
使用 `whatPercent` 計算得分率，配合圓餅圖視覺化。

### 情境 3：成長率計算
使用 `increase` 計算人口、銷售額等成長情境。

### 情境 4：百分比與小數互轉
幫助學生理解百分比和小數的關係。

### 情境 5：比例問題
使用 `percentOf` 解決「部分佔整體多少」的應用題。
