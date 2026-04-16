# Plan to Fix Navigation Path Issue

## Problem
JavaScript files use relative paths that break when executed from HTML files in `src/views/`.

## Solution
Change all navigation paths to absolute paths (starting with `/`).

## Files to Fix

### 1. src/scripts/index.js
- [ ] `'src/views/index-admin.html'` → `'/src/views/index-admin.html'`
- [ ] `'src/views/login.html'` → `'/src/views/login.html'`
- [ ] `'src/views/solicitud.html'` → `'/src/views/solicitud.html'`

### 2. src/scripts/login.js
- [ ] `'src/views/index-admin.html'` → `'/src/views/index-admin.html'`
- [ ] `'../../index.html'` → `'/index.html'`
- [ ] Also check other paths in the file

### 3. src/scripts/registro.js
- [ ] `'src/views/login.html'` → `'/src/views/login.html'`

### 4. src/scripts/index-admin.js
- [ ] `'src/views/agregarmascota.html'` → `'/src/views/agregarmascota.html'`
- [ ] `'../../index.html'` → `'/index.html'`

### 5. src/scripts/solicitudenviada.js
- [ ] `'../index.html'` → `'/index.html'`

### 6. src/scripts/perfiladmi.js
- [ ] `"../index.html"` → `"/index.html"`

### 7. src/scripts/nosotros.js
- [ ] `'../index.html'` → `'/index.html'`

### 8. src/scripts/nosotros-admi.js
- [ ] `'../index.html'` → `'/index.html'`

### 9. src/scripts/mis-visitas.js
- [ ] `'../index.html'` → `'/index.html'`

### 10. src/scripts/comoadoptar.js
- [ ] `'../index.html'` → `'/index.html'`

### 11. Other JS files - Check and fix any remaining relative paths
