# Migraciones de Base de Datos Necesarias

## ⚠️ IMPORTANTE: Migración Crítica para Sistema de Reservas

**PROBLEMA**: Terceros usuarios pueden ver y reservar packs ya reservados por otros.

**CAUSA**: La política RLS de la tabla `bookings` solo permite ver las propias reservas, impidiendo que el filtrado de packs funcione para todos los usuarios.

**SOLUCIÓN**: Ejecutar migración `add_public_bookings_policy.sql` (ver abajo).

---

## Cambios Implementados

Se ha implementado un nuevo sistema de gestión de packs sin eliminación física, manteniendo historial:

### Cambios en la aplicación:
1. ✅ Campo `status` agregado a la interfaz `Pack` (available, sold, expired, archived)
2. ✅ Método `updatePackStatus()` agregado al servicio
3. ✅ Home page (`getPacks()`) filtra automáticamente solo packs con status='available'
4. ✅ Página "Mis Packs" muestra todos tus packs con su estado (status badge)
5. ✅ Botón "Eliminar" reemplazado por "Vendido" que marca el pack como sold
6. ✅ Packs marcados como "sold" se ocultan de la home pero permanecen en historial

### Migraciones SQL necesarias:

Necesitas ejecutar las siguientes migraciones en Supabase SQL Editor:

#### 1. Agregar columna `status` a la tabla `packs`
```sql
-- Archivo: supabase/migrations/add_status_to_packs.sql
ALTER TABLE packs 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available' 
CHECK (status IN ('available', 'sold', 'expired', 'archived'));

CREATE INDEX IF NOT EXISTS idx_packs_status ON packs(status);
CREATE INDEX IF NOT EXISTS idx_packs_seller_status ON packs(seller_id, status);

COMMENT ON COLUMN packs.status IS 'Estado del pack: available (disponible), sold (vendido/comprado), expired (expirado), archived (archivado)';
```

#### 2. 🔴 CRÍTICO: Permitir ver pack_ids de reservas activas (Sistema de Reservas)
```sql
-- Archivo: supabase/migrations/add_public_bookings_policy.sql
DROP POLICY IF EXISTS "Anyone can see booked pack IDs" ON bookings;

CREATE POLICY "Anyone can see booked pack IDs"
    ON bookings FOR SELECT
    USING (true);

-- Esta política permite que TODOS los usuarios puedan consultar los pack_id
-- de las reservas activas, sin exponer información sensible de buyer/seller.
-- Es necesaria para que getPacks() filtre correctamente los packs ya reservados.
```

#### 3. Habilitar RLS en tabla `packs` (OPCIONAL, pero recomendado)
```sql
-- Archivo: supabase/migrations/enable_packs_rls.sql
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Packs are publicly visible" ON packs;
DROP POLICY IF EXISTS "Users can insert packs" ON packs;
DROP POLICY IF EXISTS "Users can update their own packs" ON packs;
DROP POLICY IF EXISTS "Users can delete their own packs" ON packs;

CREATE POLICY "Packs are publicly visible"
    ON packs FOR SELECT
    USING (true);

CREATE POLICY "Users can insert packs"
    ON packs FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own packs"
    ON packs FOR UPDATE
    USING (auth.uid() = seller_id)
    WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own packs"
    ON packs FOR DELETE
    USING (auth.uid() = seller_id);
```

## Pasos para ejecutar:

1. Ve a tu dashboard de Supabase: https://app.supabase.com
2. Selecciona tu proyecto `pack2pack`
3. Ve a **SQL Editor** en la barra lateral izquierda
4. **🔴 EJECUTA PRIMERO (CRÍTICO):** Copia y ejecuta `add_public_bookings_policy.sql` (migración 2)
5. Copia y ejecuta `add_status_to_packs.sql` (migración 1)
6. (Opcional pero recomendado) Copia y ejecuta `enable_packs_rls.sql` (migración 3)

## Resultado esperado:

✅ Los packs ahora tienen un estado (status)
✅ En la home solo se ven packs disponibles
✅ En "Mis Packs" se ven todos tus packs con su estado
✅ Al hacer clic en "Vendido", el pack se marca como vendido
✅ Los packs vendidos desaparecen de la home
✅ Las valoraciones se mantienen aunque el pack esté vendido
✅ El sistema de reservas funciona correctamente para todos los usuarios
✅ Sistema de notificaciones in-app completamente funcional

---

## 🔔 NUEVO: Sistema de Notificaciones

Se ha implementado un sistema completo de notificaciones in-app. Para activarlo:

#### 4. Crear tabla de notificaciones
```sql
-- Archivo: supabase/migrations/create_notifications_table.sql
-- ⚠️ Este archivo ya existe en la carpeta migrations
-- Solo cópialo y ejecútalo en el SQL Editor
```

#### 5. 🔴 CRÍTICO: Función para marcar packs como vendidos (NUEVO)
```sql
-- Archivo: supabase/migrations/create_mark_pack_as_sold_function.sql
-- ⚠️ IMPORTANTE: Esta migración es NECESARIA para que los packs se marquen como vendidos
-- cuando se completan las transacciones. Sin ella, los packs permanecen como 'available'.

CREATE OR REPLACE FUNCTION mark_pack_as_sold(pack_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE packs
    SET status = 'sold'
    WHERE id = pack_id_param;
    
    RAISE NOTICE 'Pack % marked as sold', pack_id_param;
END;
$$;

GRANT EXECUTE ON FUNCTION mark_pack_as_sold(UUID) TO authenticated;

COMMENT ON FUNCTION mark_pack_as_sold IS 'Marks a pack as sold after transaction completion. Bypasses RLS for legitimate booking completions.';
```

Ver instrucciones completas en: **`NOTIFICATION_SYSTEM_INSTRUCTIONS.md`**

### Características del sistema de notificaciones:
- 🔔 Icono de campana en navbar con badge de contador
- 📱 Responsive (móvil y desktop)
- 🔄 Actualización automática cada 30 segundos
- 7 tipos de notificaciones (reservas, validaciones, valoraciones)
- 🔒 RLS policies de seguridad
- ✅ Integración automática con bookings y ratings
✅ Tienes un historial completo de todos tus packs

## Funcionalidad eliminada:

❌ El botón "Eliminar" ya no existe
❌ Los packs no se eliminan físicamente de la base de datos
❌ La información de las transacciones se preserva para auditoría
