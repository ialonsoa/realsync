# APIs You're Already Using in RealSync

You asked about APIs - **you're already using them!** Let me show you exactly where.

---

## 1. Supabase Database API

### Where: Tax Estimator (`EstimatorPage.tsx`)

**The Code:**
```typescript
const { data, error } = await supabase
  .from('estimator_calculations')
  .insert([{
    user_id: user.id,
    property_value: propertyValueNum,
    buyer_costs: buyerCosts,
    // ...
  }])
  .select();
```

### What Happens Behind the Scenes:

```
Step 1: User clicks "Calcular Impuestos"
   ↓
Step 2: Your React App prepares data
   {
     user_id: "abc-123",
     property_value: 450000,
     buyer_costs: 15000,
     ...
   }
   ↓
Step 3: Supabase Client sends HTTP REQUEST to Supabase API
   POST https://rydykhjvgfoqnxkjugzr.supabase.co/rest/v1/estimator_calculations
   Headers: {
     apikey: "eyJhbGc...",
     Authorization: "Bearer <user-token>"
   }
   Body: { user_id: "abc-123", property_value: 450000, ... }
   ↓
Step 4: Supabase Server receives request
   - Validates the API key ✅
   - Checks user authentication ✅
   - Verifies RLS policies (can this user insert?) ✅
   - Validates data types ✅
   ↓
Step 5: Supabase inserts into PostgreSQL database
   INSERT INTO estimator_calculations (user_id, property_value, ...)
   VALUES ('abc-123', 450000, ...);
   ↓
Step 6: Database returns the saved record
   { id: "xyz-789", user_id: "abc-123", property_value: 450000, ... }
   ↓
Step 7: Supabase API sends RESPONSE back to your app
   Status: 200 OK
   Body: { data: [...], error: null }
   ↓
Step 8: Your React app receives response
   if (error) → Show error message
   else → Show "✓ Cálculo guardado exitosamente"
```

### This is a REST API!

**REST API = Representational State Transfer API**

It uses HTTP methods:
- `POST` = Create new data (INSERT)
- `GET` = Read data (SELECT)
- `PATCH` = Update data (UPDATE)
- `DELETE` = Delete data (DELETE)

---

## 2. Supabase Authentication API

### Where: Login Page (`LoginPage.tsx`)

**The Code:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

### API Flow:

```
User enters email/password
   ↓
Your App → Supabase Auth API
   POST https://rydykhjvgfoqnxkjugzr.supabase.co/auth/v1/token
   Body: {
     email: "user@example.com",
     password: "******",
     grant_type: "password"
   }
   ↓
Supabase Auth Server:
   1. Hashes password
   2. Checks against database
   3. If valid → Creates JWT token
   ↓
Response → Your App
   {
     access_token: "eyJhbGciOiJIUzI1NiIs...",
     user: { id: "abc-123", email: "user@example.com" }
   }
   ↓
Your app stores token
   - Used for all future API calls
   - Proves user is authenticated
```

### What's a JWT Token?

**JWT = JSON Web Token**

It's like a digital ID card:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VyX2lkIjoiYWJjLTEyMyIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSJ9.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Part 1: Header (algorithm)
Part 2: Payload (user data)
Part 3: Signature (security)
```

Every API request includes this token to prove "I'm logged in!"

---

## 3. Stripe API

### Where: Pricing Page (`PricingPage.tsx`)

**The Code:**
```typescript
import { loadStripe } from '@stripe/stripe-js';
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
```

### How It Would Work in Production:

```
User clicks "Actualizar a Pro"
   ↓
Your Frontend → Your Backend
   POST /api/create-checkout-session
   Body: { priceId: "price_pro_monthly" }
   ↓
Your Backend → Stripe API
   POST https://api.stripe.com/v1/checkout/sessions
   Headers: {
     Authorization: "Bearer sk_live_..."
   }
   Body: {
     price: "price_pro_monthly",
     success_url: "https://realsync.pe/success",
     cancel_url: "https://realsync.pe/pricing"
   }
   ↓
Stripe creates checkout session
   Returns: { id: "cs_test_abc123", url: "https://checkout.stripe.com/..." }
   ↓
Your Backend → Your Frontend
   Returns: { sessionId: "cs_test_abc123" }
   ↓
Your Frontend redirects user to Stripe
   window.location.href = "https://checkout.stripe.com/..."
   ↓
User enters payment info on Stripe
   (Secure, PCI-compliant payment page)
   ↓
After payment → Stripe sends webhook to your backend
   POST https://realsync.pe/api/webhooks/stripe
   Body: { type: "checkout.session.completed", ... }
   ↓
Your Backend updates database
   UPDATE user_profiles
   SET subscription_tier = 'pro'
   WHERE id = 'abc-123';
   ↓
