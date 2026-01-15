# Instrucciones para ejecutar la migración de RLS en packs

## Problema identificado
La tabla `packs` **NO tiene RLS (Row Level Security) habilitado**, lo que permite a cualquier usuario eliminar packs de otros usuarios, aunque la lógica de negocio intenta impedirlo.

## Solución
Ejecutar la migración `enable_packs_rls.sql` en Supabase SQL Editor.

## Pasos:

1. Ve a tu dashboard de Supabase: https://app.supabase.com
2. Selecciona tu proyecto `pack2pack`
3. Ve a **SQL Editor** en la barra lateral izquierda
4. Crea una nueva query
5. Copia el contenido del archivo `supabase/migrations/enable_packs_rls.sql`
6. Pégalo en el editor
7. Haz clic en **Run** (o presiona `Ctrl+Enter`)

## ¿Qué hace esta migración?

- ✅ Habilita RLS en la tabla `packs`
- ✅ Crea política: Cualquiera puede VER packs (SELECT)
- ✅ Crea política: Solo el creador puede CREAR packs (INSERT)
- ✅ Crea política: Solo el creador puede MODIFICAR sus packs (UPDATE)
- ✅ Crea política: Solo el creador puede ELIMINAR sus packs (DELETE)

## Resultado esperado
Después de ejecutar la migración:
- ✅ Los packs se eliminarán correctamente de la base de datos
- ✅ Ya no aparecerán en la home o en otras secciones
- ✅ El usuario no podrá eliminar packs de otros usuarios aunque intente hacer un request directo

---

**Nota**: Una vez ejecutada esta migración, el comportamiento actual será el esperado:
- Los packs desaparecen de "Mis Packs" ✅
- Los packs desaparecen de la home ✅
- Los packs desaparecen de Supabase ✅
