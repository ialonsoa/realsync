# Tutorial: Add Google Maps to RealSync

## What We'll Build
A map showing all properties with clickable markers - just like Zillow or Airbnb!

---

## Step 1: Get Google Maps API Key

### 1.1 Go to Google Cloud Console
Visit: https://console.cloud.google.com

### 1.2 Create a New Project
1. Click "Select Project" at the top
2. Click "New Project"
3. Name it: "RealSync Maps"
4. Click "Create"

### 1.3 Enable Google Maps JavaScript API
1. In the left sidebar, click "APIs & Services" → "Library"
2. Search for "Maps JavaScript API"
3. Click on it
4. Click "Enable"

### 1.4 Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy your API key (looks like: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx`)
4. Click "Restrict Key" (optional but recommended)
5. Under "API restrictions", select "Maps JavaScript API"

---

## Step 2: Install Required Packages

Open Terminal and run:

```bash
cd "/Users/alonsoincaroca/Realsync App V1/frontend/web"
npm install @react-google-maps/api
```

---

## Step 3: Add API Key to Environment Variables

Add to your `.env` file:

```bash
# Add this line
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ Replace with your actual API key!

---

## Step 4: Create MapComponent

Create a new file: `frontend/web/src/components/PropertyMap.tsx`

```typescript
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  latitude: number;
  longitude: number;
  image_url?: string;
}

interface PropertyMapProps {
  properties: Property[];
  onPropertyClick?: (property: Property) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const center = {
  lat: -12.0464, // Lima, Peru
  lng: -77.0428,
};

export default function PropertyMap({ properties, onPropertyClick }: PropertyMapProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        options={{
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        }}
      >
        {/* Property Markers */}
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={{
              lat: property.latitude,
              lng: property.longitude,
            }}
            onClick={() => setSelectedProperty(property)}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
              scaledSize: new window.google.maps.Size(40, 40),
            }}
          />
        ))}

        {/* Info Window (popup when clicking marker) */}
        {selectedProperty && (
          <InfoWindow
            position={{
              lat: selectedProperty.latitude,
              lng: selectedProperty.longitude,
            }}
            onCloseClick={() => setSelectedProperty(null)}
          >
            <div className="p-2 max-w-xs">
              {selectedProperty.image_url && (
                <img
                  src={selectedProperty.image_url}
                  alt={selectedProperty.title}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-semibold text-gray-900">
                {selectedProperty.title}
              </h3>
              <p className="text-sm text-gray-600">{selectedProperty.address}</p>
              <p className="text-lg font-bold text-primary-600 mt-1">
                S/ {selectedProperty.price.toLocaleString()}
              </p>
              <button
                onClick={() => onPropertyClick?.(selectedProperty)}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700"
              >
                Ver Detalles →
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
```

---

## Step 5: Use the Map in Your Dashboard

Update `frontend/web/src/pages/dashboard/DashboardPage.tsx`:

```typescript
import PropertyMap from '@/components/PropertyMap';

export default function DashboardPage() {
  // Your existing mock properties
  const properties = [
    {
      id: '1',
      title: 'Departamento en San Isidro',
      address: 'Av. Conquistadores 456, San Isidro',
      price: 450000,
      latitude: -12.0897,
      longitude: -77.0357,
      image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
    },
    {
      id: '2',
      title: 'Casa en Miraflores',
      address: 'Calle Las Flores 123, Miraflores',
      price: 850000,
      latitude: -12.1197,
      longitude: -77.0364,
      image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
    },
    {
      id: '3',
      title: 'Oficina en San Miguel',
      address: 'Av. La Marina 2000, San Miguel',
      price: 320000,
      latitude: -12.0764,
      longitude: -77.0864,
      image_url: 'https://images.unsplash.com/photo-1560184897-ae75f418493e',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Add Map Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Mapa de Propiedades
          </h2>
        </div>
        <PropertyMap
          properties={properties}
          onPropertyClick={(property) => {
            console.log('Property clicked:', property);
            // Navigate to property details or open modal
          }}
        />
      </div>

      {/* Your existing property cards below */}
      {/* ... */}
    </div>
  );
}
```

---

## Step 6: Test It!

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Visit: http://localhost:5173/dashboard

3. You should see a map with 3 red markers!

4. Click on any marker to see property details

---

## How This Works (API Flow)

```
Your App                          Google Maps API
   |                                     |
   | 1. LoadScript loads Google Maps JS  |
   |------------------------------------>|
   |                                     |
   |     2. Returns map code             |
   |<------------------------------------|
   |                                     |
   | 3. Request map tiles for Lima       |
   |------------------------------------>|
   |                                     |
   |     4. Returns map images           |
   |<------------------------------------|
   |                                     |
   | 5. Display map + property markers   |
```

**Each time user moves the map:**
- New API request for map tiles
- Google charges based on map loads (free tier: 28,000/month)

---

## What You Just Did ✅

1. ✅ Made API calls to Google Maps
2. ✅ Displayed interactive map
3. ✅ Added custom markers for properties
4. ✅ Created clickable info windows
5. ✅ Integrated external API into your app!

---

## Advanced Features You Can Add

### 1. Search Address
```typescript
import { Autocomplete } from '@react-google-maps/api';

<Autocomplete>
  <input
    type="text"
    placeholder="Buscar dirección..."
    className="px-4 py-2 border rounded"
  />
</Autocomplete>
```

### 2. Draw Boundaries
```typescript
import { Polygon } from '@react-google-maps/api';

<Polygon
  paths={districtBoundary}
  options={{
    fillColor: '#2196F3',
    fillOpacity: 0.2,
    strokeColor: '#2196F3',
    strokeWeight: 2,
  }}
/>
```

### 3. Clustering (many properties)
```typescript
import { MarkerClusterer } from '@react-google-maps/api';

<MarkerClusterer>
  {(clusterer) =>
    properties.map((property) => (
      <Marker
        key={property.id}
        position={position}
        clusterer={clusterer}
      />
    ))
  }
</MarkerClusterer>
```

### 4. Directions (Route from user to property)
```typescript
import { DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

// Show route from user's location to property
```

---

## Cost Breakdown 💰

**Google Maps Pricing:**
- First 28,000 map loads: **FREE**
- After that: $7 per 1,000 map loads

**For your app:**
- If 100 users view the map per day = 3,000/month = **FREE**
- If 1,000 users per day = 30,000/month = $14/month

**Tip:** Cache map tiles and use static maps for thumbnails to reduce costs.

---

## Common Errors & Solutions

### Error: "InvalidKeyMapError"
**Solution:** Check your API key is correct in `.env` file

### Error: "This API project is not authorized"
**Solution:** Enable "Maps JavaScript API" in Google Cloud Console

### Error: "Map not displaying"
**Solution:** Make sure `mapContainerStyle` has a height set

### Error: "RefererNotAllowedMapError"
**Solution:** Add your domain to API key restrictions

---

## Next Steps

1. ✅ Try this tutorial
2. Add real property coordinates to your Supabase database
3. Fetch properties from database and display on map
4. Add search functionality
5. Add filters (price range, bedrooms, etc.)

---

**Congratulations!** 🎉 You just integrated your first third-party API!

This is the same pattern for ALL APIs:
1. Get API key
2. Install SDK/library (if available)
3. Make API requests
4. Handle responses
5. Display data to users
