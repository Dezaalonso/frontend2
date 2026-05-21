# DACOM Admin Panel

Panel de administración separado del frontend principal.

## Setup

```bash
cd admin-panel
npm install
npm run dev
```

Corre en http://localhost:5174

## Antes de usar

1. En `src/components/api.js` cambia la IP:
   ```js
   export const API = "http://TU_IP_EC2:8000";
   ```

2. En tu backend, asegúrate de tener `ADMIN_API_KEY` en tu `.env` o `docker-compose.yml`:
   ```
   ADMIN_API_KEY=tu_clave_secreta
   ```

3. Al abrir el panel te pedirá esa clave para ingresar.

## Páginas

- **Dashboard** — estadísticas del sistema, refresh de cache, reset de placeholders
- **Productos** — tabla con todos los productos, cambiar imagen (upload local), mover a grupo
- **Ofertas** — crear, activar/desactivar, eliminar promociones
- **Contacto** — editar teléfono, WhatsApp, email, dirección, redes sociales, horario

## Grupos personalizados

En la página Productos puedes mover cualquier producto a un grupo diferente:
- Grupos existentes: Drinks, Snacks, Chocolates, Galletas, etc.
- Grupos nuevos que puedes crear: Nuevos, Destacados, Ofertas, Importados, etc.

El grupo se muestra en el frontend principal automáticamente.

## Imágenes manuales

Las imágenes subidas manualmente desde el admin tienen `is_manual = TRUE` en la DB.
El worker automático **nunca sobreescribe** imágenes manuales.
