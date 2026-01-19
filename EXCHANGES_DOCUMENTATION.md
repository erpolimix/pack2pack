# 🔄 Sistema de Intercambio de Packs - Documentación

## Descripción General

Pack2Pack ahora soporta **intercambio directo de packs** entre usuarios. Un usuario puede ofrecer su pack para intercambiarlo por el pack de otro usuario, sin necesidad de dinero de por medio.

## Flujo de Usuario

### 1. **Propuesta de Intercambio**

**Requisitos:**
- El usuario debe estar logueado
- No puede ser el dueño del pack solicitado
- Debe tener al menos 1 pack disponible para ofrecer
- Ambos packs deben estar con status `available`

**Proceso:**
1. Usuario ve un pack que le interesa
2. Click en botón "🔄 Proponer Intercambio"
3. Se abre modal mostrando:
   - Pack solicitado (lo que quiere)
   - Selector de su pack a ofrecer
   - Comparación de valores (✓ Intercambio justo / ⚠ Diferencia importante)
   - Campo opcional para mensaje personal
4. Enviar propuesta

**Estado:** `pending` - Válida 7 días

### 2. **Recibir Propuesta**

**Notificación:**
```
"[Usuario X] te ofrece [tu Pack] por [su Pack]"
```

**Opciones:**
- ✓ Aceptar + seleccionar franja horaria
- ✕ Rechazar (sin necesidad de motivo)
- Ignorar (expira automáticamente en 7 días)

**Estado:** `accepted` - Ambos packs ahora están `reserved`

### 3. **Acordar Encuentro**

Cuando se acepta:
- Se solicita seleccionar franja horaria/punto de recogida
- Sistema genera **código único de 6 dígitos**
- Ambos usuarios reciben notificación con la hora acordada

### 4. **Validación en Encuentro**

**Flujo de validación doble:**

1. **Requester valida:**
   - Ingresa código de 6 dígitos
   - Confirma que recibió el pack correcto
   - Marca su estado como validado

2. **Owner valida:**
   - Ingresa el mismo código de 6 dígitos
   - Confirma que recibió el pack correcto
   - Marca su estado como validado

**Estado:** `completed` - Ambos packs marcados como `sold`

### 5. **Post-Intercambio**

- Ambos usuarios pueden valorarse mutuamente (sistema de ratings)
- Historial guardado en "Mis Intercambios" → Tab "Completados"

## Restricciones y Validaciones

### Antes de Proponer
✅ Usuario debe estar autenticado  
✅ No puede ser el dueño del pack solicitado  
✅ Debe tener al menos 1 pack disponible  
✅ El pack solicitado debe estar disponible

### Durante Intercambio Aceptado
✅ Ambos packs están bloqueados (`reserved`)  
✅ Otros usuarios no pueden reservar/intercambiar
✅ Solo se puede cancelar si no se ha validado

### Validación
✅ Código debe ser exacto (6 dígitos)  
✅ Ambos deben validar para completar  
✅ Si no valida en 7 días, se puede cancelar

## Base de Datos

### Tabla: `exchanges`

```sql
CREATE TABLE exchanges (
  id UUID PRIMARY KEY,
  pack_offered_id UUID,         -- Pack que ofrece el solicitante
  pack_requested_id UUID,       -- Pack que quiere el solicitante
  requester_id UUID,            -- Quien propone
  owner_id UUID,                -- Dueño del pack solicitado
  status VARCHAR(20),           -- pending/accepted/rejected/completed/cancelled
  exchange_code VARCHAR(6),     -- Código único de validación
  selected_time_window TEXT,    -- Hora acordada
  validated_by_requester BOOLEAN,
  validated_by_owner BOOLEAN,
  validated_at TIMESTAMPTZ,
  requester_message TEXT,       -- Mensaje inicial
  owner_response TEXT,          -- (no usado en versión actual)
  created_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ        -- Propuesta expira en 7 días
)
```

## Archivos Modificados/Creados

