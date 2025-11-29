# speed_custom.html 使用說明

這是一個完全可自訂的速率題目展示頁面，支援速率、距離、時間的三種計算模式，包含單位轉換和公式三角形視覺化。

## 🌐 基礎 URL

```
https://enochpublicprojects.github.io/public_code/speed_custom.html
```

## 📋 URL 參數說明

### 基本數值參數

| 參數 | 說明 | 類型 | 預設值 | 範例 |
|------|------|------|--------|------|
| `distance` | 距離數值 | 正數 | 依solve而定 | `distance=120` |
| `time` | 時間數值 | 正數 | 依solve而定 | `time=2` |
| `decimalPlaces` | 小數位數 | 0-10的整數 | 2 | `decimalPlaces=3` |

### 單位參數

| 參數 | 說明 | 可選值 | 預設值 |
|------|------|--------|--------|
| `distanceUnit` | 距離單位 | `m`, `km`, `cm`, `mile`, `ft` | `km` |
| `timeUnit` | 時間單位 | `second`, `minute`, `hour`, `day` | `hour` |

#### 支援的單位

**距離單位：**
- `m` - 公尺
- `km` - 公里
- `cm` - 公分
- `mile` - 英里
- `ft` - 英尺

**時間單位：**
- `second` - 秒
- `minute` - 分鐘
- `hour` - 小時
- `day` - 天

### 計算模式參數

| 參數 | 說明 | 可選值 | 預設值 |
|------|------|--------|--------|
| `solve` | 要計算的值 | `speed`, `distance`, `time` | `speed` |

#### 計算模式詳解

- **speed** (速率): 計算「速率 = 距離 ÷ 時間」
  - `distance` = 實際距離, `time` = 實際時間
  - 預設: distance=120, time=2
  
- **distance** (距離): 計算「距離 = 速率 × 時間」
  - `distance` = 速率數值, `time` = 時間數值
  - 預設: distance=150, time=3
  
- **time** (時間): 計算「時間 = 距離 ÷ 速率」
  - `distance` = 實際距離, `time` = 速率數值
  - 預設: distance=240, time=4

### 視覺化參數

| 參數 | 說明 | 可選值 | 預設值 |
|------|------|--------|--------|
| `vizType` | 圖表類型 | `bar`, `pie` | `bar` |
| `showFormula` | 是否顯示公式三角形 | `true`, `false` | `true` |

### 自訂文字參數

| 參數 | 說明 | 預設值 | 範例 |
|------|------|--------|------|
| `question` | 自訂題目內容 | 自動生成 | `question=小明騎腳踏車...` |
| `hint` | 自訂提示內容 | 自動生成 | `hint=使用速率公式` |
| `warning` | 自訂警告訊息 | 無 | `warning=⚠️ 注意單位` |
| `chartTitle` | 圖表標題 | 依solve自動生成 | `chartTitle=🚴 腳踏車速率` |
| `distanceLabel` | 距離標籤 | 距離 (單位) | `distanceLabel=路程` |
| `timeLabel` | 時間標籤 | 時間 (單位) | `timeLabel=花費時間` |
| `speedLabel` | 速率標籤 | 速率 (單位) | `speedLabel=平均速率` |

## 🎯 使用範例

### 範例 1：計算速率（預設）

```url
speed_custom.html?distance=120&time=2
```

計算：120公里 ÷ 2小時 = 60公里/小時

### 範例 2：計算距離

```url
speed_custom.html?solve=distance&distance=60&time=3
```

計算：60公里/小時 × 3小時 = 180公里

### 範例 3：計算時間

```url
speed_custom.html?solve=time&distance=240&time=60
```

計算：240公里 ÷ 60公里/小時 = 4小時

### 範例 4：使用不同單位（公尺/秒）

```url
speed_custom.html?distance=100&time=10&distanceUnit=m&timeUnit=second
```

計算：100公尺 ÷ 10秒 = 10公尺/秒

### 範例 5：英里和小時

