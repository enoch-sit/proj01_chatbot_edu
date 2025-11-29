# cal_custom.html 使用說明

這是一個完全可自訂的數學題目展示頁面，所有內容都可以透過 URL 參數控制。

## 🌐 基礎 URL

```
https://enochpublicprojects.github.io/public_code/cal_custom.html
```

## 📋 URL 參數說明

### 基本數值參數

| 參數 | 說明 | 類型 | 預設值 | 範例 |
|------|------|------|--------|------|
| `total` | 總頁數 | 正整數 | 100 | `total=200` |
| `perDay` | 每天閱讀頁數 | 非負整數 | 30 | `perDay=25` |
| `days` | 天數 | 非負整數 | 4 | `days=7` |

### 自訂文字參數

| 參數 | 說明 | 預設值 | 範例 |
|------|------|--------|------|
| `question` | 自訂題目內容 | 自動生成 | `question=小明的英文書有150頁...` |
| `hint` | 自訂提示內容 | 自動生成 | `hint=先計算總共讀了多少頁` |
| `warning` | 自訂警告訊息 | 自動生成（當超頁時） | `warning=⚠️ 已讀完` |
| `chartTitle` | 圖表標題 | 📊 閱讀進度圖 | `chartTitle=📚學習進度` |
| `readLabel` | 已讀標籤 | 已閱讀 | `readLabel=已完成` |
| `unreadLabel` | 未讀標籤 | 未閱讀 | `unreadLabel=待完成` |

### 顯示控制參數

| 參數 | 說明 | 預設值 |
|------|------|--------|
| `showGuide` | 是否顯示使用說明 | true |

設定 `showGuide=false` 可隱藏頁面底部的使用說明。

## 🎯 使用範例

### 範例 1：基本使用（僅改數值）
```
cal_custom.html?total=200&perDay=25&days=5
```
- 總頁數：200 頁
- 每天閱讀：25 頁
- 天數：5 天
- 其他內容自動生成

### 範例 2：完全自訂
```
cal_custom.html?total=150&perDay=20&days=8&question=小明的英文書有150頁，每天讀20頁，8天後還剩多少頁？&hint=計算8天共讀多少頁&chartTitle=📚學習進度&readLabel=已完成&unreadLabel=待完成
```

### 範例 3：自訂警告訊息
```
cal_custom.html?total=100&perDay=30&days=4&warning=⚠️ 注意：閱讀頁數 (120 頁) 超過總頁數 (100 頁)，書本已全部讀完
```

### 範例 4：隱藏使用說明
```
cal_custom.html?total=80&perDay=15&days=3&showGuide=false
```

### 範例 5：不同主題（運動）
```
cal_custom.html?total=42&perDay=5&days=7&question=馬拉松全程42公里，小華每天跑5公里，7天後還剩多少公里？&hint=計算7天總共跑了多少公里&chartTitle=🏃‍♂️ 跑步進度&readLabel=已完成&unreadLabel=剩餘距離&showGuide=false
```

### 範例 6：學習進度追蹤
```
cal_custom.html?total=50&perDay=7&days=5&question=這學期有50個單字要背，每天背7個，5天後還剩多少個？&chartTitle=📝 單字學習進度&readLabel=已背誦&unreadLabel=待背誦
```

## ⚠️ 異常處理

### 自動處理的異常情況：

1. **無效數值**
   - URL: `cal_custom.html?total=abc`
   - 結果：顯示錯誤訊息，使用預設值 100

2. **負數**
   - URL: `cal_custom.html?total=-50`
   - 結果：顯示錯誤訊息，使用預設值

3. **閱讀超過總頁數**
   - URL: `cal_custom.html?total=100&perDay=30&days=5`
   - 結果：自動顯示警告「閱讀頁數 (150 頁) 超過總頁數 (100 頁)」
   - 圖表顯示：100% 已讀，0% 未讀

4. **零值處理**
   - `days=0`：顯示「尚未開始閱讀」
   - `perDay=0`：顯示「沒有進行閱讀」

5. **空白參數**
   - 未提供參數時使用預設值

## 💡 技術細節

### URL 編碼
- 中文字會自動進行 URL 編碼
- 瀏覽器複製貼上 URL 時會自動處理
- 特殊符號（如 emoji）可直接使用

### 自動生成規則
- **question**: 當未提供時，根據 `total`、`perDay`、`days` 自動生成
- **hint**: 當未提供時，自動計算並生成提示
- **warning**: 當閱讀頁數超過總頁數時自動生成（可用自訂 warning 覆蓋）

### 圖表行為
- 百分比自動計算：`已讀% = (實際已讀 / 總頁數) × 100`
- 最小寬度：確保文字可見（60px）
- 零值淡化：0 頁的項目會顯示為 50% 不透明度
- 平滑動畫：寬度變化有 0.5 秒過渡效果

## 🔗 快速測試連結

在瀏覽器中直接點擊測試：

1. [預設範例](cal_custom.html)
2. [大數值範例](cal_custom.html?total=500&perDay=50&days=8)
3. [超頁範例](cal_custom.html?total=100&perDay=40&days=5)
4. [零天數範例](cal_custom.html?days=0)
5. [完全自訂範例](cal_custom.html?total=150&perDay=20&days=8&question=小明的英文書有150頁，每天讀20頁，8天後還剩多少頁？&chartTitle=📚學習進度&readLabel=已完成&unreadLabel=待完成&showGuide=false)

## 📝 注意事項

1. **參數大小寫**：參數名稱區分大小寫（使用小駝峰命名）
2. **必須參數**：所有參數都是選填，有預設值
3. **組合使用**：可以只提供部分參數，其他使用預設值
4. **瀏覽器兼容**：支援所有現代瀏覽器（Chrome, Firefox, Safari, Edge）

## 🖼️ 嵌入網頁（iframe）

### 基本嵌入

```html
<iframe 
  src="https://enochpublicprojects.github.io/public_code/cal_custom.html?total=200&perDay=25&days=5" 
  width="100%" 
  height="600" 
  frameborder="0">
</iframe>
```

### 自訂參數嵌入

```html
<iframe 
  src="https://enochpublicprojects.github.io/public_code/cal_custom.html?total=150&perDay=20&days=8&question=小明的英文書有150頁，每天讀20頁，8天後還剩多少頁？&chartTitle=📚學習進度&readLabel=已完成&unreadLabel=待完成" 
  width="100%" 
  height="700" 
  frameborder="0"
  style="border: 1px solid #ddd; border-radius: 8px;">
</iframe>
```

### 響應式嵌入（自適應高度）

```html
<div style="position: relative; padding-bottom: 75%; height: 0; overflow: hidden;">
  <iframe 
    src="https://enochpublicprojects.github.io/public_code/cal_custom.html?total=100&perDay=30&days=4" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;">
  </iframe>
</div>
```

### 建議尺寸

- **最小寬度**：800px（完整顯示所有內容）
- **最小高度**：600px（包含圖表和說明）
- **建議高度**：700-800px（留有足夠空間）
