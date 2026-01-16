# 🔧 Solución: Error "Invalid Refresh Token"

## ❌ El Problema

Estás viendo este error en la consola:
```
AuthApiError: Invalid Refresh Token: Refresh Token Not Found
POST https://...supabase.co/auth/v1/token?grant_type=refresh_token
[HTTP/3 400 370ms]
```

**Causa**: Supabase está intentando refrescar un token de autenticación que ya no es válido o ha expirado. Esto ocurre cuando:
- Tokens antiguos quedan en localStorage
- La sesión expiró hace tiempo
- Hubo cambios en las configuraciones de Supabase
- Se limpió la base de datos pero no el navegador

## ✅ Soluciones Implementadas

### 1. **Limpieza Automática en la App**

He añadido código que detecta y limpia automáticamente tokens inválidos:

**Archivos modificados**:
- `lib/supabase.ts` - Listener de eventos de auth con auto-limpieza
- `lib/auth-helper.ts` - Utilidades para validar y limpiar sesiones
- `app/page.tsx` - Limpieza al cargar la home

**Qué hace**:
- Detecta cuando un token refresh falla
- Limpia automáticamente localStorage
- Fuerza sign-out local
- Previene errores en futuras cargas

### 2. **Herramientas de Debug en Consola**

He creado utilidades accesibles desde la consola del navegador:

**Archivo**: `lib/debug-auth.ts`

### 📋 Cómo Usar las Herramientas

#### Opción A: Limpieza Rápida (Recomendado)

1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Ejecuta:
   ```javascript
   window.debugAuth.clearAll()
   ```
4. Recarga la página (F5 o Ctrl+R)
5. El error debería desaparecer

#### Opción B: Limpieza Selectiva

Solo limpia tokens inválidos (mantiene sesiones válidas):
```javascript
await window.debugAuth.clearInvalid()
```

#### Opción C: Verificar Estado

Para ver si tienes una sesión válida:
```javascript
await window.debugAuth.checkSession()
```

Esto mostrará:
- ✅ Usuario actual
- ⏰ Fecha de expiración
- 🔑 Tokens (parciales)
- O ❌ si no hay sesión válida

#### Opción D: Cerrar Sesión Limpiamente

Si quieres cerrar sesión y empezar de cero:
```javascript
await window.debugAuth.signOut()
```

### 🛠️ Comandos Completos Disponibles

Ejecuta esto para ver todos los comandos:
```javascript
window.debugAuth.help()
```

**Lista de comandos**:
| Comando | Descripción |
|---------|-------------|
| `listSupabaseKeys()` | Lista todas las keys de Supabase en localStorage |
| `clearAll()` | Limpia TODAS las keys de Supabase |
| `clearInvalid()` | Limpia solo tokens que causan errores |
| `checkSession()` | Verifica si hay sesión válida |
| `refreshToken()` | Intenta refrescar el token actual |
| `signOut()` | Cierra sesión de forma segura |
| `help()` | Muestra ayuda completa |

## 🔥 Solución Inmediata (Si el Error Persiste)

Si después de los pasos anteriores el error continúa:

### Método 1: Limpieza Manual de localStorage

1. Abre DevTools (F12)
2. Ve a **Application** → **Local Storage**
3. Busca tu dominio (localhost:3000 o tu dominio de producción)
4. Elimina todas las keys que empiecen con `sb-`
5. Recarga la página

### Método 2: Limpieza Completa del Navegador

1. Abre Chrome/Edge Settings
2. Ve a **Privacy and Security** → **Clear browsing data**
3. Selecciona:
   - ✅ Cookies and other site data
   - ✅ Cached images and files
4. Time range: **Last 24 hours**
5. Click **Clear data**
6. Vuelve a abrir la app

### Método 3: Modo Incógnito

Para verificar si es problema de localStorage:
1. Abre ventana de incógnito (Ctrl+Shift+N)
2. Accede a tu app
3. Si funciona correctamente → el problema es localStorage corrupto
4. Ejecuta `window.debugAuth.clearAll()` en ventana normal

## 🔍 Verificación

Para confirmar que el problema está resuelto:

1. Abre DevTools → Console
2. Ejecuta:
   ```javascript
   await window.debugAuth.checkSession()
   ```
3. Deberías ver:
   - ❌ "No hay sesión activa" (si no estás logueado) - **Normal**
   - ✅ Datos de usuario (si estás logueado) - **Normal**
   - ⚠️ Si ves errores → ejecuta `debugAuth.clearAll()`

## 🚀 Prevención Futura

La app ahora detecta automáticamente este problema, pero puedes prevenir errores:

### En Desarrollo:
- Cuando cambies configuraciones de Supabase, ejecuta `debugAuth.clearAll()`
- Si reseteas la BD, limpia localStorage

### En Producción:
- Si usuarios reportan problemas de login, pídeles que ejecuten:
  ```javascript
  window.debugAuth.clearAll()
  ```
  Y recarguen la página

## 📊 Logs en Consola

Ahora verás mensajes informativos en consola:

```
🛠️  Pack2Pack Debug Tools cargado
💡 Ejecuta: window.debugAuth.help()

[Supabase] Token refreshed successfully
[Auth Helper] Removing invalid key: sb-xxx-auth-token
```

Estos logs te ayudarán a identificar problemas rápidamente.

## 🔗 Archivos Relacionados

Si quieres revisar el código implementado:

1. **Cliente Supabase con auto-limpieza**:
   - `lib/supabase.ts`

2. **Utilidades de autenticación**:
   - `lib/auth-helper.ts`

3. **Herramientas de debug**:
   - `lib/debug-auth.ts`

4. **Integración en app**:
   - `app/layout.tsx` (carga herramientas)
   - `app/page.tsx` (limpieza al inicio)

## ❓ FAQ

**P: ¿Por qué aparece este error?**
R: Tokens de Supabase quedan en localStorage y expiran. El navegador intenta usarlos pero ya no son válidos.

**P: ¿Perderé mi sesión?**
R: Si la sesión era inválida (causa del error), ya estaba perdida. La limpieza solo elimina tokens corruptos.

**P: ¿Debo hacer esto cada vez?**
R: No. Con las correcciones implementadas, la app lo hace automáticamente.

**P: ¿Funciona en producción?**
R: Sí, las herramientas `window.debugAuth` funcionan en cualquier entorno.

**P: ¿Es seguro?**
R: Sí, solo accede a localStorage del navegador. No envía datos a ningún servidor.

## 📞 Soporte

Si el problema persiste después de intentar todas las soluciones:

1. Ejecuta: `await window.debugAuth.checkSession()`
2. Copia el output de la consola
3. Revisa logs en Supabase Dashboard → Authentication → Logs
4. Verifica que `.env.local` tiene las variables correctas:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

---

**Última actualización**: 16 enero 2026
**Versión**: 1.0.0
**Status**: ✅ Implementado y Probado
