# Mini-Lab OTT Web

Plataforma web de pruebas para DRM, CAS, CDN y Observabilidad orientada a servicios OTT (Over-The-Top). 

Construida con Next.js 15, TypeScript, Tailwind CSS y Vercel Postgres, con una UX que emula dashboards estilo Grafana.

## 🚀 Features

### Labs de Pruebas

- **Player Lab**: Pruebas de playback HLS/DASH con métricas QoE (startup time, rebuffer ratio, FPS, errores)
- **DRM/CAS Lab**: Simulación de License Request (Widevine/PlayReady/FairPlay) y validación CAS
- **CDN Lab**: Medición de latencia P95 y throughput P90 contra múltiples URLs
- **Observability Lab**: Dashboard con métricas, logs y trazas (estilo Grafana)

### KPIs Implementados

- DRM Success Rate, License RTT P95, Token Expired Rate
- CAS Reject Rate
- Playback Error Rate, Startup Time P95, Rebuffer Ratio  
- Latencia CDN P95, Throughput P90
- Contadores por tipo de error (4xx, 5xx, CORS, Timeout)

### Características Técnicas

- **Chaos Engineering**: Latencias artificiales, error rates configurables
- **Mock Endpoints**: Serverless functions que simulan servicios reales
- **Métricas Agregadas**: Cálculo de percentiles P50/P90/P95
- **Export/Import**: Resultados en CSV/JSON
- **JWT Auth**: Generación y validación de tokens de prueba
- **Database**: Persistencia en Vercel Postgres con migraciones automáticas

## 🛠 Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Vercel Postgres
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel
- **Auth**: JWT (jsonwebtoken)

## 📦 Instalación y Setup Local

### Prerrequisitos

- Node.js 18+
- npm/yarn/pnpm

### 1. Clonar e instalar dependencias

```bash
git clone <repository-url>
cd web/
npm install
```

### 2. Configurar variables de entorno

Crear `.env.local`:

```env
# Database (se configura automáticamente en Vercel)
POSTGRES_URL="postgres://..."

# JWT para pruebas DRM
JWT_SECRET="your-secret-key-change-in-production"

# Admin key para endpoints protegidos
ADMIN_KEY="admin-local-key"
```

### 3. Desarrollo local

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🚀 Deploy en Vercel

### 1. Preparar el proyecto

Asegúrate que tu estructura sea:
```
tu-repo/
├── web/                 # <- Root para Vercel
│   ├── package.json
│   ├── next.config.ts
│   └── src/
└── infra/              # <- Ignorado por Vercel
```

### 2. Configurar Vercel

