# Sistema de Geolocalización Pack2Pack

## 📍 Descripción General

Pack2Pack ahora incluye un sistema completo de geolocalización que permite a los usuarios descubrir packs cerca de su ubicación. El sistema ordena automáticamente los packs por distancia y filtra resultados basándose en un radio configurable.

## 🏗️ Arquitectura Implementada

### 1. Servicio de Geolocalización (`services/geoService.ts`)

**Proveedor**: OpenStreetMap Nominatim API (gratuito, sin API key)

**Interfaces**:
```typescript
interface Coordinates {
  latitude: number
  longitude: number
}

interface Location {
  coordinates: Coordinates
  city: string
  postalCode?: string
  neighborhood?: string
  address?: string
}
```

**Métodos implementados**:

| Método | Descripción | Ejemplo de Uso |
|--------|-------------|----------------|
| `getCurrentPosition()` | Obtiene ubicación del navegador (HTML5) | Capturar ubicación automática del usuario |
| `reverseGeocode(coords)` | Convierte coordenadas → dirección | Obtener ciudad/barrio desde GPS |
| `geocodeAddress(address)` | Convierte dirección → coordenadas | Búsqueda manual por ciudad |
| `searchAddresses(query)` | Autocompletado de direcciones | Input de búsqueda con sugerencias |
| `calculateDistance(coords1, coords2)` | Distancia con fórmula Haversine | Calcular km entre usuario y pack |
| `formatDistance(km)` | Formatea distancia para UI | "0.8 km" o "850 m" |
| `saveUserLocation(location)` | Guarda en localStorage | Persistir preferencia de usuario |
| `getUserLocation()` | Recupera de localStorage | Leer ubicación guardada |
| `clearUserLocation()` | Elimina ubicación guardada | Reset de preferencias |

**Características técnicas**:
- ✅ Idioma español en todas las peticiones API (`Accept-Language: es`)
- ✅ User-Agent header `Pack2Pack/1.0` (requerido por Nominatim)
- ✅ Filtrado automático por país (`countrycodes=es`)
- ✅ Enriquecimiento de búsquedas (añade "España" automáticamente)
- ✅ Manejo robusto de errores con try-catch
- ✅ Console logging para debugging

### 2. Componente LocationModal (`components/location-modal.tsx`)

Modal interactivo para capturar ubicación del usuario.

**Flujo UX**:
1. Usuario hace clic en "Usar mi ubicación actual" → Solicita permiso del navegador
2. O introduce ciudad manualmente → Geocodifica dirección
3. Muestra loading spinner durante proceso
4. Guarda ubicación en localStorage
5. Cierra modal y notifica a componente padre

**Características visuales**:
- ✅ Diseño responsive con Tailwind CSS
- ✅ Estados de carga (loading spinner)
- ✅ Mensajes de error claros en español
- ✅ Botón de cierre (X)
- ✅ Separador visual entre opciones
- ✅ Nota de privacidad ("Tu ubicación se guarda localmente")

### 3. Actualización del Modelo de Datos

**Pack interface** (`services/packService.ts`):
```typescript
export interface Pack {
  // ... campos existentes ...
  
  // Nuevos campos de geolocalización
  latitude?: number           // Coordenada latitud WGS84
  longitude?: number          // Coordenada longitud WGS84
  city?: string              // Ciudad (Madrid, Barcelona)
  neighborhood?: string       // Barrio (Malasaña, Eixample)
  distanceKm?: number        // Distancia calculada desde usuario (km)
}
```

**Método de proximidad** (`packService.ts`):
```typescript
async getPacksByProximity(
  userCoords: { latitude: number; longitude: number }, 
  radiusKm: number = 50
): Promise<Pack[]>
```

**Lógica**:
1. Consulta Supabase: packs disponibles CON coordenadas (not null)
2. Filtra reservados (bookings activos)
3. Calcula distancia para cada pack usando Haversine
4. Filtra por radio máximo (default 50km)
5. Ordena por distancia ascendente (más cerca primero)
6. Retorna array con campo `distanceKm` poblado

### 4. Integración en Formulario de Creación

**create-pack-form.tsx**:

**useEffect al montar**:
```typescript
useEffect(() => {
  const loadLocation = async () => {
    // 1. Intenta leer ubicación guardada
    const saved = geoService.getUserLocation()
    if (saved) {
      setUserLocation(saved)
    } else {
      // 2. Si no hay guardada, obtiene ubicación actual
      const coords = await geoService.getCurrentPosition()
      const location = await geoService.reverseGeocode(coords)
      setUserLocation(location)
      geoService.saveUserLocation(location)
    }
  }
  loadLocation()
}, [])
```

