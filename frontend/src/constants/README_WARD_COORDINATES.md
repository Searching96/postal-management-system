# Ward Coordinates Guide

This guide explains how to add and maintain ward-level coordinates for the map visualization.

## Current Status

The `wardCoordinates.ts` file contains coordinates for major city wards in Vietnam. It currently includes:
- **Hanoi** (~12 wards)
- **Ho Chi Minh City** (~19 wards)
- **Da Nang** (~7 wards)
- **Can Tho** (~5 wards)
- **Hai Phong** (~7 wards)
- **Bien Hoa** (~4 wards)
- **Vung Tau** (~3 wards)
- **Nha Trang** (~3 wards)
- **Hue** (~3 wards)

**Total: ~63 wards** out of ~10,000+ in Vietnam

## How It Works

### Priority System
The map uses a priority system to determine coordinates:

1. **Ward-level coordinates** (most precise) - from `wardCoordinates.ts`
2. **Province-level coordinates** - extracts province code from ward code
3. **Region-level coordinates** - based on region name
4. **Grid fallback** - auto-generated grid pattern

### Example
```typescript
Ward code: "79001" (Quận 1, HCMC)
↓
Check WARD_COORDINATES["79001"]
↓
Found: [10.8231, 106.6297] ✓ (Exact location)
```

```typescript
Ward code: "79999" (not in mapping)
↓
Check WARD_COORDINATES["79999"]
↓
Not found, extract province: "79"
↓
Use PROVINCE_COORDINATES["79"] (HCMC center)
↓
Add small offset to prevent overlap
```

## Adding New Ward Coordinates

### Method 1: Manual Entry

1. **Get Coordinates**
   - Use Google Maps: Right-click location → Click coordinates
   - Use OpenStreetMap: Click location → See coordinates in URL
   - Use geocoding services

2. **Add to wardCoordinates.ts**
   ```typescript
   // In wardCoordinates.ts
   export const WARD_COORDINATES: Record<string, [number, number]> = {
       // ... existing entries

       // Your new ward
       '93005': [10.4567, 105.1234], // Ward name, City
   };
   ```

3. **Group by Province**
   ```typescript
   // Dong Thap (Province code: 93)
   '93001': [10.4917, 105.6881], // Ward 1
   '93002': [10.4950, 105.6900], // Ward 2
   '93003': [10.4880, 105.6850], // Ward 3
   ```

### Method 2: Batch Import (Recommended for many wards)

If you have a CSV/JSON file with ward coordinates:

```typescript
// Example: Import from external data
import wardData from './data/ward-coordinates.json';

export const WARD_COORDINATES: Record<string, [number, number]> = {
    ...Object.fromEntries(
        wardData.map(ward => [ward.code, [ward.lat, ward.lng]])
    ),
    // Manual overrides if needed
    '00001': [21.0285, 105.8542],
};
```

### Method 3: Using Mapping APIs

For automated coordinate lookup:

```typescript
// Example: Fetch from geocoding service
async function fetchWardCoordinates(wardCode: string, wardName: string) {
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${wardName},Vietnam&format=json&limit=1`
    );
    const data = await response.json();
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
}
```

## Data Sources

### Free Sources
- **OpenStreetMap**: https://www.openstreetmap.org
- **Google Maps**: Right-click → coordinates
- **Nominatim**: https://nominatim.openstreetmap.org (OSM geocoding)
- **Vietnamese GIS Data**: https://github.com/daohoangson/dvhcvn

### Commercial Sources (Higher Accuracy)
- Google Geocoding API
- Mapbox Geocoding API
- Here Maps Geocoding API

## File Structure

```
frontend/src/constants/
├── wardCoordinates.ts          # Main coordinates file
└── README_WARD_COORDINATES.md  # This file
```

## Best Practices

1. **Use Decimal Degrees**
   - Format: `[latitude, longitude]`
   - Example: `[10.8231, 106.6297]`
   - NOT: `[106.6297, 10.8231]` (wrong order!)

2. **Group by Province**
   - Add comments to separate provinces
   - Makes maintenance easier

3. **Verify Coordinates**
   - Check on a map before adding
   - Ensure they're in Vietnam (lat: 8°-24°, lng: 102°-110°)

4. **Document Sources**
   - Add comment with source if coordinates are from specific service
   - Example: `'79001': [10.8231, 106.6297], // From Google Maps 2026`

5. **Precision**
   - 4-6 decimal places is sufficient
   - More precision doesn't improve visual accuracy

## Testing

After adding coordinates:

1. **Check Console Logs**
   ```
   Browser Console → Look for:
   "Using ward-level coordinates for: 79001 [10.8231, 106.6297]"
   ```

2. **Visual Verification**
   - Create a consolidation route with the ward
   - Check if marker appears in correct location
   - Compare with Google Maps

3. **Fallback Check**
   - Try a ward without coordinates
   - Should fall back to province-level coordinates
   - Should show console warning

## Performance Notes

- **Memory**: ~10 bytes per ward coordinate
- **10,000 wards** ≈ 100KB in memory (negligible)
- **Loading**: Coordinates loaded once at startup
- **No network calls**: All data is client-side

## Future Improvements

Consider these enhancements:

1. **Load on Demand**
   ```typescript
   // Only load coordinates for current province
   const coords = await import(`./wards/${provinceCode}.ts`);
   ```

2. **Database Integration**
   - Store coordinates in backend database
   - Fetch via API when needed
   - Allows admin users to update coordinates

3. **Geocoding Service**
   - Auto-lookup coordinates when ward office is created
   - Cache results in database
   - Fallback to province coordinates if lookup fails

## Questions?

- Check browser console for coordinate-related messages
- Verify ward codes match database ward codes exactly
- Ensure coordinates are in `[latitude, longitude]` order
