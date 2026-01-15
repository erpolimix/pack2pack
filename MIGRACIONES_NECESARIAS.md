# Migraciones de Base de Datos Necesarias

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

#### 2. Habilitar RLS en tabla `packs` (OPCIONAL, pero recomendado)
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
4. Copia y ejecuta la migración 1 (add_status_to_packs.sql)
5. (Opcional pero recomendado) Copia y ejecuta la migración 2 (enable_packs_rls.sql)

## Resultado esperado:

✅ Los packs ahora tienen un estado (status)
✅ En la home solo se ven packs disponibles
✅ En "Mis Packs" se ven todos tus packs con su estado
✅ Al hacer clic en "Vendido", el pack se marca como vendido
✅ Los packs vendidos desaparecen de la home
✅ Las valoraciones se mantienen aunque el pack esté vendido
✅ Tienes un historial completo de todos tus packs

## Funcionalidad eliminada:

❌ El botón "Eliminar" ya no existe
❌ Los packs no se eliminan físicamente de la base de datos
❌ La información de las transacciones se preserva para auditoría
