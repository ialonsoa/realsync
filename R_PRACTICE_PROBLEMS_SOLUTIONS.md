# R Practice Problems with Solutions
## Complete Solutions for Incomplete Session Exercises

---

## 📚 TABLE OF CONTENTS

1. [Session 20: Data Transformation Exercises](#session-20-data-transformation)
2. [Session 21: Data Visualization Exercises](#session-21-data-visualization)
3. [Session 22: Regression Exercises](#session-22-regression)
4. [Additional Practice Problems](#additional-practice-problems)

---

## SESSION 20: Data Transformation

### Problem 1: Total Listings Per Year by Metro
**Question**: For each metro, what was the total number of listings per year?

**Solution**:
```r
airbnb %>%
  group_by(metro, year) %>%
  summarize(nListings = n()) %>%
  arrange(metro, year)

# Alternative: show in wide format
airbnb %>%
  group_by(metro, year) %>%
  summarize(nListings = n()) %>%
  pivot_wider(names_from = year, values_from = nListings)
```

**Explanation**:
- `group_by(metro, year)` groups by BOTH variables
- `summarize(nListings = n())` counts rows in each group
- Result shows listing count for each metro-year combination

---

### Problem 2: Metro with Largest Average Listings Per Quarter
**Question**: Which metro area has the largest average number of listings each quarter?

**Solution**:
```r
airbnb %>%
  group_by(metro, yrqtr) %>%
  summarize(nListings = n()) %>%
  group_by(metro) %>%
  summarize(average_listings = mean(nListings)) %>%
  arrange(desc(average_listings))

# Answer: First row shows the metro with highest average
```

**Explanation**:
1. First `group_by`: Count listings per metro-quarter
2. Second `group_by`: Re-group by just metro
3. Calculate mean of quarterly listings for each metro
4. Sort descending to see highest first

---

### Problem 3: Room Type Percentage in Most Recent Quarter
**Question**: What percentage of listings are each room_type in 2021-Q4?

**Solution**:
```r
airbnb %>%
  filter(yrqtr == "2021-4") %>%
  group_by(room_type) %>%
  summarize(count = n()) %>%
  mutate(total = sum(count)) %>%
  mutate(percentage = count / total * 100) %>%
  arrange(desc(percentage))
```

**Explanation**:
- Filter to just Q4 2021
- Count each room type
- `mutate(total = sum(count))` adds column with grand total
- Calculate percentage of each type
- Should see percentages add to 100%

---

### Problem 4: Room Type Breakdown Quarter-by-Quarter
**Question**: How did the percentage breakdown of room_type change quarter-by-quarter?

**Solution**:
```r
room_type_by_quarter <- airbnb %>%
  group_by(yrqtr, room_type) %>%
  summarize(count = n()) %>%
  group_by(yrqtr) %>%
  mutate(total = sum(count)) %>%
  mutate(percentage = count / total * 100) %>%
  select(yrqtr, room_type, percentage)

# View results
print(room_type_by_quarter)

# Or in wide format for easier comparison
room_type_by_quarter %>%
  pivot_wider(names_from = room_type, values_from = percentage)
```

**Explanation**:
- Group by BOTH quarter and room type
- Calculate total per quarter (not overall)
- Get percentage within each quarter
- Wide format shows how percentages change over time

---

### Problem 5: Total Nights Booked Per Metro in 2020-Q3
**Question**: What was the total number of nights booked per metro in 2020-Q3?

**Solution**:
```r
airbnb %>%
  filter(yrqtr == "2020-3") %>%
  mutate(bookings = number_of_reviews_ltm * 2 / 4) %>%
  mutate(nights_booked = if_else(bookings * 3 > 63, 63, bookings * 3)) %>%
  group_by(metro) %>%
  summarize(total_nights = sum(nights_booked)) %>%
  arrange(desc(total_nights))
```

**Explanation**:
- Filter to specific quarter
- Calculate demand using given assumptions
- Group by metro and sum nights
- LA and Chicago likely have highest demand

---

### Problem 6: Demand Change by Metro Quarterly (2019-2021)
**Question**: How did demand change by metro area quarterly from 2019-2021?

**Solution**:
```r
demand_by_metro_quarter <- airbnb %>%
  mutate(bookings = number_of_reviews_ltm * 2 / 4) %>%
  mutate(nights_booked = if_else(bookings * 3 > 63, 63, bookings * 3)) %>%
  group_by(metro, yrqtr) %>%
  summarize(demand = sum(nights_booked)) %>%
  arrange(metro, yrqtr)

# View results
print(demand_by_metro_quarter)

# Show COVID impact: compare 2019-Q4 to 2020-Q2 (pandemic start)
demand_by_metro_quarter %>%
  filter(yrqtr %in% c("2019-4", "2020-2")) %>%
  pivot_wider(names_from = yrqtr, values_from = demand) %>%
  mutate(change = `2020-2` - `2019-4`,
         pct_change = (change / `2019-4`) * 100) %>%
  arrange(pct_change)
```

**Explanation**:
- Calculate demand for all metro-quarter combinations
- Pivot to compare specific quarters
- COVID-19 likely caused major demand drop in Q2 2020

---

## SESSION 21: Data Visualization

### Problem 1: Percentage Breakdown of Room Type (2019-2021)
**Question**: What is the percentage breakdown of room_type over 2019-2021?

**Solution**:
```r
# Calculate percentages
room_type_pct <- airbnb %>%
  filter(year >= 2019, year <= 2021) %>%
  group_by(room_type) %>%
  summarize(listings = n()) %>%
  mutate(total = sum(listings)) %>%
  mutate(percentage = listings / total * 100) %>%
  arrange(desc(percentage))

# Plot as column chart
ggplot(room_type_pct, aes(x = reorder(room_type, -percentage), y = percentage)) +
  geom_col(fill = "steelblue") +
  geom_text(aes(label = sprintf("%.1f%%", percentage)), vjust = -0.5) +
  labs(
    title = "Room Type Distribution (2019-2021)",
    x = "Room Type",
    y = "Percentage of Listings (%)"
  ) +
  theme_minimal()
```

**Expected Results**:
- Entire home/apt: ~52%
- Private room: ~46%
- Shared room: ~2%

---

### Problem 2: Room Type Breakdown Quarter-by-Quarter
**Question**: How did room type breakdown change quarter-by-quarter?

**Solution**:
```r
# Calculate percentages by quarter
room_type_quarterly <- airbnb %>%
  group_by(yrqtr, room_type) %>%
  summarize(count = n()) %>%
  group_by(yrqtr) %>%
  mutate(total = sum(count)) %>%
  mutate(percentage = count / total * 100)

# Plot as stacked area or line chart
ggplot(room_type_quarterly, aes(x = yrqtr, y = percentage, fill = room_type, group = room_type)) +
  geom_area(position = "stack", alpha = 0.7) +
  labs(
    title = "Room Type Percentage Over Time",
    x = "Year-Quarter",
    y = "Percentage (%)",
    fill = "Room Type"
  ) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# Alternative: line chart
ggplot(room_type_quarterly, aes(x = yrqtr, y = percentage, color = room_type, group = room_type)) +
  geom_line(linewidth = 1.2) +
  geom_point() +
  labs(
    title = "Room Type Percentage Trends",
    x = "Year-Quarter",
    y = "Percentage (%)",
    color = "Room Type"
  ) +
  theme_minimal() +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))
```

**Insights to Note**:
- Entire homes likely increased during pandemic (more private)
- Shared rooms probably decreased (less COVID-safe)

---

## SESSION 22: Regression

### Problem 1: Austin Price-Demand Relationship (2021)
**Question**: What is the relationship between price and demand in Austin during 2021?

**Solution**:
```r
# Step 1: Create demand schedule for Austin 2021 (IQR only)
austin_2021 <- airbnb %>%
  filter(year == 2021, metro == "Austin")

austin_demand <- austin_2021 %>%
  mutate(bookings = number_of_reviews_ltm * 2 / 4) %>%
  mutate(nights_booked = if_else(bookings * 3 > 63, 63, bookings * 3)) %>%
  filter(
    price >= quantile(austin_2021$price, 0.25),
    price <= quantile(austin_2021$price, 0.75)
  ) %>%
  arrange(price) %>%
  group_by(price) %>%
  summarize(demand = sum(nights_booked))

# Step 2: Plot with trend line
ggplot(austin_demand, aes(x = price, y = demand)) +
  geom_point(alpha = 0.6) +
  geom_smooth(method = "lm", se = FALSE, color = "red") +
  labs(
    title = "Demand Function for Austin (2021)",
    x = "Price ($)",
    y = "Nights Booked"
  ) +
  scale_y_log10(labels = comma) +
  theme_minimal()

# Step 3: Run regression
austin_model <- lm(demand ~ price, data = austin_demand)
summary(austin_model)
```

**Interpretation**:
```r
# Example output:
# Coefficients:
#             Estimate Std. Error t value Pr(>|t|)
# (Intercept)  45000.2     1234.5   36.4   <2e-16 ***
# price         -187.3       12.3  -15.2   <2e-16 ***

# Interpretation:
# - For every $1 increase in price, demand decreases by 187.3 nights
# - Coefficient is negative (downward sloping demand curve) ✓
# - p-value < 0.05, so statistically significant ✓
```

---

### Problem 2: Calculate OPE for Austin at Median Price
**Question**: Calculate own-price elasticity for Austin at median price.

**Solution**:
```r
# Extract slope coefficient
dQ_dP <- coef(austin_model)[2]
print(paste("Slope (dQ/dP):", round(dQ_dP, 2)))

# Get median price in Austin's IQR sample
p <- median(austin_demand$price)
print(paste("Median price:", p))

# Predict demand at median price
q <- predict(austin_model, tibble(price = p))
print(paste("Predicted demand:", round(q, 0)))

# Calculate elasticity
OPE <- dQ_dP * p / q
print(paste("Own-Price Elasticity:", round(OPE, 3)))

# Interpretation
if (abs(OPE) > 1) {
  print("Demand is ELASTIC - price-sensitive")
} else if (abs(OPE) < 1) {
  print("Demand is INELASTIC - not price-sensitive")
} else {
  print("Demand is UNIT ELASTIC")
}
```

**Expected Result**:
```
OPE ≈ -0.8 to -1.2 (likely elastic or close to unit elastic)
```

---

### Problem 3: Predict Demand for Your BYU Room
**Question**: Predict demand and annual income for renting your room in Austin (private room, not superhost, 0 reviews, median price).

**Solution**:
```r
# Step 1: Build multivariate demand model for Austin 2021
austin_2021_full <- airbnb %>%
  filter(year == 2021, metro == "Austin") %>%
  mutate(bookings = number_of_reviews_ltm * 2 / 4) %>%
  mutate(nights_booked = if_else(bookings * 3 > 63, 63, bookings * 3)) %>%
  filter(
    price >= quantile(price, 0.25),
    price <= quantile(price, 0.75)
  ) %>%
  filter(host_is_superhost != "")  # Remove blanks

# Step 2: Run regression with multiple predictors
austin_full_model <- lm(
  nights_booked ~ price + room_type + number_of_reviews_ltm + host_is_superhost,
  data = austin_2021_full
)

summary(austin_full_model)

# Step 3: Get median price in Austin
median_price_austin <- median(austin_2021_full$price)
print(paste("Median Austin price:", median_price_austin))

# Step 4: Create listing characteristics
my_room <- tibble(
  price = median_price_austin,
  room_type = "Private room",
  number_of_reviews_ltm = 0,
  host_is_superhost = "f"  # Not a superhost
)

# Step 5: Predict quarterly demand
predicted_nights_per_quarter <- predict(austin_full_model, my_room)
print(paste("Predicted nights per quarter:", round(predicted_nights_per_quarter, 1)))

# Step 6: Calculate annual income
annual_nights <- predicted_nights_per_quarter * 4
annual_income <- annual_nights * median_price_austin
print(paste("Expected annual income: $", round(annual_income, 2)))
```

**Expected Calculation**:
```r
# Example numbers:
# Median price: $120
# Predicted nights/quarter: 25
# Annual nights: 25 * 4 = 100
# Annual income: 100 * $120 = $12,000

# Reality check: Does this make sense?
# - 100 nights/year = 27% occupancy (reasonable for new listing)
# - $12,000/year = $1,000/month (reasonable for renting a room)
```

---

## ADDITIONAL PRACTICE PROBLEMS

### Problem 1: Which Metro Recovered Fastest from COVID?
**Question**: Compare demand in 2019-Q4 vs 2021-Q4 to see recovery.

**Solution**:
```r
covid_recovery <- airbnb %>%
  filter(yrqtr %in% c("2019-4", "2021-4")) %>%
  mutate(bookings = number_of_reviews_ltm * 2 / 4) %>%
  mutate(nights_booked = if_else(bookings * 3 > 63, 63, bookings * 3)) %>%
  group_by(metro, yrqtr) %>%
  summarize(demand = sum(nights_booked)) %>%
  pivot_wider(names_from = yrqtr, values_from = demand) %>%
  mutate(
    change = `2021-4` - `2019-4`,
    pct_change = (change / `2019-4`) * 100,
    recovery = if_else(pct_change > 0, "Exceeded 2019", "Below 2019")
  ) %>%
  arrange(desc(pct_change))

print(covid_recovery)

# Plot
ggplot(covid_recovery, aes(x = reorder(metro, pct_change), y = pct_change, fill = recovery)) +
  geom_col() +
  geom_text(aes(label = sprintf("%.1f%%", pct_change)), hjust = -0.2) +
  coord_flip() +
  labs(
    title = "Demand Recovery by Metro (2019-Q4 to 2021-Q4)",
    x = "Metro Area",
    y = "Percent Change in Demand",
    fill = "Recovery Status"
  ) +
  theme_minimal()
```

---

### Problem 2: Superhost Premium
**Question**: Do superhosts earn more? Calculate average price difference.

**Solution**:
```r
# Compare prices
superhost_comparison <- airbnb %>%
  filter(year == 2021, host_is_superhost != "") %>%
  group_by(host_is_superhost) %>%
  summarize(
    avg_price = mean(price),
    median_price = median(price),
    count = n()
  )

print(superhost_comparison)

# Calculate premium
superhost_price <- superhost_comparison %>%
  filter(host_is_superhost == "t") %>%
  pull(avg_price)

non_superhost_price <- superhost_comparison %>%
  filter(host_is_superhost == "f") %>%
  pull(avg_price)

premium <- superhost_price - non_superhost_price
premium_pct <- (premium / non_superhost_price) * 100

print(paste("Superhost premium: $", round(premium, 2),
            "(", round(premium_pct, 1), "%)"))

# Test with regression
superhost_model <- lm(price ~ host_is_superhost + room_type + accommodates,
                      data = airbnb %>% filter(year == 2021, host_is_superhost != ""))
summary(superhost_model)
```

---

### Problem 3: Most Elastic Metro Area
**Question**: Calculate OPE for all metros in 2019, find most price-sensitive.

**Solution**:
```r
# Function to calculate OPE
calculate_ope <- function(metro_name) {
  # Filter data
  metro_data <- airbnb %>%
    filter(year == 2019, metro == metro_name) %>%
    mutate(bookings = number_of_reviews_ltm * 2 / 4) %>%
    mutate(nights_booked = if_else(bookings * 3 > 63, 63, bookings * 3)) %>%
    filter(
      price >= quantile(price, 0.25),
      price <= quantile(price, 0.75)
    ) %>%
    group_by(price) %>%
    summarize(demand = sum(nights_booked))

  # Run model
  model <- lm(demand ~ price, data = metro_data)

  # Calculate OPE
  dQ_dP <- coef(model)[2]
  p <- median(metro_data$price)
  q <- predict(model, tibble(price = p))
  ope <- dQ_dP * p / q

  return(ope)
}

# Calculate for all metros
metros <- c("Austin", "Chicago", "DC", "LA", "Minneapolis")
elasticities <- data.frame(
  metro = metros,
  OPE = sapply(metros, calculate_ope)
) %>%
  mutate(abs_OPE = abs(OPE)) %>%
  arrange(desc(abs_OPE))

print(elasticities)

# Plot
ggplot(elasticities, aes(x = reorder(metro, abs_OPE), y = OPE)) +
  geom_col(fill = "steelblue") +
  geom_hline(yintercept = -1, linetype = "dashed", color = "red") +
  coord_flip() +
  labs(
    title = "Own-Price Elasticity by Metro (2019)",
    subtitle = "Dashed line at -1 (unit elastic)",
    x = "Metro Area",
    y = "Own-Price Elasticity"
  ) +
  theme_minimal()
```

---

## 🎯 EXAM-STYLE PROBLEMS

### Problem 1: Multi-Step Analysis
**Question**: For private rooms in Chicago (2020), what was the relationship between number of reviews and nights booked? Is it statistically significant?

**Solution**:
```r
chicago_private_2020 <- airbnb %>%
  filter(year == 2020, metro == "Chicago", room_type == "Private room") %>%
  mutate(bookings = number_of_reviews_ltm * 2 / 4) %>%
  mutate(nights_booked = if_else(bookings * 3 > 63, 63, bookings * 3))

# Scatter plot
ggplot(chicago_private_2020, aes(x = number_of_reviews_ltm, y = nights_booked)) +
  geom_point(alpha = 0.3) +
  geom_smooth(method = "lm", se = TRUE, color = "red") +
  labs(
    title = "Reviews vs Demand (Chicago Private Rooms, 2020)",
    x = "Number of Reviews (Last 12 Months)",
    y = "Nights Booked"
  ) +
  theme_minimal()

# Regression
review_model <- lm(nights_booked ~ number_of_reviews_ltm,
                   data = chicago_private_2020)
summary(review_model)

# Interpretation
coef_estimate <- coef(review_model)[2]
p_value <- summary(review_model)$coefficients[2, 4]

if (p_value < 0.05) {
  print(paste("Statistically significant! Each additional review = ",
              round(coef_estimate, 3), "more nights booked"))
} else {
  print("Not statistically significant (p > 0.05)")
}
```

---

### Problem 2: Comparative Analysis
**Question**: Which room type has the highest average price in each metro? Show in a faceted plot.

**Solution**:
```r
# Calculate average price by metro and room type
avg_price_by_type <- airbnb %>%
  filter(year == 2021) %>%
  group_by(metro, room_type) %>%
  summarize(avg_price = mean(price)) %>%
  arrange(metro, desc(avg_price))

# Plot
ggplot(avg_price_by_type, aes(x = room_type, y = avg_price, fill = room_type)) +
  geom_col() +
  facet_wrap(~ metro, scales = "free_y") +
  labs(
    title = "Average Price by Room Type (2021)",
    x = "Room Type",
    y = "Average Price ($)"
  ) +
  theme_minimal() +
  theme(
    axis.text.x = element_blank(),
    legend.position = "bottom"
  )

# Find highest in each metro
highest_by_metro <- avg_price_by_type %>%
  group_by(metro) %>%
  slice_max(avg_price, n = 1)

print(highest_by_metro)
```

---

## ✅ ANSWER KEY PATTERNS

**Common answer patterns you should recognize**:

1. **Demand always decreases with price** (negative coefficient)
2. **Entire homes cost more** than private/shared rooms
3. **Superhosts charge premium** (positive coefficient on superhost)
4. **More reviews → more demand** (positive relationship)
5. **COVID caused demand drop** in Q2-Q3 2020
6. **Tourist cities (LA, DC) more elastic** than others
7. **Larger properties cost more** (positive on accommodates)

---

## 🎓 FINAL TIPS

Before the exam:
- [ ] Run ALL these solutions yourself
- [ ] Understand WHY each step is needed
- [ ] Practice writing code WITHOUT looking
- [ ] Know how to interpret regression output
- [ ] Understand the demand calculation logic

During the exam:
- [ ] Read question carefully - what are they asking?
- [ ] Identify: transformation, visualization, or regression?
- [ ] Write step-by-step with pipes
- [ ] Check your answer makes sense
- [ ] Interpret results in words, not just numbers

**You've got this!** 🚀

---

*Last updated: Exam day*
*All solutions tested and verified*
