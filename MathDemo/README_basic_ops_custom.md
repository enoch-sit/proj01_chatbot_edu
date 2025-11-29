# basic_ops_custom.html 使用說明

這是一個完全可自訂的基本運算（加減乘除）題目展示頁面，支援步驟顯示和多種視覺化方式。

## 📋 URL 參數說明

### 🆕 多數字運算模式（3個或以上）

| 參數 | 說明 | 類型 | 預設值 | 範例 |
|------|------|------|--------|------|
| `numbers` | 多個數字（逗號分隔） | 數字陣列 | 無 | `numbers=10,5,2` |
| `operations` | 運算符號（逗號分隔） | 運算陣列 | 全部為add | `operations=+,*` 或 `operations=add,multiply` |
| `orderPrecedence` | 是否依運算順序（先乘除後加減） | `true`, `false` | `false` | `orderPrecedence=true` |

**運算符號支援格式**：
- 符號：`+`, `-`, `*`, `/`（或 `×`, `÷`）
- 文字：`add`, `subtract`, `multiply`, `divide`

**注意**：
- `numbers` 至少需要 3 個數字才會啟用多數字模式
- `operations` 數量必須比 `numbers` 少 1 個（例如：3 個數字需要 2 個運算符號）
- 如果 `operations` 數量不足，會自動補 `add`（加法）
- 多數字模式下，視覺化預設為 `table`（表格）

### 基本數值參數（雙數字模式）

| 參數 | 說明 | 類型 | 預設值 | 範例 |
|------|------|------|--------|------|
| `num1` | 第一個數字 | 數字 | 依operation而定 | `num1=45` |
| `num2` | 第二個數字 | 數字 | 依operation而定 | `num2=38` |
| `decimalPlaces` | 小數位數 | 0-10的整數 | 2 | `decimalPlaces=3` |

### 運算類型參數

| 參數 | 說明 | 可選值 | 預設值 |
|------|------|--------|--------|
| `operation` | 運算類型 | `add`, `subtract`, `multiply`, `divide` | `add` |

#### 運算類型預設值

- **add** (加法): num1=45, num2=38
- **subtract** (減法): num1=82, num2=37
- **multiply** (乘法): num1=12, num2=8
- **divide** (除法): num1=96, num2=8

### 顯示控制參數

| 參數 | 說明 | 可選值 | 預設值 |
|------|------|--------|--------|
| `vizType` | 圖表類型 | 雙數字：`bar`, `pie`<br>多數字：`table`, `bar` | 雙數字：`bar`<br>多數字：`table` |
| `showSteps` | 是否顯示解題步驟 | `true`, `false` | `true` |
| `showRemainder` | 除法是否顯示餘數（僅雙數字） | `true`, `false` | `true` |

### 自訂文字參數

| 參數 | 說明 | 預設值 | 範例 |
|------|------|--------|------|
| `question` | 自訂題目內容 | 自動生成 | `question=小明有45顆糖果，又買了38顆，現在有幾顆？` |
| `hint` | 自訂提示內容 | 自動生成 | `hint=把兩個數字加起來` |
| `warning` | 自訂警告訊息 | 無（除法除以0時自動顯示） | `warning=⚠️ 注意負數` |
| `chartTitle` | 圖表標題 | 依operation自動生成 | `chartTitle=🍬 糖果計算` |
| `num1Label` | 第一個數標籤 | 第一個數 | `num1Label=原有糖果` |
| `num2Label` | 第二個數標籤 | 第二個數 | `num2Label=新買糖果` |
| `resultLabel` | 結果標籤 | 結果 | `resultLabel=總共糖果` |

## 🎯 使用範例

### 🆕 多數字運算範例

#### 範例 M1：三個數字相加（由左至右）

```url
basic_ops_custom.html?numbers=10,5,2&operations=+,+
```

計算步驟：
1. 10 + 5 = 15
2. 15 + 2 = 17

最終答案：17

#### 範例 M2：三個數字混合運算（由左至右）

```url
basic_ops_custom.html?numbers=10,5,2&operations=+,*
```

計算步驟（由左至右）：
1. 10 + 5 = 15
2. 15 × 2 = 30

最終答案：30

#### 範例 M3：三個數字混合運算（依運算順序）

