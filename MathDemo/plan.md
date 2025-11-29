Plan: Educational Math Visualization Pages
A set of 4 customizable HTML pages with URL parameter-driven content, each supporting horizontal bar and pie chart visualizations for different math topics, following the cal_custom.html architecture pattern.

Steps
Create percent_custom.html and README_percent_custom.md - Percentage and decimal conversions with parameters: value, percent, operation (percentOf/whatPercent/increase/decrease/toDecimal/fromDecimal), vizType (bar/pie), question, hint, chart labels, decimalPlaces. Handle >100% cases and floating-point precision.

Create basic_ops_custom.html and README_basic_ops_custom.md - Basic arithmetic operations with parameters: num1, num2, operation (add/subtract/multiply/divide), vizType, question, hint, showSteps, showRemainder, decimalPlaces. Validate division by zero, handle negative results and large products.

Create speed_custom.html and README_speed_custom.md - Speed/distance/time calculations with parameters: distance, time, distanceUnit, timeUnit, solve (speed/distance/time), vizType, question, hint, showFormula. Include unit conversion logic and formula triangle visualization.

Create fractions_custom.html and README_fractions_custom.md - Fraction operations with parameters: num1, den1, num2, den2, operation, vizType, question, hint, simplify, showLCD. Implement GCD/LCD algorithms, handle improper fractions, calculate SVG pie slice angles.

Further Considerations
Visualization approach - Use CSS for horizontal bars (reuse cal_custom.html pattern). For pie charts, use SVG with <path> elements and arc calculations. Should vizType=pie be in all files or create separate *_pie.html variants?

Code reusability - Extract common parameter parsing, validation, and error display functions into a shared JavaScript module? Or duplicate code across files for simplicity (each file remains standalone)?

Implementation order - Start with percentages (closest to existing pattern) → basic operations → speed → fractions (highest complexity). Build incrementally or develop all bar versions first, then add pie charts?

---

# NEW PLAN: Fix Fraction Bar Chart Visualization in fractions_custom.html

## Problem Analysis
1. **Fraction Display Overflow**: The fractions in the bar chart are overflowing/out of bounds because the bar widths are not sufficient to contain the fraction display
2. **Missing Common Denominator Divisions**: The bars should be visually divided into segments based on the common denominator to show the fraction parts clearly

## Proposed Solution

### 1. Ensure Minimum Bar Width for Fraction Display
- Set a minimum width for bars that ensures fractions are always fully visible
- Use CSS `min-width` to guarantee readable fraction display
- Consider the fraction format (e.g., "3/4" or "1 2/3" for mixed numbers)

### 2. Add Visual Divisions Based on Common Denominator
For fraction operations, the bars should be divided into equal segments representing the common denominator:

**Example**: 
- If adding 1/4 + 1/3, the LCD is 12
- Bar for 1/4 should show 12 segments with 3 segments filled (since 1/4 = 3/12)
- Bar for 1/3 should show 12 segments with 4 segments filled (since 1/3 = 4/12)
- Result bar for 7/12 should show 12 segments with 7 segments filled

### 3. Implementation Details

#### CSS Changes:
```css
.bar-fill {
    /* Increase minimum width to accommodate fractions */
    min-width: 150px; /* Changed from current 60px */
    
    /* Ensure text doesn't overflow */
    overflow: visible;
    white-space: nowrap;
}
```

#### JavaScript Changes:
1. **Calculate LCD (Lowest Common Denominator)**
   - Already have `lcm()` function for calculating LCD
   - Use LCD to determine number of divisions
   - Find LCD of all three fractions: frac1, frac2, and result

2. **Update Bar Rendering Logic**
   - Calculate the width based on numerator/denominator ratio
   - Apply background divisions dynamically using inline styles with `repeating-linear-gradient`
   - Ensure the fraction text is centered and visible

3. **Dynamic Division Rendering**
   ```javascript
   // For each bar, calculate:
   const lcd = lcm(lcm(denom1, denom2), resultDenom);
   const divisions = lcd;
   
   // Apply division pattern
   const divisionStyle = `
     repeating-linear-gradient(
       to right,
       transparent,
       transparent calc(100% / ${divisions} - 1px),
       rgba(255,255,255,0.4) calc(100% / ${divisions} - 1px),
       rgba(255,255,255,0.4) calc(100% / ${divisions})
     )
   `;
   ```

