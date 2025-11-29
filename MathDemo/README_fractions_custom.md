# fractions_custom.html 使用說明

這是一個完全可自訂的分數運算題目展示頁面，支援加減乘除四則運算、自動化簡、最小公分母計算等功能。

## 🌐 基礎 URL

```
https://enochpublicprojects.github.io/public_code/fractions_custom.html
```

## 📋 URL 參數說明

### 基本數值參數

| 參數 | 說明 | 類型 | 預設值 | 範例 |
|------|------|------|--------|------|
| `num1` | 第一個分數的分子 | 整數 | 依operation而定 | `num1=1` |
| `den1` | 第一個分數的分母 | 非零整數 | 依operation而定 | `den1=4` |
| `num2` | 第二個分數的分子 | 整數 | 依operation而定 | `num2=1` |
| `den2` | 第二個分數的分母 | 非零整數 | 依operation而定 | `den2=3` |

### 運算類型參數

| 參數 | 說明 | 可選值 | 預設值 |
|------|------|--------|--------|
| `operation` | 運算類型 | `add`, `subtract`, `multiply`, `divide` | `add` |

#### 運算類型預設值

- **add** (加法): 1/4 + 1/3
- **subtract** (減法): 3/4 - 1/2
- **multiply** (乘法): 2/3 × 3/4
- **divide** (除法): 2/3 ÷ 4/5

### 顯示控制參數

| 參數 | 說明 | 可選值 | 預設值 |
|------|------|--------|--------|
| `vizType` | 圖表類型 | `bar`, `pie` | `bar` |
| `simplify` | 是否自動化簡結果 | `true`, `false` | `true` |
| `showLCD` | 加減法是否顯示最小公分母過程 | `true`, `false` | `true` |

### 自訂文字參數

| 參數 | 說明 | 預設值 | 範例 |
|------|------|--------|------|
| `question` | 自訂題目內容 | 自動生成 | `question=小明吃了1/4個披薩...` |
| `hint` | 自訂提示內容 | 自動生成 | `hint=先找出公分母` |
| `warning` | 自訂警告訊息 | 無（除法除以0時自動顯示） | `warning=⚠️ 注意化簡` |
| `chartTitle` | 圖表標題 | 依operation自動生成 | `chartTitle=🍕 披薩分配` |
| `fraction1Label` | 第一個分數標籤 | 第一個分數 | `fraction1Label=小明吃的` |
| `fraction2Label` | 第二個分數標籤 | 第二個分數 | `fraction2Label=小華吃的` |
| `resultLabel` | 結果標籤 | 結果 | `resultLabel=總共吃的` |

## 🎯 使用範例

### 範例 1：分數加法（預設）

```url
fractions_custom.html?num1=1&den1=4&num2=1&den2=3
```

計算：1/4 + 1/3 = 7/12

### 範例 2：分數減法

```url
fractions_custom.html?operation=subtract&num1=3&den1=4&num2=1&den2=2
```

計算：3/4 - 1/2 = 1/4

### 範例 3：分數乘法

```url
fractions_custom.html?operation=multiply&num1=2&den1=3&num2=3&den2=4
```

計算：2/3 × 3/4 = 1/2

### 範例 4：分數除法

```url
fractions_custom.html?operation=divide&num1=2&den1=3&num2=4&den2=5
```

計算：2/3 ÷ 4/5 = 5/6

### 範例 5：不化簡結果

```url
fractions_custom.html?operation=add&num1=1&den1=2&num2=1&den2=4&simplify=false
```

計算：1/2 + 1/4 = 3/4（不化簡顯示為 3/4）

### 範例 6：隱藏最小公分母過程

```url
fractions_custom.html?operation=add&num1=1&den1=6&num2=1&den2=4&showLCD=false
```

不顯示通分過程

### 範例 7：使用圓餅圖

```url
fractions_custom.html?num1=1&den1=4&num2=1&den2=3&vizType=pie
```

以圓餅圖顯示分數關係

### 範例 8：假分數結果

```url
fractions_custom.html?operation=add&num1=3&den1=4&num2=5&den2=6
```

計算：3/4 + 5/6 = 19/12 = 1 7/12（顯示帶分數）

### 範例 9：完全自訂（披薩情境）