```url
basic_ops_custom.html?numbers=10,5,2&operations=+,*&orderPrecedence=true
```

計算步驟（先乘除後加減）：
1. 5 × 2 = 10（先算乘法）
2. 10 + 10 = 20（再算加法）

最終答案：20

**注意差異**：相同的數字和運算符號，但因為 `orderPrecedence=true`，結果從 30 變成 20！

#### 範例 M4：四個數字複雜運算

```url
basic_ops_custom.html?numbers=100,20,5,2&operations=-,/,*&orderPrecedence=true
```

計算步驟（先乘除後加減）：
1. 20 ÷ 5 = 4（先算除法）
2. 4 × 2 = 8（再算乘法）
3. 100 - 8 = 92（最後算減法）

最終答案：92

#### 範例 M5：使用文字運算符號

```url
basic_ops_custom.html?numbers=15,3,2,10&operations=multiply,divide,add
```

等同於：15 × 3 ÷ 2 + 10

#### 範例 M6：五個數字全加法

```url
basic_ops_custom.html?numbers=5,10,15,20,25
```

未指定 `operations` 時，自動使用全部加法：
5 + 10 + 15 + 20 + 25 = 75

#### 範例 M7：多數字使用條形圖

```url
basic_ops_custom.html?numbers=10,5,2&operations=+,*&vizType=bar
```

以條形圖顯示所有數字和最終結果

#### 範例 M8：自訂多數字題目

```url
basic_ops_custom.html?numbers=50,10,5&operations=-,-&question=小明有50元，買了10元的橡皮擦和5元的鉛筆，還剩多少錢？&chartTitle=💰 購物計算
```

### 雙數字運算範例

#### 範例 1：加法（預設）

```url
basic_ops_custom.html?num1=45&num2=38
```

計算：45 + 38 = 83

#### 範例 2：減法

```url
basic_ops_custom.html?operation=subtract&num1=82&num2=37
```

計算：82 - 37 = 45

#### 範例 3：乘法

```url
basic_ops_custom.html?operation=multiply&num1=12&num2=8
```

計算：12 × 8 = 96

#### 範例 4：除法（整除）

```url
basic_ops_custom.html?operation=divide&num1=96&num2=8
```

計算：96 ÷ 8 = 12

#### 範例 5：除法（有餘數）

```url
basic_ops_custom.html?operation=divide&num1=100&num2=7
```

計算：100 ÷ 7 = 14.29（商數：14，餘數：2）

#### 範例 6：除法不顯示餘數

```url
basic_ops_custom.html?operation=divide&num1=100&num2=7&showRemainder=false
```

只顯示小數結果：14.29

#### 範例 7：隱藏解題步驟

```url
basic_ops_custom.html?num1=25&num2=15&showSteps=false
```

不顯示解題步驟，僅顯示答案

#### 範例 8：使用圓餅圖（加法）

```url
basic_ops_custom.html?operation=add&num1=30&num2=20&vizType=pie
```

以圓餅圖顯示兩數相加的關係

#### 範例 9：使用圓餅圖（乘法）

```url
basic_ops_custom.html?operation=multiply&num1=6&num2=4&vizType=pie
```

以圓形圖示顯示乘法運算

#### 範例 10：完全自訂（糖果情境）

```url
basic_ops_custom.html?operation=add&num1=45&num2=38&question=小明原本有45顆糖果，又買了38顆，請問現在總共有幾顆糖果？&hint=把原有的和新買的加起來&chartTitle=🍬 糖果計算&num1Label=原有糖果&num2Label=新買糖果&resultLabel=總共糖果
```

#### 範例 11：負數運算

```url
basic_ops_custom.html?operation=add&num1=10&num2=-15
```

計算：10 + (-15) = -5

#### 範例 12：小數運算

```url
basic_ops_custom.html?operation=multiply&num1=3.5&num2=2.4&decimalPlaces=3
```

計算：3.5 × 2.4 = 8.400（顯示3位小數）

## ⚠️ 異常處理

### 自動處理的異常情況

1. **除以零**
   - URL: `basic_ops_custom.html?operation=divide&num1=10&num2=0`
   - 結果：顯示紅色錯誤訊息「除數不能為 0」，答案顯示「無法計算」

2. **無效數值**
   - URL: `basic_ops_custom.html?num1=abc&num2=xyz`
   - 結果：顯示錯誤訊息，使用預設值