```url
speed_custom.html?distance=60&time=1.5&distanceUnit=mile&timeUnit=hour
```

計算：60英里 ÷ 1.5小時 = 40英里/小時

### 範例 6：隱藏公式三角形

```url
speed_custom.html?distance=150&time=3&showFormula=false
```

不顯示公式三角形

### 範例 7：使用圓餅圖

```url
speed_custom.html?distance=120&time=2&vizType=pie
```

以圓餅圖顯示距離和時間的關係

### 範例 8：完全自訂（腳踏車情境）

```url
speed_custom.html?distance=30&time=2&distanceUnit=km&timeUnit=hour&question=小明騎腳踏車從家裡到學校，距離30公里，花了2小時，請問平均速率是多少？&hint=用距離除以時間&chartTitle=🚴 腳踏車速率&distanceLabel=路程&timeLabel=時間&speedLabel=騎車速度
```

### 範例 9：跑步速率（公尺/秒）

```url
speed_custom.html?distance=400&time=50&distanceUnit=m&timeUnit=second&question=小華跑400公尺，用了50秒，請問平均速率是多少公尺/秒？&chartTitle=🏃 跑步速率
```

### 範例 10：高精度計算

```url
speed_custom.html?distance=100&time=7&decimalPlaces=4
```

計算並顯示到小數點後4位：14.2857公里/小時

## ⚠️ 異常處理

### 自動處理的異常情況

1. **時間為零**
   - URL: `speed_custom.html?distance=100&time=0`
   - 結果：顯示錯誤訊息「無法計算（時間不能為0）」

2. **無效數值**
   - URL: `speed_custom.html?distance=abc&time=xyz`
   - 結果：顯示錯誤訊息，使用預設值

3. **負數或零**
   - URL: `speed_custom.html?distance=-100&time=2`
   - 結果：顯示錯誤訊息，使用預設值（距離和時間必須是正數）

4. **無效單位**
   - 自動回退到預設單位（km 和 hour）

5. **小數位數超出範圍**
   - 自動使用預設值 2

## 💡 技術細節

### 計算公式

三個基本公式：

1. **速率 = 距離 ÷ 時間** (Speed = Distance / Time)
2. **距離 = 速率 × 時間** (Distance = Speed × Time)
3. **時間 = 距離 ÷ 速率** (Time = Distance / Speed)

### 公式三角形

```
      D
     ---
    | S T |
```

- 遮住 D（距離）→ 公式是 S × T
- 遮住 S（速率）→ 公式是 D ÷ T
- 遮住 T（時間）→ 公式是 D ÷ S

### 單位轉換系統

雖然目前未實作自動轉換，但系統包含單位定義，方便未來擴充：

**距離單位換算（轉為公尺）：**
- 公尺 (m) = 1
- 公里 (km) = 1000
- 公分 (cm) = 0.01
- 英里 (mile) = 1609.34
- 英尺 (ft) = 0.3048

**時間單位換算（轉為秒）：**
- 秒 (second) = 1
- 分鐘 (minute) = 60
- 小時 (hour) = 3600
- 天 (day) = 86400

### 圓餅圖實作

- 顯示距離和時間的相對比例
- 中央顯示計算結果
- 使用 SVG 路徑繪製扇形

### 視覺化選擇建議

| 計算類型 | 建議圖表 | 原因 |
|---------|---------|------|
| speed | bar | 條形圖清楚顯示距離、時間、速率的比較 |
| distance | bar | 條形圖方便比較速率、時間、結果距離 |
| time | bar | 條形圖方便比較距離、速率、結果時間 |

**公式三角形：** 始終建議顯示，幫助學生記憶公式關係

## 🔗 快速測試連結

在瀏覽器中直接點擊測試：

