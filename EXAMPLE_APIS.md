# API Integration Examples for RealSync

## APIs You Can Add to Your Real Estate App

---

## 1. Google Maps API 🗺️

**Purpose:** Display properties on an interactive map

**Installation:**
```bash
npm install @react-google-maps/api
```

**Example Code:**
```typescript
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

export default function PropertyMap({ properties }) {
  const center = { lat: -12.0464, lng: -77.0428 }; // Lima, Peru

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        center={center}
        zoom={12}
        mapContainerStyle={{ width: '100%', height: '400px' }}
      >
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={{ lat: property.latitude, lng: property.longitude }}
            title={property.title}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
```

**API Request Flow:**
1. Your app requests map tiles from Google Maps API
2. Google returns map images
3. You add markers for your properties
4. Users can zoom, pan, click markers

**Cost:** Free up to 28,000 map loads/month

---

## 2. WhatsApp Business API 💬

**Purpose:** Send property alerts and chat with clients via WhatsApp

**Example Code:**
```typescript
// Using Twilio WhatsApp API
async function sendPropertyAlert(phoneNumber: string, property: Property) {
  const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + btoa('YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: 'whatsapp:+14155238886', // Twilio WhatsApp number
      To: `whatsapp:${phoneNumber}`,
      Body: `🏠 Nueva Propiedad: ${property.title}\n💰 Precio: S/ ${property.price.toLocaleString()}\n📍 ${property.address}\n\nVer más: ${property.url}`
    })
  });

  return response.json();
}
```

**Use Case in RealSync:**
- Send property alerts to buyers
- Notify agents of new inquiries
- Schedule property viewings

---

## 3. OpenAI API (ChatGPT) 🤖

**Purpose:** AI-powered property descriptions and customer support

**Example Code:**
```typescript
async function generatePropertyDescription(property: Property) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `Write an attractive property description for:
          - Type: ${property.property_type}
          - Location: ${property.address}, ${property.district}
          - Bedrooms: ${property.bedrooms}
          - Bathrooms: ${property.bathrooms}
          - Area: ${property.area_m2} m²
          - Price: S/ ${property.price}

          Make it compelling for potential buyers in Lima, Peru.`
      }]
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

**Use Cases:**
- Auto-generate property descriptions
- AI chatbot for customer questions
- Translate listings to English/other languages

---

## 4. Cloudinary API 📷

**Purpose:** Image optimization and transformation for property photos

**Installation:**
```bash
npm install cloudinary-react
```

**Example Code:**
```typescript
import { Image, Transformation } from 'cloudinary-react';

