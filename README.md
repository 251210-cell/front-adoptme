# Adopt-Me - Proyecto Reorganizado

## Estructura de Carpetas

```
Adopt-Me-main/
├── index.html                    # Página principal (entrada)
├── src/
│   ├── assets/
│   │   └── images/              # Imágenes locales
│   ├── components/               # Componentes reutilizables
│   ├── router/                  # Configuración de rutas
│   ├── scripts/                 # Archivos JavaScript
│   ├── services/                # Servicios (auth, utils)
│   │   ├── auth.js              # Autenticación
│   │   └── utils.js             # Utilidades
│   ├── styles/                  # Archivos CSS
│   └── views/                    # Páginas HTML
```

## Rutas Actualizadas

### Desde index.html (raíz)
- CSS: `src/styles/archivo.css`
- JS: `src/scripts/archivo.js`
- Vistas: `src/views/archivo.html`

### Desde src/views/*.html
- CSS: `../styles/archivo.css`
- JS: `../scripts/archivo.js`

### Desde src/scripts/*.js
- Vistas: `src/views/archivo.html` o `../../index.html`

## Credenciales de Prueba

### Administrador
- Email: cualquier@adopt-me.com
- Redirige a: src/views/index-admin.html

### Usuario Normal
- Email: cualquier@otro.com
- Redirige a: index.html

## Notas

- Los archivos mantienen su funcionalidad completa
- Las rutas de navegación entre páginas están actualizadas
- Los servicios de autenticación están centralizados en src/services/