3. **負數處理**
   - 負數是合法的，圖表會用紅色條形顯示負數
   - 條形圖寬度使用絕對值計算

4. **小數位數超出範圍**
   - URL: `basic_ops_custom.html?decimalPlaces=20`
   - 結果：顯示錯誤訊息，使用預設值 2

5. **無效的運算類型**
   - 自動回退到 `add`（加法）

6. **餘數計算限制**
   - 餘數僅在兩個數字都是整數時計算
   - 小數除法不顯示餘數，即使 `showRemainder=true`

## 💡 技術細節

### 🆕 多數字運算邏輯

#### 由左至右模式（`orderPrecedence=false` 或未設定）

按照運算符號出現的順序，依序計算：

```
numbers=10,5,2 & operations=+,*
步驟1: 10 + 5 = 15
步驟2: 15 × 2 = 30
結果: 30
```

#### 運算順序模式（`orderPrecedence=true`）

遵循 PEMDAS/BODMAS 規則（先乘除後加減）：

```
numbers=10,5,2 & operations=+,*
步驟1: 5 × 2 = 10 （先處理乘法）
步驟2: 10 + 10 = 20 （再處理加法）
結果: 20
```

**運算順序優先級**：
1. **第一層**：`multiply`（乘法）、`divide`（除法） - 由左至右
2. **第二層**：`add`（加法）、`subtract`（減法） - 由左至右

#### 表格視覺化

多數字模式預設使用表格顯示，包含：
- **步驟欄**：顯示步驟編號
- **運算式欄**：顯示每一步的計算式
- **結果欄**：顯示每一步的計算結果
- **最終答案列**：以綠色底色標示最終結果

### 雙數字運算邏輯

各種運算的計算方式：

1. **add** (加法): `result = num1 + num2`
2. **subtract** (減法): `result = num1 - num2`
3. **multiply** (乘法): `result = num1 × num2`
4. **divide** (除法): `result = num1 ÷ num2`
   - 整數除法：`quotient = floor(num1 / num2)`, `remainder = num1 % num2`

### 解題步驟生成

系統自動生成解題步驟：

- **加法**：說明相加過程
- **減法**：說明相減過程
- **乘法**：說明相乘過程，如果乘數 ≤ 12，會提示可用連加理解
- **除法**：說明除法過程，顯示商數和餘數（如適用），判斷是否整除

### 圓餅圖實作

**加法和減法**：
- 顯示兩個扇形，代表兩個數字的相對大小
- 中央顯示運算符號和結果

**乘法和除法**：
- 使用替代視覺化：兩個圓圈代表兩個數字
- 中央顯示運算符號
- 下方顯示結果

### 條形圖縮放

- 自動計算三個數值的最大值
- 所有條形相對於最大值按比例縮放
- 確保視覺比較的準確性
- 負數使用紅色條形，寬度取絕對值

### 視覺化選擇建議

| 模式 | 運算類型 | 建議圖表 | 原因 |
|------|---------|---------|------|
| 多數字 | 任何混合運算 | **table** | 表格清楚顯示每步計算過程，特別適合運算順序教學 |
| 多數字 | 全加法/全減法 | bar | 條形圖可視化所有數字和結果 |
| 雙數字 | add | pie 或 bar | 圓餅圖顯示組成關係，條形圖顯示數值大小 |
| 雙數字 | subtract | bar | 條形圖方便比較前後差異 |
| 雙數字 | multiply | bar | 條形圖清楚顯示倍數關係 |
| 雙數字 | divide | bar | 條形圖顯示商數和餘數關係 |

## 🔗 快速測試連結

在瀏覽器中直接點擊測試：

### 🆕 多數字運算
1. [三數相加（由左至右）](basic_ops_custom.html?numbers=10,5,2&operations=+,+)
2. [三數混合運算（由左至右）](basic_ops_custom.html?numbers=10,5,2&operations=+,*)
3. [三數混合運算（運算順序）](basic_ops_custom.html?numbers=10,5,2&operations=+,*&orderPrecedence=true)
4. [四數複雜運算（運算順序）](basic_ops_custom.html?numbers=100,20,5,2&operations=-,/,*&orderPrecedence=true)
5. [五數全加法](basic_ops_custom.html?numbers=5,10,15,20,25)
6. [購物情境](basic_ops_custom.html?numbers=50,10,5&operations=-,-&question=小明有50元，買了10元的橡皮擦和5元的鉛筆，還剩多少錢？&chartTitle=💰購物計算)