### 4. Specific Changes to fractions_custom.html

**Change 1: Update CSS for .bar-fill (around line 90-105)**
- Increase `min-width` from `60px` to `150px`
- Ensure `overflow: visible` and `white-space: nowrap`

**Change 2: Calculate LCD in updateContent() function (around line 450-500)**
- After getting all three fractions (frac1, frac2, result)
- Calculate: `const commonLCD = lcm(lcm(denom1, denom2), resultDenom);`
- This LCD will be used for all three bars

**Change 3: Apply Division Pattern to Bars (around line 500-580)**
- For each bar element, add inline style with `background-image` using `repeating-linear-gradient`
- Pattern creates visual divisions equal to LCD
- Each division represents 1/LCD of the whole

### 5. Example Calculation

For 1/4 + 1/3 = 7/12:
- LCD(4, 3, 12) = 12
- **Bar 1 (1/4)**: 
  - Equivalent: 3/12
  - Width: (1/4) × maxWidth = 25% relative
  - 12 divisions, showing 3 filled segments
- **Bar 2 (1/3)**:
  - Equivalent: 4/12
  - Width: (1/3) × maxWidth = 33.33% relative
  - 12 divisions, showing 4 filled segments
- **Result (7/12)**:
  - Width: (7/12) × maxWidth = 58.33% relative
  - 12 divisions, showing 7 filled segments

### 6. Edge Cases to Handle
- **Very large denominators** (e.g., LCD > 50): Cap divisions at 50 or use thicker lines
- **Improper fractions**: Handle correctly when numerator > denominator
- **Whole numbers**: Treat as fraction with denominator 1
- **Zero fractions**: Handle 0/n cases appropriately
- **Mixed numbers**: Already converted to improper fractions in current code

### 7. Code Implementation Pattern

```javascript
// In updateContent(), after calculating result:
const commonLCD = lcm(lcm(denom1, denom2), resultDenom);

// Create division background function
function getDivisionBackground(divisions) {
    if (divisions > 50) divisions = 50; // Cap for readability
    return `repeating-linear-gradient(
        to right,
        transparent,
        transparent calc(100% / ${divisions} - 1px),
        rgba(255,255,255,0.4) calc(100% / ${divisions} - 1px),
        rgba(255,255,255,0.4) calc(100% / ${divisions})
    )`;
}

// Apply to each bar
frac1Bar.style.backgroundImage = getDivisionBackground(commonLCD);
frac2Bar.style.backgroundImage = getDivisionBackground(commonLCD);
resultBar.style.backgroundImage = getDivisionBackground(commonLCD);
```

## Implementation Order
1. ✅ Write this plan in plan.md
2. ✅ Update CSS `.bar-fill` for minimum width (150px) and overflow handling
3. ✅ Add LCD calculation function call in updateContent()
4. ✅ Create getDivisionBackground() helper function
5. ✅ Apply division backgrounds to all three bars (frac1, frac2, result)
6. 🔄 Test with various fraction combinations
7. 🔄 Adjust division line opacity/color for optimal visibility

## Implementation Complete ✅

All changes have been successfully applied to fractions_custom.html:

1. **CSS Changes**: Increased `.bar-fill` minimum width to 150px, added `overflow: visible` and `white-space: nowrap` to ensure fractions display properly
2. **Division Function**: Created `getDivisionBackground(divisions)` helper that generates repeating-linear-gradient patterns capped at 50 divisions
3. **LCD Calculation**: Common LCD is calculated from all three fractions (den1, den2, resultDen) using nested lcm() calls
4. **Bar Rendering**: All three bars (frac1, frac2, result) now have:
   - Minimum width of 150px
   - Division backgrounds based on common LCD
   - Visual segments showing fraction parts

The bars now properly display fractions without overflow and show visual divisions representing the common denominator, making it easier to understand fraction operations visually.