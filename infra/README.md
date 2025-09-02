# Mini-Lab OTT (CDN + DRM + Observabilidad)

## 1) Requisitos
- Docker y Docker Compose (WSL2/Ubuntu, macOS o Linux).
- Puertos libres: 8080, 8081, 5000, 9090, 9093, 3000, 9113.

## 2) Levantar el lab
```bash
docker compose up -d
./scripts/api-monitor.sh
```

## 3) Probar CDN (edge + origin)
```bash
# primer request -> MISS
curl -I http://localhost:8080/videos/sample.txt

# segundo request -> HIT (cabecera X-Cache-Status)
curl -I http://localhost:8080/videos/sample.txt

# estado de nginx para exporter
curl http://localhost:8080/stub_status
```

## 4) Probar DRM
```bash
# token
curl -s -X POST http://localhost:5000/api/token -H "Content-Type: application/json" -d '{"user_id":"u1","subscription_tier":"premium"}' | jq -r .token > token.txt

# licencia (usa el token)
TOKEN=$(cat token.txt)
curl -s -X POST http://localhost:5000/api/drm/license   -H "Authorization: Bearer $TOKEN"   -H "Content-Type: application/json"   -d '{"videoId":"video_123"}' | jq
```

## 5) Observabilidad
- Prometheus: http://localhost:9090
  - Targets: `exporter:9113` (nginx), `drm:5000` (`/metrics`)
- Grafana: http://localhost:3000 (admin / admin123)
  - Dashboard importado: **OTT Mini Lab** (Nginx + DRM)
- Alertmanager: http://localhost:9093 (config placeholder)

## 6) Variables y ajustes
- Cambiar `DRM_SECRET` en `docker-compose.yml` (servicio `drm`).
- Ajustar límites de cache en `edge/nginx.conf` (`proxy_cache_path ...`).

## 7) Limpieza
```bash
docker compose down -v
```

## 8) Troubleshooting rápido
- Ver logs:
```bash
docker compose logs -f edge origin drm prometheus exporter grafana alertmanager
```
- Verificar puertos ocupados en host (WSL2):
```bash
ss -tulpn | grep -E ':8080|:8081|:5000|:9090|:9093|:3000|:9113'
```

¡Listo! Tenés CDN con caching, DRM con métricas, exportador de Nginx y stack de monitoreo funcionando.