export default function PropertyImage({ publicId, alt }) {
  return (
    <Image
      cloudName="your-cloud-name"
      publicId={publicId}
      alt={alt}
    >
      <Transformation
        width="800"
        height="600"
        crop="fill"
        quality="auto"
        fetchFormat="auto"
      />
    </Image>
  );
}
```

**Benefits:**
- Automatic image optimization
- Responsive images for mobile
- Watermarks for property photos
- Fast CDN delivery

---

## 5. SendGrid API 📧

**Purpose:** Send professional emails (property alerts, contracts, notifications)

**Example Code:**
```typescript
async function sendPropertyNotification(email: string, property: Property) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email }],
        subject: `Nueva Propiedad en ${property.district}`
      }],
      from: { email: 'noreply@realsync.pe', name: 'RealSync' },
      content: [{
        type: 'text/html',
        value: `
          <h2>${property.title}</h2>
          <p><strong>Precio:</strong> S/ ${property.price.toLocaleString()}</p>
          <p><strong>Ubicación:</strong> ${property.address}</p>
          <img src="${property.image_url}" alt="${property.title}" />
          <a href="https://realsync.pe/property/${property.id}">Ver Propiedad</a>
        `
      }]
    })
  });

  return response.json();
}
```

---

## 6. Currency Exchange API 💱

**Purpose:** Convert prices to USD/EUR for international buyers

**Example Code (using exchangerate-api.com):**
```typescript
async function convertCurrency(amountInSoles: number, targetCurrency: string) {
  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/PEN`
  );

  const data = await response.json();
  const rate = data.rates[targetCurrency];

  return {
    original: amountInSoles,
    converted: amountInSoles * rate,
    currency: targetCurrency,
    rate
  };
}

// Usage in your property card:
const priceUSD = await convertCurrency(property.price, 'USD');
// Display: S/ 450,000 (~ $120,000 USD)
```

---

## 7. Government Data APIs 🏛️

**Purpose:** Real property data from Peruvian government

**SUNARP API (Peruvian Property Registry):**
```typescript
// This would require official access to SUNARP API
async function verifyPropertyOwnership(propertyId: string) {
  const response = await fetch(`https://api.sunarp.gob.pe/v1/property/${propertyId}`, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUNARP_API_KEY}`
    }
  });

  return response.json();
  // Returns: ownership history, liens, legal status
}
```

**SUNAT API (Tax Information):**
```typescript
async function getPropertyTaxHistory(propertyId: string) {
  // Get historical property tax data
  // Verify tax compliance
  // Show payment history to potential buyers
}
```

---

## How to Add an API to RealSync (Step by Step)

### Example: Adding Currency Conversion

**Step 1: Choose an API**
- Research: "currency exchange api free"
- Pick one: exchangerate-api.com (free tier)

**Step 2: Get API Key**
- Sign up at exchangerate-api.com
- Get your API key: `abc123xyz`

**Step 3: Add to Environment Variables**
```bash
# frontend/web/.env
VITE_EXCHANGE_RATE_API_KEY=abc123xyz
```

**Step 4: Create API Service File**
```typescript
// frontend/web/src/services/currencyService.ts
export async function convertPENtoUSD(amountPEN: number) {
  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/PEN`
    );
    const data = await response.json();
    return amountPEN * data.rates.USD;
  } catch (error) {
    console.error('Currency conversion failed:', error);
    return null;
  }
}
```

**Step 5: Use in Your Component**
```typescript
// In PropertyCard.tsx
import { convertPENtoUSD } from '@/services/currencyService';

const [priceUSD, setPriceUSD] = useState<number | null>(null);

useEffect(() => {
  convertPENtoUSD(property.price).then(setPriceUSD);
}, [property.price]);

// In JSX:
<p>S/ {property.price.toLocaleString()}</p>
{priceUSD && <p className="text-sm text-gray-500">(~ ${priceUSD.toLocaleString()} USD)</p>}
```

---

## API Best Practices ✅

### 1. Always Use Environment Variables
```typescript
// ✅ GOOD
const apiKey = import.meta.env.VITE_API_KEY;

// ❌ BAD (never hardcode keys!)
const apiKey = "abc123xyz";
```

### 2. Handle Errors Gracefully
```typescript
try {
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error('API request failed');
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Error:', error);
  // Show user-friendly message
  toast.error('No pudimos cargar los datos. Inténtalo de nuevo.');
  return null;
}
```

### 3. Add Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);

async function fetchData() {
  setIsLoading(true);
  try {
    const data = await apiCall();
    return data;
  } finally {
    setIsLoading(false);
  }
}
```

### 4. Cache Responses When Possible
```typescript
// Don't call the same API repeatedly
const cachedRates = localStorage.getItem('exchange_rates');
if (cachedRates) {
  return JSON.parse(cachedRates);
}
// Otherwise fetch fresh data
```

### 5. Respect Rate Limits
```typescript
// Many free APIs limit requests (e.g., 100/day)
// Cache results, don't spam the API
```

---

## Recommended APIs for RealSync

| API | Purpose | Cost | Priority |
|-----|---------|------|----------|
| Google Maps | Property locations | Free tier | HIGH |
| Cloudinary | Image optimization | Free tier | HIGH |
| SendGrid | Email notifications | Free tier | MEDIUM |
| Twilio WhatsApp | WhatsApp messaging | Pay per message | MEDIUM |
| OpenAI | AI descriptions | $0.002/request | LOW |
| Currency API | Price conversion | Free | LOW |

---

## Next Steps

1. Pick ONE API to start with (I recommend Google Maps)
2. Sign up and get API key
3. Follow the step-by-step guide above
4. Test it in development
5. Add more APIs gradually

Remember: Start small, test thoroughly, and add features incrementally!