### Migraciones SQL
- `supabase/migrations/20260119_create_exchanges_table.sql` - Tabla exchanges con indexes

### Services
- **`services/exchangeService.ts`** (NUEVO)
  - `proposeExchange(packRequestedId, packOfferedId, message?)`
  - `acceptExchange(exchangeId, timeWindow)`
  - `rejectExchange(exchangeId)`
  - `cancelExchange(exchangeId)`
  - `validateByUser(exchangeId, code)`
  - `completeExchange(exchangeId)`
  - `getMyExchanges()` / `getReceivedExchanges()` / `getSentExchanges()`

- **`services/notificationService.ts`** (MODIFICADO)
  - Agregados tipos: `exchange_proposed`, `exchange_accepted`, `exchange_rejected`, `exchange_completed`, `exchange_cancelled`

### Componentes
- **`components/exchange-proposal-modal.tsx`** (NUEVO)
  - Modal para proponer intercambio
  - Selector de pack a ofrecer
  - Comparación de valores
  - Validaciones en tiempo real
  - Responsive design

- **`components/exchange-card.tsx`** (NUEVO)
  - Tarjeta para mostrar estado del intercambio
  - Botones de aceptar/rechazar/cancelar
  - Validación con código
  - Indicadores de estado
  - Responsive design

- **`components/navbar.tsx`** (MODIFICADO)
  - Enlace a "Mis Intercambios" en dropdown

### Páginas
- **`app/my-exchanges/page.tsx`** (NUEVA)
  - Gestión de intercambios
  - Tabs: Todos / Recibidas / Enviadas / Completados
  - Contador de propuestas pendientes
  - Protección con autenticación

- **`app/packs/[id]/page.tsx`** (MODIFICADO)
  - Botón "🔄 Proponer Intercambio"
  - Cargamiento de packs del usuario
  - Integración con ExchangeProposalModal

## Notificaciones

Sistema automático de notificaciones:

```
exchange_proposed: "Usuario X te ofrece [pack] por [tu pack]"
exchange_accepted: "Se aceptó tu propuesta! Hora: [hora]"
exchange_rejected: "Tu propuesta fue rechazada"
exchange_completed: "¡Intercambio completado! No olvides valorar"
exchange_cancelled: "El intercambio ha sido cancelado"
```

## UI/UX - Características de Diseño

✅ **Responsive Design**
- Modal se adapta a mobile/tablet/desktop
- Grid de packs escalable
- Botones accesibles en pantallas pequeñas

✅ **Visual Feedback**
- Comparación de valores (✓ Justo / ⚠ Diferencia)
- Estados color-coded (pendiente, aceptado, completado)
- Indicadores de validación
- Loading states

✅ **Lenguaje de Diseño Consistente**
- Gradientes brand-primary/brand-dark
- Espaciado consistent
- Tipografía familiar
- Iconos descriptivos (🔄 ↔️)

✅ **Validaciones Claras**
- Mensajes de error específicos
- Tooltips explicativos
- Restricciones visuales

## Testing Recomendado

1. **Crear intercambio:**
   - Crear 2 usuarios con packs
   - Usuario A propone a User B

2. **Aceptar/Rechazar:**
   - Test ambos flujos
   - Verificar estado de packs

3. **Validación:**
   - Ingreso correcto de código
   - Ingreso incorrecto de código
   - Doble validación

4. **Responsivo:**
   - Mobile 375px
   - Tablet 768px
   - Desktop 1920px

## Próximas Características (Futuro)

- [ ] Contraofertas (el owner pide dinero extra)
- [ ] Chat entre usuarios durante negociación
- [ ] Historial completo con rechazados
- [ ] Filtros avanzados en "Mis Intercambios"
- [ ] Sugerencias automáticas de intercambios
- [ ] Puntuación de "compatibilidad" entre packs

---

**Versión:** 1.0 (Diciembre 2025)  
**Estado:** Production Ready ✅  
**Build:** Compilación sin errores ✅