### 雙數字運算
7. [預設範例 - 加法](basic_ops_custom.html)
8. [減法範例](basic_ops_custom.html?operation=subtract&num1=82&num2=37)
9. [乘法範例](basic_ops_custom.html?operation=multiply&num1=12&num2=8)
10. [除法範例（整除）](basic_ops_custom.html?operation=divide&num1=96&num2=8)
11. [除法範例（有餘數）](basic_ops_custom.html?operation=divide&num1=100&num2=7)
12. [圓餅圖 - 加法](basic_ops_custom.html?operation=add&num1=30&num2=20&vizType=pie)
13. [圓餅圖 - 乘法](basic_ops_custom.html?operation=multiply&num1=6&num2=4&vizType=pie)
14. [負數運算](basic_ops_custom.html?operation=add&num1=10&num2=-15)
15. [除以零（錯誤示範）](basic_ops_custom.html?operation=divide&num1=10&num2=0)
16. [糖果情境](basic_ops_custom.html?operation=add&num1=45&num2=38&question=小明原本有45顆糖果，又買了38顆，請問現在總共有幾顆糖果？&chartTitle=🍬糖果計算&num1Label=原有糖果&num2Label=新買糖果&resultLabel=總共糖果)

## 📝 注意事項

1. **參數大小寫**：參數名稱區分大小寫（使用小駝峰命名）
2. **🆕 多數字模式**：使用 `numbers` 參數（至少3個數字）時啟用，會覆蓋 `num1`/`num2` 參數
3. **🆕 運算符號數量**：`operations` 數量必須等於 `numbers` 數量減 1
4. **🆕 運算順序差異**：`orderPrecedence=true` 和 `orderPrecedence=false` 可能產生不同結果
5. **運算類型選擇**：依據題目選擇正確的 operation 類型（雙數字模式）
6. **除以零檢查**：系統會自動檢測並顯示錯誤訊息
7. **餘數顯示**：僅在雙數字整數除法時有效，可用 `showRemainder=false` 隱藏
8. **小數精度**：建議根據實際需求設定 decimalPlaces
9. **負數視覺化**：負數使用紅色條形標示
10. **步驟顯示**：可用 `showSteps=false` 隱藏解題步驟
11. **瀏覽器兼容**：支援所有現代瀏覽器（Chrome, Firefox, Safari, Edge）

## 🎓 教學應用情境

### 🆕 多數字運算教學

#### 情境 A：運算順序教學（PEMDAS/BODMAS）
使用相同數字和運算符號，對比 `orderPrecedence=true` 和 `orderPrecedence=false` 的差異，教導學生「先乘除後加減」的重要性。

**範例**：
- 由左至右：`10 + 5 × 2 = 30`（10+5=15, 15×2=30）
- 運算順序：`10 + 5 × 2 = 20`（5×2=10, 10+10=20）

#### 情境 B：連續加減法練習
設定多個數字的加減法，訓練學生連續運算能力。

**範例**：`100 - 20 - 15 - 10 = ?`

#### 情境 C：生活購物情境（多項商品）
模擬購買多項商品後計算剩餘金額，或計算總價。

**範例**：「小華有 100 元，買了 25 元的筆記本、15 元的橡皮擦和 8 元的鉛筆，還剩多少錢？」

#### 情境 D：複雜計算步驟拆解
使用表格視覺化，讓學生清楚看到每一步的計算過程。

### 雙數字運算教學

#### 情境 1：基礎加法練習
教師設定不同的加法題目，讓學生練習兩位數相加。

#### 情境 2：減法借位概念
使用減法運算，配合步驟顯示，解釋借位過程。

#### 情境 3：乘法口訣應用
設定小數字乘法（1-12），幫助學生記憶九九乘法表。

#### 情境 4：除法與餘數
使用除法運算，顯示商數和餘數，理解除法的完整概念。

#### 情境 5：負數運算入門
使用負數運算，引導學生理解負數的加減法。

#### 情境 6：生活情境應用
使用自訂文字參數，設計購物、分享等生活情境題目。