**Preview visual**:
```tsx
{userLocation && (
  <div className="bg-brand-light/50 border rounded-xl p-4">
    <MapPin />
    <p>Tu pack se publicará en:</p>
    <p>{userLocation.neighborhood}, {userLocation.city}</p>
  </div>
)}
```

**Submit con ubicación**:
```typescript
await packService.createPack({
  // ... campos existentes ...
  latitude: userLocation?.coordinates.latitude,
  longitude: userLocation?.coordinates.longitude,
  city: userLocation?.city,
  neighborhood: userLocation?.neighborhood,
})
```

### 5. Página Principal con Filtrado por Distancia

**app/page.tsx**:

**Estados de geolocalización**:
```typescript
const [userLocation, setUserLocation] = useState<Location | null>(null)
const [showLocationModal, setShowLocationModal] = useState(false)
const [radiusKm, setRadiusKm] = useState<number>(50)
```

**Check inicial de ubicación**:
```typescript
useEffect(() => {
  const saved = geoService.getUserLocation()
  if (saved) {
    setUserLocation(saved)
  } else {
    setShowLocationModal(true) // Muestra modal si no hay ubicación
  }
}, [])
```

**Carga de packs por proximidad**:
```typescript
useEffect(() => {
  if (userLocation) {
    loadPacksByProximity()
  } else {
    loadPacks() // Fallback sin filtrado
  }
}, [userLocation, radiusKm])
```

**UI de filtros de ubicación**:
```tsx
{userLocation && (
  <div className="flex items-center gap-3">
    {/* Badge de ciudad */}
    <div className="bg-white rounded-full px-4 py-2">
      <MapPin className="w-4 h-4" />
      <span>{userLocation.city}</span>
    </div>
    
    {/* Selector de radio */}
    <select value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))}>
      <option value={5}>5 km</option>
      <option value={10}>10 km</option>
      <option value={25}>25 km</option>
      <option value={50}>50 km</option>
      <option value={100}>100 km</option>
    </select>
    
    {/* Botón cambiar ubicación */}
    <button onClick={() => setShowLocationModal(true)}>
      Cambiar ubicación
    </button>
  </div>
)}
```

### 6. Display de Distancia en PackCard

**components/pack-card.tsx**:

**Cálculo de texto**:
```typescript
const distanceText = pack.distanceKm 
  ? geoService.formatDistance(pack.distanceKm) 
  : null
```

**Badge visual**:
```tsx
{distanceText && (
  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg">
    <MapPin size={12} />
    {distanceText}
  </div>
)}
```

**Resultado**: Badge tipo TooGoodToGo con icono de pin y distancia formateada.

## 🗄️ Base de Datos

### Migración SQL (`supabase/migrations/add_geolocation_columns.sql`)

```sql
-- Columnas para packs
ALTER TABLE packs 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100);

-- Índice para queries de distancia
CREATE INDEX IF NOT EXISTS idx_packs_location ON packs (latitude, longitude);

-- Columnas para profiles (opcional)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS city VARCHAR(100);
```

**¡IMPORTANTE!**: Esta migración debe ejecutarse en Supabase antes de usar las features de geolocalización.

### Ejecución de la migración

**Opción 1: Supabase Dashboard**
1. Ir a https://supabase.com/dashboard/project/YOUR_PROJECT/editor
2. Copiar contenido de `add_geolocation_columns.sql`
3. Pegar en SQL Editor
4. Ejecutar

**Opción 2: Supabase CLI**
```bash
supabase db push
```

## 🎯 Flujo de Usuario Completo

### Primera Visita
1. Usuario accede a página principal
2. No hay ubicación guardada → `LocationModal` se muestra automáticamente
3. Usuario permite geolocalización O introduce ciudad manualmente
4. Ubicación se guarda en localStorage
5. Modal se cierra
6. Packs se cargan ordenados por distancia (default: 50km)

### Visitas Posteriores
1. Usuario accede a página principal
2. Ubicación se lee desde localStorage
3. Packs se cargan automáticamente por proximidad
4. Usuario puede cambiar radio (5-100km)
5. Usuario puede cambiar ciudad ("Cambiar ubicación")

### Creación de Pack
1. Usuario accede a `/create`
2. Formulario intenta obtener ubicación automáticamente
3. Si no hay ubicación → solicita permiso del navegador
4. Preview muestra: "Tu pack se publicará en: Malasaña, Madrid"
5. Al publicar pack, coordenadas se guardan en BD

### Visualización de Pack
1. Pack card muestra badge de distancia en esquina superior izquierda
2. Badge style: fondo blanco/90, backdrop-blur, icono MapPin, texto bold
3. Distancia formateada: "0.8 km" (< 1km muestra metros, >= 1km muestra km)

## 🔒 Consideraciones de Privacidad