1. [預設範例 - 計算速率](speed_custom.html)
2. [計算距離](speed_custom.html?solve=distance&distance=60&time=3)
3. [計算時間](speed_custom.html?solve=time&distance=240&time=60)
4. [公尺/秒](speed_custom.html?distance=100&time=10&distanceUnit=m&timeUnit=second)
5. [英里/小時](speed_custom.html?distance=60&time=1.5&distanceUnit=mile&timeUnit=hour)
6. [隱藏公式](speed_custom.html?distance=150&time=3&showFormula=false)
7. [圓餅圖](speed_custom.html?distance=120&time=2&vizType=pie)
8. [腳踏車情境](speed_custom.html?distance=30&time=2&question=小明騎腳踏車從家裡到學校，距離30公里，花了2小時，請問平均速率是多少？&chartTitle=🚴腳踏車速率)
9. [跑步速率](speed_custom.html?distance=400&time=50&distanceUnit=m&timeUnit=second&chartTitle=🏃跑步速率)
10. [高精度](speed_custom.html?distance=100&time=7&decimalPlaces=4)

## 📝 注意事項

1. **參數大小寫**：參數名稱區分大小寫（使用小駝峰命名）
2. **solve 參數理解**：
   - `solve=speed`: distance和time是實際值
   - `solve=distance`: distance是速率，time是時間
   - `solve=time`: distance是距離，time是速率
3. **單位一致性**：確保問題中的單位與參數設定一致
4. **公式三角形**：預設顯示，可用 `showFormula=false` 隱藏
5. **正數限制**：距離和時間必須是正數
6. **瀏覽器兼容**：支援所有現代瀏覽器（Chrome, Firefox, Safari, Edge）

## 🖼️ 嵌入網頁（iframe）

### 基本嵌入（計算速率）

```html
<iframe 
  src="https://enochpublicprojects.github.io/public_code/speed_custom.html?distance=120&time=2" 
  width="100%" 
  height="750" 
  frameborder="0">
</iframe>
```

### 計算距離嵌入

```html
<iframe 
  src="https://enochpublicprojects.github.io/public_code/speed_custom.html?solve=distance&distance=60&time=3" 
  width="100%" 
  height="750" 
  frameborder="0"
  style="border: 1px solid #ddd; border-radius: 8px;">
</iframe>
```

### 腳踏車情境嵌入

```html
<iframe 
  src="https://enochpublicprojects.github.io/public_code/speed_custom.html?distance=30&time=2&question=小明騎腳踏車從家裡到學校，距離30公里，花了2小時，請問平均速率是多少？&chartTitle=🚴腳踏車速率" 
  width="100%" 
  height="800" 
  frameborder="0">
</iframe>
```

### 公尺/秒單位嵌入

```html
<iframe 
  src="https://enochpublicprojects.github.io/public_code/speed_custom.html?distance=100&time=10&distanceUnit=m&timeUnit=second&chartTitle=🏃跑步速率" 
  width="100%" 
  height="750" 
  frameborder="0">
</iframe>
```

### 響應式嵌入

```html
<div style="position: relative; padding-bottom: 90%; height: 0; overflow: hidden;">
  <iframe 
    src="https://enochpublicprojects.github.io/public_code/speed_custom.html?distance=240&time=4" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
  </iframe>
</div>
```

### 建議尺寸

- **最小寬度**：800px
- **最小高度**：750px（包含公式三角形）
- **建議高度**：800-850px（有自訂問題時）

## 🎓 教學應用情境

### 情境 1：基本速率概念
使用簡單的整數，幫助學生理解速率 = 距離 ÷ 時間。

### 情境 2：不同單位練習
設定不同的單位組合，讓學生熟悉各種速率表示方式。

### 情境 3：反向計算
使用 `solve=distance` 或 `solve=time`，練習從速率推算距離或時間。

### 情境 4：公式記憶
使用公式三角形，幫助學生記憶三個公式的關係。

### 情境 5：生活情境應用
設計交通工具（汽車、腳踏車、跑步等）的實際情境題目。

### 情境 6：單位換算準備
雖然目前未實作自動換算，但可用於準備單位換算的教學。
