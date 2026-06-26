# Trajineras App
 
App móvil de reservas de trajineras (Xochimilco). Permite a usuarios registrarse, ver el catálogo de trajineras, seleccionar fecha/hora y reservar, con pago integrado.
 
## Stack
 
- **Frontend:** Expo + React Native (New Architecture), Expo Router, TypeScript
- **Backend:** Hono.js + Fly.io + Neon PostgreSQL + Prisma ORM
- **Pagos:** Stripe
- **Gestor de paquetes:** pnpm (con endurecimiento de seguridad de cadena de suministro — ver sección de Entorno)
## Setup del entorno
 
```bash
nvm use            # usa la versión de Node fijada en .nvmrc
corepack enable
pnpm install
pnpm expo start -c
```
 
Escanea el QR con la app Expo Go en tu teléfono. **No usar el modo Web** — `expo-secure-store` no lo soporta.

El proyecto usa pnpm con ajustes en `pnpm-workspace.yaml` para mitigar ataques de cadena de suministro (scripts de instalación maliciosos, paquetes recién publicados sin revisar). Si `pnpm install` bloquea algún script de build, revísalo con:
```bash
pnpm approve-builds
```
Aprueba solo paquetes que reconozcas como legítimos.

## Estructura del proyecto
 
```
src/
  app/                  ← rutas (Expo Router)
    _layout.tsx         ← layout raíz: AuthProvider + Stack.Protected
    (auth)/             ← grupo: pantallas de login/registro (sin sesión)
      _layout.tsx
      login.tsx
      registro.tsx
    (tabs)/             ← grupo: pantallas con sesión activa, navegación por pestañas
      _layout.tsx
      index.tsx         ← Home
      explore.tsx
  components/           ← componentes
  contexts/             ← estado compartido entre pantallas (Providers + hooks useX())
    AuthContext.tsx     ← sesión, JWT, persistencia en SecureStore
  constants/
  hooks/
```
## Estado actual
 
- ✅ Story 4.2 (T-36, T-37, T-38) — Splash, Login, Registro
- ✅ Story 4.3 — T-39 (`AuthContext`)
- ⬜ Story 4.3 — T-40 (pantalla de Perfil), T-41 (endpoint `PATCH /usuarios/perfil`)
- ⬜ Resto del backlog (catálogo, reservas, pagos, administración)
## Pendientes abiertos
 
- Confirmar con el equipo de backend si `/auth/login` y `/auth/registro` ya existen, y el contrato real de request/response (actualmente el frontend asume `{ token, usuario }`).
- `.env` con `EXPO_PUBLIC_API_URL` todavía no configurado — el código usa un placeholder (`http://localhost:3000`).
---
*Este README se actualiza conforme avanza el proyecto, story por story.*