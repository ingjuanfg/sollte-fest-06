# Sollte Fest - Sistema de Resultados

Sistema web para mostrar y gestionar los resultados de la competencia Sollte Fest en tiempo real.

## 🚀 Características

- **Visualización en tiempo real** de resultados por categoría
- **Ordenamiento automático** de menor a mayor puntos (mejor puntuación primero)
- **Recálculo de totales** opcional para verificar puntuaciones
- **Interfaz responsiva** que funciona en dispositivos móviles y desktop
- **Diseño moderno** con colores de la bandera colombiana
- **Carga dinámica** de archivos CSV desde la carpeta `data/`

## 📁 Estructura del Proyecto

```
competencia-solltefest/
├── index.html          # Página principal
├── app.js             # Lógica de la aplicación
├── style.css          # Estilos CSS
├── assets/            # Imágenes y recursos
│   ├── logo.png       # Logo principal
│   └── logo_big.png   # Logo grande para hero
├── data/              # Archivos CSV de resultados
│   ├── Principiante HH.csv
│   ├── Principiante MM.csv
│   ├── Intermedio HH.csv
│   ├── Intermedio MM.csv
│   ├── RX.csv
│   └── Sollte Fest.csv
└── README.md          # Este archivo
```

## 📊 Formato de los Archivos CSV

Los archivos CSV deben tener el siguiente formato:

```csv
Equipo,WOD 1,WOD 2A,WOD 2B,WOD 3,WOD 4 Semifinal,WOD 5 Final,TOTAL
Equipo A,1,2,1,3,2,1,10
Equipo B,2,1,2,1,3,2,11
```

### Columnas Requeridas:
- **Equipo**: Nombre del equipo o participantes
- **WOD 1-5**: Puntuaciones de cada WOD (Workout of the Day)
- **TOTAL**: Puntuación total (opcional, se puede recalcular)

## 🛠️ Instalación y Uso

1. **Clona o descarga** el proyecto
2. **Abre** `index.html` en tu navegador web
3. **Selecciona** la categoría que deseas ver
4. **Usa** el botón de recarga para actualizar datos
5. **Activa** "Recalcular Total" para verificar puntuaciones

## ⚙️ Configuración

### Agregar Nuevas Categorías

Edita el objeto `CSV_LOCAL` en `app.js`:

```javascript
const CSV_LOCAL = {
    "Nueva Categoría": "data/nueva_categoria.csv",
    // ... otras categorías
};
```

### Modificar Columnas WOD

Edita el array `WOD_COLUMNS` en `app.js`:

```javascript
const WOD_COLUMNS = ["wod1", "wod2a", "wod2b", "wod3", "wod4", "wod5"];
```

## 🎨 Personalización

### Colores

Los colores se pueden modificar en las variables CSS en `style.css`:

```css
:root {
    --accent: #f7d23e;        /* Color principal */
    --accent-dark: #d8b22d;   /* Color secundario */
    --flag-yellow: #f7d23e;   /* Amarillo bandera */
    --flag-blue: #0038a8;     /* Azul bandera */
    --flag-red: #ce1126;      /* Rojo bandera */
}
```

### Logo

Reemplaza los archivos en la carpeta `assets/`:
- `logo.png` - Logo pequeño para el header
- `logo_big.png` - Logo grande para la sección hero

## 📱 Responsividad

El sistema está optimizado para:
- **Desktop**: Pantallas grandes con tabla completa
- **Tablet**: Diseño adaptativo con controles reorganizados
- **Mobile**: Vista móvil con scroll horizontal en la tabla

## 🔧 Funcionalidades Técnicas

- **Parsing CSV**: Manejo robusto de archivos CSV con comillas y caracteres especiales
- **Ordenamiento**: Algoritmo de ordenamiento de menor a mayor puntos
- **Caché**: Evita problemas de caché del navegador
- **Error Handling**: Manejo de errores con mensajes informativos
- **Loading States**: Indicadores de carga para mejor UX

## 🐛 Solución de Problemas

### Error "HTTP 404"
- Verifica que los archivos CSV existan en la carpeta `data/`
- Confirma que los nombres de archivo coincidan con la configuración

### Datos no se muestran
- Revisa el formato del CSV
- Asegúrate de que no haya caracteres especiales problemáticos
- Verifica la consola del navegador para errores

### Problemas de ordenamiento
- Los datos se ordenan de menor a mayor puntos
- Los valores vacíos se muestran como "–"
- Los totales se calculan automáticamente si activas "Recalcular Total"

## 📄 Licencia

© 2024 Sollte Fest. Todos los derechos reservados.

## 🤝 Contribuciones

Para contribuir al proyecto:
1. Haz fork del repositorio
2. Crea una rama para tu feature
3. Realiza tus cambios
4. Envía un pull request

---

**Desarrollado con ❤️ para Sollte Fest** 