```url
fractions_custom.html?operation=add&num1=1&den1=4&num2=1&den2=8&question=小明吃了1/4個披薩，小華吃了1/8個披薩，請問他們總共吃了多少？&hint=找出4和8的最小公分母&chartTitle=🍕 披薩分配&fraction1Label=小明吃的&fraction2Label=小華吃的&resultLabel=總共吃的
```

### 範例 10：負分數運算

```url
fractions_custom.html?operation=subtract&num1=1&den1=4&num2=3&den2=4
```

計算：1/4 - 3/4 = -1/2

## ⚠️ 異常處理

### 自動處理的異常情況

1. **分母為零**
   - URL: `fractions_custom.html?num1=1&den1=0&num2=1&den2=2`
   - 結果：顯示錯誤訊息，使用預設值

2. **除以零分數（分數除法）**
   - URL: `fractions_custom.html?operation=divide&num1=1&den1=2&num2=0&den2=5`
   - 結果：顯示錯誤訊息「除數不能為 0」，答案顯示「無法計算」

3. **無效數值**
   - URL: `fractions_custom.html?num1=abc&den1=xyz`
   - 結果：顯示錯誤訊息，使用預設值

4. **假分數自動轉換**
   - 結果大於1時，自動顯示帶分數形式
   - 例：7/4 → 1 3/4

5. **自動化簡**
   - `simplify=true` 時，結果自動約分至最簡分數
   - 例：6/8 → 3/4

6. **負數處理**
   - 負分數正常計算並顯示
   - 條形圖使用絕對值計算寬度

## 💡 技術細節

### 運算邏輯

各種運算的計算方式：

1. **add** (加法): 
   - 找出最小公分母 (LCD)
   - 通分：num1 × (LCD/den1) + num2 × (LCD/den2)
   - 結果分母為 LCD

2. **subtract** (減法):
   - 找出最小公分母 (LCD)
   - 通分：num1 × (LCD/den1) - num2 × (LCD/den2)
   - 結果分母為 LCD

3. **multiply** (乘法):
   - 分子相乘：num1 × num2
   - 分母相乘：den1 × den2

4. **divide** (除法):
   - 乘以倒數：(num1/den1) × (den2/num2)
   - 結果：(num1 × den2) / (den1 × num2)

### 最大公因數 (GCD) 算法

使用歐幾里得算法：

```javascript
function gcd(a, b) {
    while (b !== 0) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a;
}
```

### 最小公倍數 (LCM) 算法

```javascript
function lcm(a, b) {
    return (a × b) / gcd(a, b);
}
```

### 化簡分數

```javascript
function simplify(num, den) {
    const divisor = gcd(num, den);
    return { num: num / divisor, den: den / divisor };
}
```

### 轉換為帶分數

假分數自動轉換為帶分數顯示：

- 整數部分：floor(|num| / den)
- 分數部分：(|num| % den) / den
- 例：7/4 → 1 3/4

### 圓餅圖實作

- 將分數轉換為角度：angle = (num / den) × 360°
- 使用 SVG 路徑繪製扇形
- 兩個分數以不同顏色和大小疊加顯示

### 視覺化選擇建議

| 運算類型 | 建議圖表 | 原因 |
|---------|---------|------|
| add | pie 或 bar | 圓餅圖顯示部分與整體，條形圖比較大小 |
| subtract | bar | 條形圖清楚顯示減少的部分 |
| multiply | bar | 條形圖顯示結果與原分數的關係 |
| divide | bar | 條形圖比較倒數關係 |

## 🔗 快速測試連結

在瀏覽器中直接點擊測試：

1. [預設範例 - 分數加法](fractions_custom.html)
2. [分數減法](fractions_custom.html?operation=subtract&num1=3&den1=4&num2=1&den2=2)
3. [分數乘法](fractions_custom.html?operation=multiply&num1=2&den1=3&num2=3&den2=4)
4. [分數除法](fractions_custom.html?operation=divide&num1=2&den1=3&num2=4&den2=5)
5. [不化簡](fractions_custom.html?num1=2&den1=4&num2=2&den2=8&simplify=false)
6. [隱藏LCD](fractions_custom.html?num1=1&den1=6&num2=1&den2=4&showLCD=false)
7. [圓餅圖](fractions_custom.html?num1=1&den1=4&num2=1&den2=3&vizType=pie)
8. [假分數](fractions_custom.html?operation=add&num1=3&den1=4&num2=5&den2=6)
9. [披薩情境](fractions_custom.html?operation=add&num1=1&den1=4&num2=1&den2=8&question=小明吃了1/4個披薩，小華吃了1/8個披薩，請問他們總共吃了多少？&chartTitle=🍕披薩分配)
10. [負分數](fractions_custom.html?operation=subtract&num1=1&den1=4&num2=3&den2=4)

