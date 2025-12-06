# R Midterm Exam Study Guide
## Complete Reference with Code, Functions, Tips & Tricks

**Topics Covered:**
1. Data Transformation (dplyr)
2. Data Visualization (ggplot2)
3. Multivariate Regression (lm)
4. Real-world application (Airbnb analysis)

---

## 📚 TABLE OF CONTENTS

1. [Essential Setup & Basics](#1-essential-setup--basics)
2. [Data Transformation with dplyr](#2-data-transformation-with-dplyr)
3. [Data Visualization with ggplot2](#3-data-visualization-with-ggplot2)
4. [Multivariate Regression](#4-multivariate-regression)
5. [Common Patterns & Workflows](#5-common-patterns--workflows)
6. [Quick Reference Cheat Sheet](#6-quick-reference-cheat-sheet)
7. [Practice Problems with Solutions](#7-practice-problems-with-solutions)
8. [Exam Tips & Common Errors](#8-exam-tips--common-errors)

---

## 1. ESSENTIAL SETUP & BASICS

### Loading Packages
```r
# Install packages (only once)
install.packages("dplyr")
install.packages("ggplot2")
install.packages("tidyr")
install.packages("scales")

# Load packages (every session)
library(dplyr)      # Data manipulation
library(ggplot2)    # Data visualization
library(tidyr)      # Data tidying
library(scales)     # Number formatting
```

### Reading Data
```r
# Read CSV file
airbnb <- read.csv("airbnb.csv", header = T)

# header = T means first row contains column names
```

### Basic Data Exploration
```r
# Check data type
class(airbnb)                    # "data.frame"

# View first 6 rows
head(airbnb)

# View structure (variables, types, first values)
str(airbnb)

# Check variable type
class(airbnb$price)              # numeric, character, etc.

# Number of rows
nrow(airbnb)

# Number of columns
ncol(airbnb)

# Summary statistics
summary(airbnb$price)            # min, max, median, mean, quartiles
```

**💡 EXAM TIP**: Always use `str()` first to understand your data structure!

---

## 2. DATA TRANSFORMATION WITH DPLYR

### Core dplyr Functions (The Big 5)

#### 1. `filter()` - Keep rows that match conditions
```r
# Filter by single condition
airbnb %>%
  filter(year == 2021)

# Filter by multiple conditions (AND)
airbnb %>%
  filter(year == 2021, metro == "Austin")

# Filter with OR
airbnb %>%
  filter(metro == "Austin" | metro == "LA")

# Filter using %in% for multiple values
airbnb %>%
  filter(yrqtr %in% c("2019-4", "2021-4"))

# Filter numeric ranges
airbnb %>%
  filter(price >= 100, price <= 300)
```

**💡 EXAM TIP**:
- Use `==` for equality (not `=`)
- Use `!=` for "not equal"
- Comma (`,`) means AND
- Pipe (`|`) means OR

#### 2. `select()` - Keep specific columns
```r
# Select specific columns
airbnb %>%
  select(metro, price, room_type)

# Select range of columns
airbnb %>%
  select(metro:price)

# Remove specific columns
airbnb %>%
  select(-year, -quarter)
```

#### 3. `mutate()` - Create new columns
```r
# Create single new column
airbnb %>%
  mutate(price_per_night = price / 30)

# Create multiple columns
airbnb %>%
  mutate(
    bookings = number_of_reviews_ltm * 2 / 4,
    nights_booked = if_else(bookings * 3 > 63, 63, bookings * 3)
  )

# if_else syntax: if_else(condition, value_if_true, value_if_false)
```

**💡 EXAM TIP**: `mutate()` keeps ALL original columns + adds new ones

#### 4. `group_by()` - Group data for calculations
```r
# Group by single variable
airbnb %>%
  group_by(metro)

# Group by multiple variables
airbnb %>%
  group_by(metro, yrqtr)
```

**⚠️ IMPORTANT**: `group_by()` alone does nothing - must combine with `summarize()`

#### 5. `summarize()` / `summarise()` - Calculate summary statistics
```r
# Count observations
airbnb %>%
  group_by(metro) %>%
  summarize(nListings = n())

# Multiple summaries
airbnb %>%
  group_by(metro) %>%
  summarize(
    nListings = n(),                    # Count
    avgPrice = mean(price),             # Average
    medianPrice = median(price),        # Median
    maxPrice = max(price),              # Maximum
    minPrice = min(price),              # Minimum
    sdPrice = sd(price)                 # Standard deviation
  )

# Sum
airbnb %>%
  group_by(metro) %>%
  summarize(total_demand = sum(nights_booked))
```

**Common Summary Functions**:
- `n()` - Count rows
- `mean()` - Average
- `median()` - Median
- `sum()` - Total
- `max()` - Maximum
- `min()` - Minimum
- `sd()` - Standard deviation
- `n_distinct()` - Count unique values

### Additional dplyr Functions

#### `arrange()` - Sort data
```r
# Sort ascending (smallest to largest)
airbnb %>%
  arrange(price)

# Sort descending (largest to smallest)
airbnb %>%
  arrange(desc(price))

# Sort by multiple columns
airbnb %>%
  arrange(metro, desc(price))
```

#### `distinct()` - Get unique values
```r
# Unique metros
airbnb %>%
  distinct(metro)

# Unique combinations
airbnb %>%
  distinct(metro, room_type)
```

### The Pipe Operator `%>%`

**Think of it as "THEN"**

```r
# Without pipe (hard to read)
arrange(summarize(group_by(filter(airbnb, year == 2021), metro), nListings = n()), desc(nListings))

# With pipe (easy to read)
airbnb %>%
  filter(year == 2021) %>%        # Start with airbnb, THEN filter
  group_by(metro) %>%              # THEN group by metro
  summarize(nListings = n()) %>%   # THEN count
  arrange(desc(nListings))         # THEN sort
```

**💡 EXAM TIP**: Read `%>%` as "then" - makes code logical!

### quantile() - Calculate Percentiles

```r
# 25th percentile (Q1)
quantile(airbnb$price, 0.25)

# 50th percentile (median)
quantile(airbnb$price, 0.50)

# 75th percentile (Q3)
quantile(airbnb$price, 0.75)

# IQR filtering (remove outliers)
airbnb %>%
  filter(
    price >= quantile(price, 0.25),
    price <= quantile(price, 0.75)
  )
```

### pivot_wider() - Reshape from long to wide

```r
# From tidyr package
hosts_summary %>%
  pivot_wider(
    names_from = yrqtr,        # Column to spread
    values_from = unique_hosts  # Values to fill
  )

# Before:
# metro  yrqtr   unique_hosts
# LA     2019-4  1000
# LA     2021-4  1200

# After:
# metro  2019-4  2021-4
# LA     1000    1200
```

---

## 3. DATA VISUALIZATION WITH GGPLOT2

### The ggplot2 Grammar

**Structure**: `ggplot(data, aes(x, y)) + geom_TYPE() + customizations`

```r
ggplot(data = my_data, aes(x = variable1, y = variable2)) +
  geom_point() +                    # Add scatter plot
  labs(title = "My Title") +        # Add title
  xlab("X Label") +                 # X-axis label
  ylab("Y Label")                   # Y-axis label
```

### Common Plot Types (geom_)

#### Scatter Plot: `geom_point()`
```r
ggplot(demand, aes(x = price, y = demand)) +
  geom_point()
```

#### Line Plot: `geom_line()`
```r
ggplot(demand_metro_qtr, aes(x = yrqtr, y = demand, group = metro, color = metro)) +
  geom_line()

# group = defines which observations to connect
# color = colors lines by variable
```

#### Bar/Column Chart: `geom_col()`
```r
ggplot(mean_listings_by_metro, aes(x = metro, y = mean_listings)) +
  geom_col()

# geom_col() uses actual y values
# geom_bar() counts observations (no y needed)
```

#### Trend Line: `geom_smooth()`
```r
# Linear trend line
ggplot(demand, aes(x = price, y = demand)) +
  geom_point() +
  geom_smooth(method = "lm", se = FALSE)

# method = "lm" for linear
# se = FALSE removes confidence interval shading
```

### Aesthetic Mappings (aes)

**Inside `aes()` - varies by data**:
```r
aes(
  x = price,              # X-axis variable
  y = demand,             # Y-axis variable
  color = metro,          # Color by variable
  fill = room_type,       # Fill color by variable
  size = nights_booked,   # Point size by variable
  group = metro           # Group observations
)
```

**Outside `aes()` - fixed for all**:
```r
geom_point(color = "blue", size = 3)
geom_line(color = "red", linewidth = 2)
```

**💡 EXAM TIP**: If it changes by data → inside `aes()`. If it's fixed → outside.

### Labels & Titles

```r
ggplot(data, aes(x, y)) +
  geom_point() +
  ggtitle("My Title") +              # Main title
  xlab("X-axis Label") +             # X-axis
  ylab("Y-axis Label") +             # Y-axis
  labs(                              # Alternative: all at once
    title = "My Title",
    x = "X-axis Label",
    y = "Y-axis Label",
    color = "Legend Title"
  )
```

### Scale Transformations

#### Log Scale
```r
# Log10 scale on y-axis
scale_y_log10()

# Log10 scale on both axes
scale_y_log10() +
scale_x_log10()
```

#### Number Formatting
```r
# From scales package
scale_y_continuous(labels = comma)         # 1,000 instead of 1000
scale_y_continuous(labels = dollar)        # $1,000
scale_y_continuous(labels = percent)       # 50% instead of 0.5
scale_y_continuous(labels = label_number()) # Auto formatting
```

### Faceting (Small Multiples)

```r
# Create separate plot for each metro
ggplot(airbnb_iqr, aes(x = price, y = total_demand)) +
  geom_point() +
  facet_wrap(~ metro)

# Facet by two variables
facet_wrap(~ metro + room_type)

# Control number of columns
facet_wrap(~ metro, ncol = 3)
```

### Reordering

```r
# Reorder x-axis by y values (descending)
ggplot(data, aes(x = reorder(metro, -mean_listings), y = mean_listings)) +
  geom_col()

# reorder(variable, by_what)
# Use - for descending
```

### Flipping Coordinates

```r
# Make horizontal bar chart
ggplot(data, aes(x = metro, y = value)) +
  geom_col() +
  coord_flip()
```

### Adding Text Labels

```r
# Add percentage labels to bars
ggplot(hosts_19_21, aes(x = metro, y = pct_change)) +
  geom_col() +
  geom_text(
    aes(label = sprintf("%.1f%%", pct_change)),  # Format: 12.3%
    hjust = ifelse(pct_change < 0, 1.1, -0.1)   # Position: inside or outside
  )

# sprintf("%.1f%%", value) formats to 1 decimal place with %
```

### Complete Example

```r
ggplot(demand_metro_qtr, aes(x = yrqtr, y = demand, group = metro, color = metro)) +
  geom_line() +
  xlab("Year-Quarter") +
  ylab("Nights Booked") +
  scale_y_continuous(labels = label_number()) +
  ggtitle("Trends in Demand by Metro") +
  theme_minimal()                      # Clean theme
```

---

## 4. MULTIVARIATE REGRESSION

### Running a Regression: `lm()`

**Syntax**: `lm(y ~ x1 + x2 + x3, data = dataset)`

```r
# Simple regression (one predictor)
model <- lm(demand ~ price, data = demand_data)

# Multiple regression
model <- lm(nights_booked ~ price + room_type + number_of_reviews_ltm + host_is_superhost,
            data = demand_2021)

# View results
summary(model)
```

### Interpreting Regression Output

```r
summary(model)

# Key parts:
# Coefficients:
#                    Estimate  Std. Error  t value  Pr(>|t|)
# (Intercept)         50.234      2.156    23.31    <2e-16 ***
# price               -0.345      0.023   -15.00    <2e-16 ***
# room_typePrivate    -12.450     1.234   -10.09    <2e-16 ***

# R-squared: 0.7234   (72.34% of variation explained)
# Adjusted R-squared: 0.7198
# F-statistic: 234.5 on 3 and 996 DF,  p-value: < 2.2e-16
```

**Interpreting Coefficients**:
- **Intercept**: Predicted y when all x = 0
- **Price coefficient (-0.345)**: For every $1 increase in price, demand decreases by 0.345 nights (holding all else constant)
- **p-value (Pr(>|t|))**:
  - < 0.05 = statistically significant (*)
  - < 0.01 = highly significant (**)
  - < 0.001 = very significant (***)

**💡 EXAM TIP**: If p-value < 0.05, the variable is statistically significant!

### Extracting Coefficients

```r
# Get all coefficients
coef(model)

# Save coefficients to variable
demand_coefs <- coef(model)

# Extract specific coefficient
intercept <- coef(model)[1]
price_coef <- coef(model)[2]  # Or coef(model)["price"]
```

### Making Predictions: `predict()`

```r
# Predict for new data
new_listing <- tibble(
  price = 125,
  room_type = "Private room",
  number_of_reviews_ltm = 50,
  host_is_superhost = "t"
)

# Get prediction
predicted_demand <- predict(model, new_listing)

# Manual calculation (equivalent)
predicted_demand <- coef(model)[1] +
                    coef(model)[2] * 125 +
                    coef(model)[3] * 1 +  # If Private room
                    coef(model)[4] * 50 +
                    coef(model)[5] * 1    # If superhost
```

### Categorical Variables in Regression

```r
# R automatically creates dummy variables
model <- lm(price ~ room_type, data = airbnb)

# If room_type has: "Entire home", "Private room", "Shared room"
# R creates:
#   room_typePrivate room (1 if Private, 0 otherwise)
#   room_typeShared room (1 if Shared, 0 otherwise)
#   Base category: Entire home (when both = 0)
```

**💡 EXAM TIP**: R picks the first category alphabetically as the base!

### Own-Price Elasticity (OPE)

**Formula**: `OPE = (dQ/dP) × (P/Q)`

```r
# Step 1: Get slope (dQ/dP) from regression
dQ_dP <- coef(demand_model)[2]

# Step 2: Choose a price point (usually median)
p <- median(airbnb_2021$price)

# Step 3: Predict quantity at that price
q <- predict(demand_model, tibble(price = p))

# Step 4: Calculate elasticity
OPE <- dQ_dP * p / q

# Interpretation:
# OPE = -1.5 means 1% price increase → 1.5% demand decrease
# |OPE| > 1: Elastic (price-sensitive)
# |OPE| < 1: Inelastic (not price-sensitive)
# |OPE| = 1: Unit elastic
```

**💡 EXAM TIP**: If |OPE| is close to 0 (like -0.3), demand is INELASTIC - can raise prices!

---

## 5. COMMON PATTERNS & WORKFLOWS

### Pattern 1: Count & Summarize

```r
# How many listings per metro in 2019-Q1?
airbnb %>%
  filter(yrqtr == "2019-1") %>%
  group_by(metro) %>%
  summarize(nListings = n()) %>%
  arrange(desc(nListings))
```

### Pattern 2: Calculate Percentages

```r
# Percentage of each room type
airbnb %>%
  group_by(room_type) %>%
  summarize(count = n()) %>%
  mutate(total = sum(count)) %>%
  mutate(percentage = count / total * 100)
```

### Pattern 3: Filter to IQR (Remove Outliers)

```r
airbnb %>%
  filter(
    price >= quantile(price, 0.25),
    price <= quantile(price, 0.75)
  )
```

### Pattern 4: Demand Calculation (From Sessions)

```r
airbnb %>%
  # Assumptions: 50% review response rate, 3-night stays, max 70% occupancy
  mutate(bookings = number_of_reviews_ltm * 2 / 4) %>%
  mutate(nights_booked = if_else(bookings * 3 > 63, 63, bookings * 3))
```

### Pattern 5: Plot with Trend Line

```r
ggplot(data, aes(x = price, y = demand)) +
  geom_point() +
  geom_smooth(method = "lm", se = FALSE) +
  scale_y_log10(labels = comma) +
  labs(title = "Demand Function", x = "Price", y = "Demand")
```

### Pattern 6: Regression → Prediction → Elasticity

```r
# 1. Run regression
model <- lm(demand ~ price, data = demand_data)

# 2. Get coefficients
slope <- coef(model)[2]

# 3. Predict at median price
p <- median(demand_data$price)
q <- predict(model, tibble(price = p))

# 4. Calculate elasticity
elasticity <- slope * p / q
```

---

## 6. QUICK REFERENCE CHEAT SHEET

### dplyr Verbs
| Function | Purpose | Example |
|----------|---------|---------|
| `filter()` | Keep rows | `filter(year == 2021)` |
| `select()` | Keep columns | `select(metro, price)` |
| `mutate()` | Create columns | `mutate(new = old * 2)` |
| `group_by()` | Group data | `group_by(metro)` |
| `summarize()` | Aggregate | `summarize(avg = mean(price))` |
| `arrange()` | Sort | `arrange(desc(price))` |

### Summary Functions
| Function | Output |
|----------|--------|
| `n()` | Count rows |
| `mean()` | Average |
| `median()` | Median |
| `sum()` | Total |
| `min()` | Minimum |
| `max()` | Maximum |
| `sd()` | Standard deviation |
| `n_distinct()` | Count unique |

### ggplot2 Geoms
| Geom | Plot Type |
|------|-----------|
| `geom_point()` | Scatter plot |
| `geom_line()` | Line plot |
| `geom_col()` | Bar chart |
| `geom_smooth()` | Trend line |

### Regression
```r
# Run model
model <- lm(y ~ x1 + x2, data = df)

# View results
summary(model)

# Get coefficients
coef(model)

# Predict
predict(model, new_data)
```

---

## 7. PRACTICE PROBLEMS WITH SOLUTIONS

### Problem 1: Data Transformation
**Question**: Using the Austin subset from 2021, what percentage of listings are each room_type?

**Solution**:
```r
airbnb %>%
  filter(year == 2021, metro == "Austin") %>%
  group_by(room_type) %>%
  summarize(count = n()) %>%
  mutate(total = sum(count)) %>%
  mutate(percentage = count / total * 100) %>%
  arrange(desc(percentage))
```

### Problem 2: Visualization
**Question**: Create a scatter plot showing price vs. demand for Austin in 2021, with a trend line.

**Solution**:
```r
austin_2021 <- airbnb %>%
  filter(year == 2021, metro == "Austin") %>%
  mutate(bookings = number_of_reviews_ltm * 2 / 4) %>%
  mutate(nights_booked = if_else(bookings * 3 > 63, 63, bookings * 3)) %>%
  filter(price >= quantile(price, 0.25), price <= quantile(price, 0.75)) %>%
  group_by(price) %>%
  summarize(demand = sum(nights_booked))

ggplot(austin_2021, aes(x = price, y = demand)) +
  geom_point() +
  geom_smooth(method = "lm", se = FALSE) +
  labs(title = "Austin Demand Function 2021",
       x = "Price ($)",
       y = "Nights Booked") +
  scale_y_log10(labels = comma)
```

### Problem 3: Regression
**Question**: For Austin 2021, calculate the own-price elasticity at the median price.

**Solution**:
```r
# Filter to Austin 2021 IQR
austin_2021_iqr <- airbnb %>%
  filter(year == 2021, metro == "Austin") %>%
  mutate(bookings = number_of_reviews_ltm * 2 / 4) %>%
  mutate(nights_booked = if_else(bookings * 3 > 63, 63, bookings * 3)) %>%
  filter(
    price >= quantile(price, 0.25),
    price <= quantile(price, 0.75)
  ) %>%
  group_by(price) %>%
  summarize(demand = sum(nights_booked))

# Run regression
model <- lm(demand ~ price, data = austin_2021_iqr)

# Extract slope
dQ_dP <- coef(model)[2]

# Get median price
p <- median(austin_2021_iqr$price)

# Predict demand at median price
q <- predict(model, tibble(price = p))

# Calculate OPE
ope <- dQ_dP * p / q
print(paste("OPE =", round(ope, 3)))
```

### Problem 4: Multi-step Analysis
**Question**: Which metro had the largest percentage change in unique hosts from 2019-Q4 to 2021-Q4?

**Solution**:
```r
hosts_change <- airbnb %>%
  filter(yrqtr %in% c("2019-4", "2021-4")) %>%
  group_by(metro, yrqtr) %>%
  summarize(unique_hosts = n_distinct(host_id)) %>%
  pivot_wider(names_from = yrqtr, values_from = unique_hosts) %>%
  mutate(pct_change = (`2021-4` - `2019-4`) / `2019-4` * 100) %>%
  arrange(desc(pct_change))

# View results
print(hosts_change)

# Plot
ggplot(hosts_change, aes(x = reorder(metro, pct_change), y = pct_change)) +
  geom_col() +
  geom_text(aes(label = sprintf("%.1f%%", pct_change)),
            hjust = ifelse(pct_change < 0, 1.1, -0.1)) +
  coord_flip() +
  labs(title = "Percentage Change in Unique Hosts (2019-Q4 to 2021-Q4)",
       x = "Metro Area",
       y = "Percent Change")
```

---

## 8. EXAM TIPS & COMMON ERRORS

### Top 10 Most Common Mistakes

#### 1. **Using `=` instead of `==` for comparison**
```r
# WRONG
filter(year = 2021)

# CORRECT
filter(year == 2021)
```

#### 2. **Forgetting to load packages**
```r
# WRONG (will error if dplyr not loaded)
airbnb %>% filter(year == 2021)

# CORRECT
library(dplyr)
airbnb %>% filter(year == 2021)
```

#### 3. **Using `summarize()` without `group_by()`**
```r
# This gives ONE total for entire dataset
airbnb %>%
  summarize(total = n())

# Usually you want totals BY GROUP
airbnb %>%
  group_by(metro) %>%
  summarize(total = n())
```

#### 4. **Overwriting data when you meant to create new object**
```r
# WRONG - overwrites original data
airbnb <- airbnb %>% filter(year == 2021)

# CORRECT - creates new object
airbnb_2021 <- airbnb %>% filter(year == 2021)
```

#### 5. **Not using quotes for categorical values**
```r
# WRONG
filter(metro == LA)

# CORRECT
filter(metro == "LA")
```

#### 6. **Forgetting `aes()` in ggplot**
```r
# WRONG
ggplot(data, x = price, y = demand)

# CORRECT
ggplot(data, aes(x = price, y = demand))
```

#### 7. **Using `geom_bar()` instead of `geom_col()`**
```r
# geom_bar() counts observations (no y aesthetic needed)
ggplot(data, aes(x = metro)) +
  geom_bar()

# geom_col() uses actual y values
ggplot(data, aes(x = metro, y = count)) +
  geom_col()
```

#### 8. **Regression formula backwards**
```r
# WRONG
lm(price ~ demand)  # This predicts price from demand

# CORRECT (usually)
lm(demand ~ price)  # This predicts demand from price
```

#### 9. **Not handling missing values**
```r
# Will error if NAs present
mean(airbnb$price)

# Correct
mean(airbnb$price, na.rm = TRUE)
```

#### 10. **Using pipes without continuation**
```r
# WRONG - each line runs separately
airbnb %>%
filter(year == 2021)
group_by(metro)

# CORRECT - one continuous pipe
airbnb %>%
  filter(year == 2021) %>%
  group_by(metro)
```

### Exam Strategy Tips

1. **Read the question TWICE** before coding
2. **Start with the data frame** - what are you starting with?
3. **Work step-by-step** - use pipes to think "then what?"
4. **Test intermediate steps** - run parts of your pipe to check
5. **Check your output** - does the number make sense?
6. **Use `head()` and `str()`** frequently to understand data
7. **Save intermediate results** if you need to use them multiple times

### Quick Debugging Checklist

When code errors:
- [ ] Did you load all packages?
- [ ] Did you spell variable names correctly? (case-sensitive!)
- [ ] Did you use `==` not `=` for comparisons?
- [ ] Did you put quotes around text values?
- [ ] Did you close all parentheses?
- [ ] Did you include `aes()` in ggplot?
- [ ] Did you use `+` for ggplot (not `%>%`)?

### Time Management

- **Easy questions first** - build confidence
- **Comment your code** - helps you think through logic
- **Don't spend >5 min stuck** - move on and come back
- **Check your work** - if time permits, re-run code

---

## FORMULAS TO MEMORIZE

### Elasticity
```
OPE = (dQ/dP) × (P/Q)

Where:
- dQ/dP = slope from regression (coefficient on price)
- P = price point (usually median)
- Q = predicted quantity at that price
```

### Percentage Change
```
% Change = (New - Old) / Old × 100
```

### IQR Bounds
```
Lower bound = Q1 = quantile(x, 0.25)
Upper bound = Q3 = quantile(x, 0.75)
```

---

## FINAL EXAM CHECKLIST

**Before the exam:**
- [ ] Review all three sessions' code
- [ ] Practice writing code from scratch (not just reading)
- [ ] Understand the GROUP PROJECT regression thoroughly
- [ ] Know how to interpret regression output
- [ ] Practice calculating OPE
- [ ] Know the difference between `geom_bar()` and `geom_col()`
- [ ] Understand when to use `group_by()`
- [ ] Know how to filter to IQR

**During the exam:**
- [ ] Read instructions completely
- [ ] Check what dataset to use
- [ ] Write clean, commented code
- [ ] Test your code as you go
- [ ] Interpret your results (don't just show numbers)
- [ ] Check for reasonableness (e.g., negative demand doesn't make sense)

---

## GOOD LUCK! 🎯

**Remember**:
- R is case-sensitive
- Pipes (`%>%`) make code readable
- Always `group_by()` before `summarize()`
- Use `+` for ggplot, `%>%` for dplyr
- Check your output - does it make sense?

**You've got this!** 🚀