User redirected back to your app
   Shows: "✓ Subscription activated!"
```

---

## API Request Anatomy

Every API request has:

### 1. URL (Endpoint)
```
https://rydykhjvgfoqnxkjugzr.supabase.co/rest/v1/estimator_calculations
└─────────┬─────────┘ └──┬──┘ └────┬────┘ └──────────┬──────────┘
        Domain          API     Version      Resource
```

### 2. HTTP Method
- `GET` - Retrieve data
- `POST` - Create new data
- `PATCH` - Update existing data
- `DELETE` - Delete data

### 3. Headers (metadata)
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGci...",
  "apikey": "eyJhbGci..."
}
```

### 4. Body (data)
```javascript
{
  "user_id": "abc-123",
  "property_value": 450000,
  "buyer_costs": 15000
}
```

### 5. Response
```javascript
{
  "data": [{ id: "xyz", user_id: "abc-123", ... }],
  "error": null,
  "status": 200
}
```

---

## Real Example from Your Code

Let's trace ONE API call:

**File:** `frontend/web/src/pages/estimator/EstimatorPage.tsx`
**Line:** 53-71

```typescript
// 1. Prepare the request
const { data, error } = await supabase
  .from('estimator_calculations')  // Which table?
  .insert([{                        // What to do? (INSERT = POST)
    user_id: user.id,              // Data to send
    property_value: propertyValueNum,
    buyer_costs: buyerCosts,
    seller_costs: sellerCosts,
    total_costs: totalCosts,
    calculation_details: { ... }
  }])
  .select();                        // What to return?

// 2. Behind the scenes:
fetch('https://rydykhjvgfoqnxkjugzr.supabase.co/rest/v1/estimator_calculations', {
  method: 'POST',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIs...',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  },
  body: JSON.stringify({
    user_id: 'abc-123',
    property_value: 450000,
    buyer_costs: 15000,
    seller_costs: 27000,
    total_costs: 42000,
    calculation_details: { alcabala: 11550, ... }
  })
})

// 3. Supabase processes:
//    - Validates token ✅
//    - Checks RLS policy ✅
//    - Inserts into database ✅
//    - Returns saved data ✅

// 4. Response comes back:
{
  data: [{
    id: 'xyz-789',
    user_id: 'abc-123',
    property_value: 450000,
    created_at: '2025-01-07T...'
  }],
  error: null
}

// 5. Your code handles response:
if (error) {
  setSaveError(error.message);
} else {
  setSaveSuccess(true);  // Show "✓ Cálculo guardado exitosamente"
}
```

---

## Why Use APIs?

### Without APIs:
```
Your App ---- [Nothing] ---- External Service
❌ Can't communicate
```

### With APIs:
```
Your App ---- [API] ---- External Service
✅ Can send requests
✅ Can receive responses
✅ Can integrate features
```

### Benefits:

1. **Don't reinvent the wheel**
   - Use Google's maps instead of building your own
   - Use Stripe's payment instead of handling credit cards
   - Use Supabase's database instead of managing servers

2. **Security**
   - APIs handle sensitive operations securely
   - You never see credit card numbers (Stripe handles it)
   - Passwords are hashed server-side

3. **Scalability**
   - APIs are built to handle millions of requests
   - Google Maps serves billions of map loads
   - Stripe processes billions in transactions

4. **Updates**
   - API providers improve their service
   - You get improvements automatically
   - No need to update your code

---

## API Types You're Using

### 1. REST API (Supabase)
- Uses HTTP methods (GET, POST, PUT, DELETE)
- URL-based resources
- JSON data format
- Most common type

### 2. Client SDK (Stripe)
- Wrapper around REST API
- Easier to use
- Handles complexity for you

### 3. Authentication API (Supabase Auth)
- Specialized for login/signup
- Returns JWT tokens
- Manages sessions

---

## How to Learn More

### 1. Try the Google Maps Tutorial
- Follow `GOOGLE_MAPS_TUTORIAL.md`
- See how to add a new API

### 2. Read API Documentation
- Supabase: https://supabase.com/docs/reference/javascript
- Stripe: https://stripe.com/docs/api
- Any API you want to use

### 3. Practice
- Add currency conversion API
- Add weather API for property locations
- Add image optimization API

### 4. Inspect Network Requests
In Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Network" tab
3. Click "Calcular Impuestos" in your app
4. See the actual API request!

---

## Key Takeaways

✅ You're already using APIs (Supabase, Stripe)
✅ APIs are just HTTP requests and responses
✅ Every app uses external APIs
✅ APIs save time and money
✅ You can add more APIs anytime

**You're doing great!** APIs are fundamental to modern web development,
and you're already using them successfully! 🚀