✅ **Nunca mostramos coordenadas exactas** del vendedor en UI
✅ **Solo mostramos ciudad y barrio** (granularidad segura)
✅ **Coordenadas solo se usan para cálculos** de distancia
✅ **Ubicación usuario se guarda localmente** (localStorage, no servidor)
✅ **Usuario puede cambiar ubicación** cuando quiera
✅ **Geolocalización requiere permiso** explícito del navegador

## 📱 Políticas de Nominatim

**Límites de uso**:
- ⚠️ Máximo 1 request/segundo (rate limit)
- ⚠️ User-Agent header obligatorio
- ⚠️ No abusar del servicio gratuito

**Implementación de buenas prácticas**:
- ✅ User-Agent: "Pack2Pack/1.0"
- ✅ Caching en localStorage (reduce llamadas API)
- ✅ Solo geocodifica cuando necesario
- ✅ Reverse geocode solo en pack creation (no en cada view)

**Documentación oficial**: https://nominatim.org/release-docs/latest/api/Overview/

## 🧪 Testing Manual

### Test 1: Primera Visita
```
1. Borrar localStorage: localStorage.clear()
2. Recargar página principal
3. ✓ Verificar que aparece LocationModal
4. Click "Usar mi ubicación actual"
5. ✓ Verificar que se solicita permiso del navegador
6. ✓ Verificar que modal se cierra tras permitir
7. ✓ Verificar que aparece ciudad en UI
```

### Test 2: Cambio de Radio
```
1. Con ubicación establecida
2. Cambiar selector de radio (5km → 100km)
3. ✓ Verificar que packs se recargan
4. ✓ Verificar que más packs aparecen con radio mayor
5. ✓ Verificar que orden es por distancia (más cerca primero)
```

### Test 3: Creación de Pack
```
1. Ir a /create
2. ✓ Verificar que aparece preview de ubicación
3. Subir imagen, llenar formulario
4. Submit
5. ✓ Verificar que pack aparece en home
6. ✓ Verificar que pack tiene badge de distancia
7. ✓ Verificar que distancia es 0 km (mismo lugar que usuario)
```

### Test 4: Búsqueda Manual
```
1. Click "Cambiar ubicación" en home
2. Introducir ciudad manualmente: "Barcelona"
3. Click "Buscar en esta ciudad"
4. ✓ Verificar que se geocodifica correctamente
5. ✓ Verificar que packs de Barcelona aparecen
6. ✓ Verificar que distancias se actualizan
```

## 🚀 Estado de Implementación

### ✅ Completado (100%)
- [x] geoService.ts con todos los métodos
- [x] LocationModal component
- [x] Pack interface actualizada
- [x] getPacksByProximity() en packService
- [x] Integración en create-pack-form
- [x] Integración en página principal
- [x] Display de distancia en pack-card
- [x] Selector de radio de búsqueda
- [x] Migración SQL de base de datos
- [x] Build compila sin errores

### ⏳ Pendiente (Requiere Acción del Usuario)
- [ ] **Ejecutar migración SQL en Supabase**
  - Archivo: `supabase/migrations/add_geolocation_columns.sql`
  - Acción: Copiar y ejecutar en Supabase Dashboard > SQL Editor

### 🎨 Mejoras Futuras (Opcional)
- [ ] Mapa interactivo con Leaflet.js
- [ ] Clustering de packs por barrio
- [ ] Heatmap de densidad de packs
- [ ] Notificaciones basadas en ubicación
- [ ] Multi-ciudad search (Madrid + Barcelona simultáneo)
- [ ] Sugerencias de precio por zona

## 📊 Impacto en Performance

**Pros**:
- ✅ Query indexada (idx_packs_location) → rápida
- ✅ Filtrado por radio reduce cantidad de packs procesados
- ✅ Cálculo Haversine en memoria (muy rápido)
- ✅ Caching de ubicación en localStorage (reduce API calls)

**Consideraciones**:
- ⚠️ Con 1000+ packs, considerar paginación
- ⚠️ Con millones de packs, considerar PostGIS extension de Postgres
- ⚠️ Nominatim tiene rate limit (1 req/s) → ok para uso normal

## 🔗 Referencias

- **OpenStreetMap Nominatim**: https://nominatim.org/
- **Haversine Formula**: https://en.wikipedia.org/wiki/Haversine_formula
- **HTML5 Geolocation**: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- **Supabase PostGIS**: https://supabase.com/docs/guides/database/extensions/postgis (para futuro)

## 👥 Soporte

Si encuentras problemas:
1. Verificar que migración SQL fue ejecutada
2. Verificar permisos de geolocalización en navegador
3. Verificar que hay packs CON coordenadas en BD
4. Revisar console.log para mensajes de debug del geoService

---

**Versión**: 1.0.0  
**Fecha**: Enero 2025  
**Status**: ✅ Producción Ready (tras ejecutar migración SQL)
