# R Quick Reference Card - Exam Day
## One-Page Cheat Sheet

---

## 🔧 SETUP
```r
library(dplyr); library(ggplot2); library(tidyr); library(scales)
data <- read.csv("file.csv", header = T)
```

---

## 📊 DPLYR (Data Transformation)

### Essential Functions
```r
# FILTER - keep rows
filter(year == 2021, metro == "Austin")

# SELECT - keep columns
select(metro, price, room_type)

# MUTATE - create columns
mutate(new_col = old_col * 2)

# GROUP_BY + SUMMARIZE - aggregate
group_by(metro) %>%
  summarize(
    count = n(),                   # Count rows
    avg = mean(price),            # Average
    total = sum(nights),          # Sum
    unique = n_distinct(host_id)  # Count unique
  )

# ARRANGE - sort
arrange(desc(price))             # Descending
arrange(price)                   # Ascending
```

### Pipe Logic: `%>%` = "THEN"
```r
data %>%                          # Start with data, THEN
  filter(year == 2021) %>%       # Filter, THEN
  group_by(metro) %>%            # Group, THEN
  summarize(avg = mean(price))   # Summarize
```

---

## 📈 GGPLOT2 (Visualization)

### Structure
```r
ggplot(data, aes(x = var1, y = var2)) +
  geom_TYPE() +
  labs(title = "Title", x = "X", y = "Y")
```

### Common Geoms
```r
geom_point()                     # Scatter plot
geom_line()                      # Line plot
geom_col()                       # Bar chart (uses y values)
geom_smooth(method="lm", se=F)   # Trend line
```

### Key Customizations
```r
# Colors & grouping
aes(color = metro, group = metro)

# Reorder x-axis by y values
aes(x = reorder(metro, -value))

# Scale y-axis
scale_y_log10(labels = comma)    # Log scale with commas
scale_y_continuous(labels = comma) # Commas only

# Facet (small multiples)
facet_wrap(~ metro)

# Flip coordinates (horizontal bars)
coord_flip()

# Add text labels
geom_text(aes(label = sprintf("%.1f%%", value)))
```

---

## 📉 REGRESSION

### Run Model
```r
model <- lm(y ~ x1 + x2 + x3, data = df)
summary(model)              # View results
coef(model)                 # Extract coefficients
```

### Interpret Output
```r
# Coefficients table shows:
# Estimate: Effect size (slope)
# Pr(>|t|): p-value (< 0.05 = significant)

# R-squared: % variation explained (0.73 = 73%)
```

### Predictions
```r
new_data <- tibble(x1 = 100, x2 = "Type A")
predicted_y <- predict(model, new_data)
```

### Own-Price Elasticity
```r
dQ_dP <- coef(model)[2]                    # Slope
p <- median(data$price)                    # Price point
q <- predict(model, tibble(price = p))     # Predicted Q
OPE <- dQ_dP * p / q                       # Elasticity

# |OPE| > 1: Elastic (price-sensitive)
# |OPE| < 1: Inelastic (not price-sensitive)
```

---

## 🎯 COMMON PATTERNS

### Remove Outliers (IQR)
```r
data %>%
  filter(
    price >= quantile(price, 0.25),
    price <= quantile(price, 0.75)
  )
```

### Calculate Percentages
```r
data %>%
  group_by(category) %>%
  summarize(count = n()) %>%
  mutate(total = sum(count)) %>%
  mutate(pct = count / total * 100)
```

### Pivot Wide (Reshape)
```r
pivot_wider(
  names_from = quarter,      # Column to spread
  values_from = value        # Values to fill
)
```

### Demand Calculation (from sessions)
```r
mutate(
  bookings = number_of_reviews_ltm * 2 / 4,
  nights_booked = if_else(bookings * 3 > 63, 63, bookings * 3)
)
```

---

## ⚠️ COMMON ERRORS

| Error | Fix |
|-------|-----|
| `filter(year = 2021)` | Use `==` not `=` |
| `ggplot(data, x = price)` | Need `aes()`: `aes(x = price)` |
| `geom_line()` missing lines | Add `group = metro` in `aes()` |
| Package error | Run `library(package_name)` |
| Plot uses `%>%` | Use `+` for ggplot, `%>%` for dplyr |

---

## 📐 FORMULAS

**Elasticity**: `OPE = (dQ/dP) × (P/Q)`

**% Change**: `(New - Old) / Old × 100`

**Percentiles**: `quantile(x, 0.25)` = 25th percentile

---

## 🔍 DEBUGGING

1. Check package loaded: `library(dplyr)`
2. Check spelling (case-sensitive!)
3. Use `==` for comparison
4. Quotes around text: `"Austin"`
5. Test pipes step-by-step
6. Use `head()` and `str()` to inspect data

---

## 📝 EXAM STRATEGY

✅ Read question twice
✅ Start with data frame name
✅ Work step-by-step with pipes
✅ Test intermediate results
✅ Check if output makes sense
✅ Comment your code
✅ Easy questions first

---

## 💡 QUICK LOOKUP

### Summary Stats
```r
mean(x)      # Average
median(x)    # Median
sum(x)       # Total
min(x)       # Minimum
max(x)       # Maximum
sd(x)        # Standard deviation
n()          # Count (in summarize)
n_distinct() # Count unique
```

### Logical Operators
```r
==    # Equal
!=    # Not equal
>     # Greater than
<     # Less than
>=    # Greater or equal
<=    # Less or equal
&     # AND
|     # OR
%in%  # In set
```

### if_else
```r
if_else(condition, value_if_true, value_if_false)
if_else(price > 100, "expensive", "cheap")
```

---

**Good luck! 🎯 You've got this!**