## 📝 注意事項

1. **參數大小寫**：參數名稱區分大小寫（使用小駝峰命名）
2. **分母不能為零**：系統會自動檢測並使用預設值
3. **化簡選項**：預設自動化簡，可設 `simplify=false` 保留原始形式
4. **LCD 顯示**：僅在加法和減法時顯示最小公分母過程
5. **帶分數**：假分數（分子>分母）自動顯示為帶分數
6. **整數輸入**：分子和分母必須是整數
7. **負數支持**：可以使用負數進行運算
8. **瀏覽器兼容**：支援所有現代瀏覽器（Chrome, Firefox, Safari, Edge）

## 🖼️ 嵌入網頁（iframe）

### 基本嵌入

```html
<iframe 
  src="https://enochpublicprojects.github.io/public_code/fractions_custom.html?num1=1&den1=4&num2=1&den2=3" 
  width="100%" 
  height="700" 
  frameborder="0">
</iframe>
```

### 分數乘法嵌入

```html
<iframe 
  src="https://enochpublicprojects.github.io/public_code/fractions_custom.html?operation=multiply&num1=2&den1=3&num2=3&den2=4&vizType=pie" 
  width="100%" 
  height="750" 
  frameborder="0"
  style="border: 1px solid #ddd; border-radius: 8px;">
</iframe>
```

### 披薩情境嵌入

```html
<iframe 
  src="https://enochpublicprojects.github.io/public_code/fractions_custom.html?operation=add&num1=1&den1=4&num2=1&den2=8&question=小明吃了1/4個披薩，小華吃了1/8個披薩，請問他們總共吃了多少？&chartTitle=🍕披薩分配" 
  width="100%" 
  height="800" 
  frameborder="0">
</iframe>
```

### 響應式嵌入

```html
<div style="position: relative; padding-bottom: 85%; height: 0; overflow: hidden;">
  <iframe 
    src="https://enochpublicprojects.github.io/public_code/fractions_custom.html?operation=divide&num1=2&den1=3&num2=4&den2=5" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
  </iframe>
</div>
```

### 建議尺寸

- **最小寬度**：800px
- **最小高度**：700px（包含LCD步驟）
- **建議高度**：750-850px

## 🎓 教學應用情境

### 情境 1：分數加法基礎
使用同分母分數，幫助學生理解分數加法概念。

### 情境 2：通分練習
使用異分母分數，練習找最小公分母和通分。

### 情境 3：分數乘法
理解「分數的分數」概念，例如 1/2 的 1/3。

### 情境 4：分數除法
理解除以分數等於乘以倒數的概念。

### 情境 5：化簡練習
設定 `simplify=true`，練習將分數化為最簡形式。

### 情境 6：生活情境應用
使用披薩、蛋糕等情境，讓學生理解分數在生活中的應用。

### 情境 7：假分數與帶分數
練習假分數和帶分數之間的轉換。

## 🧮 數學概念說明

### 最小公分母 (LCD - Least Common Denominator)

加減法時需要的最小公倍數，用於將異分母分數通分。

**範例**：1/4 + 1/6
- 4 的倍數：4, 8, **12**, 16...
- 6 的倍數：6, **12**, 18...
- LCD = 12
- 通分：3/12 + 2/12 = 5/12

### 最大公因數 (GCD - Greatest Common Divisor)

用於化簡分數，找出分子和分母的最大公因數。

**範例**：化簡 6/8
- 6 的因數：1, 2, 3, **6**
- 8 的因數：1, 2, 4, **8**
- GCD = 2
- 化簡：(6÷2)/(8÷2) = 3/4

### 倒數 (Reciprocal)

分數除法時，除以一個分數等於乘以其倒數。

**範例**：2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6