1. Conecta tu repositorio en [vercel.com](https://vercel.com)
2. **IMPORTANTE**: Configura el **Root Directory** como `web/`
3. Framework Preset: Next.js
4. Build Command: `npm run build`
5. Output Directory: `.next`

### 3. Provisionar Base de Datos

En tu proyecto de Vercel:

1. Ve a **Storage** → **Create Database**
2. Selecciona **Postgres** 
3. Elige región cercana
4. La variable `POSTGRES_URL` se configurará automáticamente

### 4. Variables de Entorno en Vercel

En **Settings** → **Environment Variables**:

```env
JWT_SECRET=your-production-secret-change-this
ADMIN_KEY=secure-admin-key-for-production
```

### 5. Deploy

```bash
# Desde el directorio web/
npm run build  # verificar que compile

# O push a main/master para auto-deploy
git push origin main
```

### 6. Verificar Deploy

1. Visita tu URL de Vercel
2. Verifica `/api/health` - debería inicializar la DB automáticamente
3. Verifica `/api/kpis` - debería mostrar KPIs default

## 📊 Uso de la Aplicación

### Home Dashboard
- Resumen de KPIs en tiempo real
- Accesos rápidos a los labs
- Contadores de errores por tipo

### Player Lab
```bash
# Prueba manual con curl
curl -X POST https://your-app.vercel.app/api/tests/player \
  -H "Content-Type: application/json" \
  -d '{
    "manifest_url": "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    "drm_enabled": false,
    "headers": {},
    "chaos": {"error_rate": 0, "latency_ms": 0, "enable_rebuffering": false}
  }'
```

### DRM/CAS Lab
```bash
# Generar token JWT
curl -X POST https://your-app.vercel.app/api/jwt/sign \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "subscription_tier": "premium"}'

# Probar licencia DRM
curl -X POST https://your-app.vercel.app/api/tests/drm \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "widevine",
    "video_id": "video_123",
    "token": "eyJ...",
    "chaos": {"latency_ms": 0, "error_rate": 0, "token_expired_rate": 0}
  }'
```

### CDN Lab
```bash
# Benchmark múltiples URLs
curl -X POST https://your-app.vercel.app/api/tests/cdn \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://httpbin.org/delay/1",
      "https://jsonplaceholder.typicode.com/posts/1"
    ],
    "concurrent_requests": 2,
    "timeout_ms": 10000,
    "chaos": {"error_rate": 0, "latency_ms": 0}
  }'
```

## 🔧 API Endpoints

### Core
- `GET /api/health` - Health check + DB init
- `GET /api/kpis?range=1hour` - KPIs agregadas
- `POST /api/jwt/sign` - Generar JWT de prueba

### Tests
- `POST /api/tests/player` - Ejecutar test de player
- `POST /api/tests/drm` - Ejecutar test de DRM
- `POST /api/tests/cas` - Ejecutar test de CAS
- `POST /api/tests/cdn` - Ejecutar benchmark CDN

### Admin (requiere ADMIN_KEY)
- `POST /api/admin/migrate` - Forzar migración DB
- `POST /api/admin/seed` - Generar datos sintéticos

## 📈 Modelo de Datos

### Tests
```sql
CREATE TABLE tests (
  id SERIAL PRIMARY KEY,
  kind VARCHAR(10) CHECK (kind IN ('player','drm','cas','cdn')),
  params JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMP,
  duration_ms INTEGER,
  ok BOOLEAN NOT NULL DEFAULT false
);
```

### Metrics
```sql
CREATE TABLE metrics (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES tests(id),
  name VARCHAR(100) NOT NULL,
  value NUMERIC NOT NULL,
  pctl INTEGER, -- percentile (50, 95, etc.)
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Logs
```sql
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  test_id INTEGER REFERENCES tests(id),
  level VARCHAR(10) CHECK (level IN ('info','warn','error','debug')),
  message TEXT NOT NULL,
  attrs JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 🧪 Testing y Desarrollo

### Ejecutar tests locales
```bash
# Verificar build
npm run build

# Lint
npm run lint

# Test manual de endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/kpis
```

### Estructura de Componentes
```
src/
├── app/
│   ├── api/              # Serverless functions
│   ├── player/           # Player Lab page
│   ├── drm-cas/          # DRM/CAS Lab page  
│   ├── cdn/              # CDN Lab page
│   ├── observability/    # Observability dashboard
│   └── layout.tsx        # Layout con navegación
├── components/           # Componentes reutilizables
│   ├── KpiSummary.tsx
│   ├── ChartCard.tsx
│   └── LogsTable.tsx
└── lib/
    └── db.ts            # Database helpers
```

## 🔍 Troubleshooting

### Database Issues
```bash
# Verificar conexión
curl https://your-app.vercel.app/api/health

# Si falla, revisar POSTGRES_URL en Vercel Settings
```

### Build Errors
```bash
# Verificar dependencias
npm ci
npm run build

# Revisar TypeScript errors
npx tsc --noEmit
```

### Performance Issues
- Los KPIs se cachean por 60 segundos
- Las consultas usan índices optimizados
- Vercel Postgres tiene connection pooling automático

## 🔐 Seguridad

- JWT tokens son stateless y expiran en 2h
- Admin endpoints requieren `ADMIN_KEY`
- Rate limiting natural por Vercel (no implementado explícito)
- Input validation en todos los endpoints
- SQL injection protegido por Vercel Postgres driver

## 📝 Licencia

MIT License - Ver LICENSE file