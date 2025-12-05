# ✨ To-Do Pro - Aplicación de Lista de Tareas Avanzada

## 📋 Descripción

**To-Do Pro** es una aplicación web moderna y completa de gestión de tareas con más de 15 funcionalidades avanzadas. Diseñada con un estilo minimalista y profesional, ofrece todas las herramientas necesarias para una productividad óptima.

La aplicación es completamente frontend, no requiere servidor backend y se ejecuta directamente en el navegador. Utiliza LocalStorage para persistir todos los datos entre sesiones.

## ✨ Características Principales

### 🎯 Gestión de Tareas
- **Crear Tareas**: Agrega tareas con texto, categoría, prioridad, fecha de vencimiento y etiquetas
- **Editar Tareas**: Modifica el texto de las tareas con un solo clic
- **Completar Tareas**: Marca tareas como completadas con animación de confetti
- **Eliminar Tareas**: Elimina tareas individuales o todas las completadas
- **Prioridades**: Sistema de 3 niveles (Alta 🔴, Media 🟡, Baja 🟢) con bordes de color
- **Categorías**: Personal, Trabajo, Urgente con badges de colores

### 🔍 Búsqueda y Filtrado
- **Búsqueda en Tiempo Real**: Filtra tareas por texto, notas o etiquetas
- **Filtros Múltiples**: Todo, Pendiente, Completado, Urgente, Alta Prioridad
- **Ordenamiento**: Manual (drag & drop), por fecha, prioridad, categoría o creación

### 📝 Funciones Avanzadas
- **Subtareas**: Agrega subtareas con barra de progreso visual
- **Notas Detalladas**: Añade descripciones extensas a cada tarea
- **Etiquetas Personalizadas**: Sistema flexible de tags con separación por comas
- **Tareas Recurrentes**: Crea tareas que se repiten diaria, semanal o mensualmente
- **Drag & Drop**: Reordena tareas manualmente arrastrándolas

### 📊 Estadísticas y Productividad
- **Dashboard de Estadísticas**: 
  - Tareas completadas hoy
  - Tareas completadas esta semana
  - Total de tareas completadas
  - Racha de días consecutivos 🔥
- **Timer Pomodoro**: 
  - Sesiones de 25 minutos de trabajo
  - Descansos de 5 minutos
  - Contador de sesiones completadas

### 📅 Vista de Calendario
- **Calendario Mensual**: Visualiza tareas por fecha
- **Navegación**: Avanza o retrocede entre meses
- **Indicadores Visuales**: Días con tareas destacados
- **Click para Asignar**: Selecciona fechas directamente desde el calendario

### 💾 Exportar e Importar
- **Exportar JSON**: Backup completo con todos los detalles
- **Exportar CSV**: Compatible con Excel (UTF-8 con BOM, separador punto y coma)
- **Importar Tareas**: Carga tareas desde archivos JSON
- **Backup Completo**: Respalda todos los datos (tareas, estadísticas, configuración)

### 🎨 Diseño y Personalización
- **Modo Claro/Oscuro**: 
  - Modo claro: Blanco limpio y minimalista
  - Modo oscuro: Negros y grises puros (sin tonos azules)
- **Diseño Moderno**: Bordes suaves, sombras sutiles, efectos hover elegantes
- **Totalmente Responsive**: Adaptable a móviles, tablets y escritorio
- **Animaciones Suaves**: Transiciones fluidas en todas las interacciones

### 🔔 Notificaciones
- **Notificaciones del Navegador**: Alertas para tareas próximas a vencer
- **Configuración Personalizable**: Elige cuándo recibir notificaciones (15 min, 30 min, 1 hora, 1 día antes)
- **Celebraciones**: Confetti animado al completar tareas

### 🔗 Compartir
- **Generar Enlaces**: Crea enlaces para compartir tareas
- **Copiar al Portapapeles**: Comparte fácilmente con un clic

### ⚙️ Configuración
- **Habilitar/Deshabilitar Notificaciones**
- **Ajustar Timing de Notificaciones**
- **Activar/Desactivar Sonidos**
- **Controlar Efectos de Confetti**
- **Backup y Restauración de Datos**

## 🛠️ Tecnologías Utilizadas

- **HTML5**: Estructura semántica moderna
- **CSS3**: 
  - Variables CSS para temas
  - Flexbox y Grid para layouts
  - Animaciones y transiciones suaves
  - Diseño responsive
- **JavaScript (Vanilla ES6+)**: 
  - Manipulación del DOM
  - LocalStorage para persistencia
  - Eventos y delegación
  - Módulos y funciones puras
- **Librerías Externas**:
  - [SortableJS](https://sortablejs.github.io/Sortable/) - Drag and drop
  - [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) - Animaciones de celebración
- **Fuentes**: System fonts (-apple-system, Segoe UI, Roboto) para aspecto nativo

## 🚀 Instalación y Ejecución

### Opción 1: Abrir Directamente
1. Clona o descarga el repositorio
2. Abre `index.html` en cualquier navegador moderno
3. ¡Listo! No requiere instalación ni servidor

### Opción 2: Servidor Local (Opcional)
```bash
# Con Python 3
python -m http.server 8000

# Con Node.js (npx)
npx serve

# Luego abre http://localhost:8000
```

### Demo en Vivo
🌐 [https://eliassxv16.github.io/todolist/](https://eliassxv16.github.io/todolist/)

## 📁 Estructura de Archivos

```
Todolist/
├── index.html          # Estructura HTML principal
├── styles.css          # Estilos y diseño moderno
├── script.js           # Lógica de la aplicación
├── README.md           # Este archivo
└── img/                # Capturas de pantalla
    ├── claro.png
    └── oscuro.png
```

## 📸 Capturas de Pantalla

### Vista Principal (Modo Claro)
![Vista Principal Clara](/img/claro.png)

### Vista con Tareas (Modo Oscuro)
![Vista con Tareas Oscuro](/img/oscuro.png)

## 🎯 Uso Rápido

### Crear una Tarea
1. Escribe el texto de la tarea
2. Selecciona prioridad (Alta/Media/Baja)
3. Elige categoría (Personal/Trabajo/Urgente)
4. Opcionalmente: agrega fecha, etiquetas
5. Click en "➕ Agregar"

### Gestionar Tareas
- **✓** - Marcar como completada
- **📝** - Abrir detalles (agregar notas y subtareas)
- **✏️** - Editar texto rápidamente
- **🔗** - Compartir tarea
- **🗑️** - Eliminar tarea

### Atajos de Teclado
- `Enter` en campo de tarea → Agregar tarea
- `Enter` en modo edición → Guardar cambios
- `Enter` en subtarea → Agregar subtarea

## 💡 Consejos de Productividad

1. **Usa Prioridades**: Enfócate en tareas de alta prioridad primero
2. **Aprovecha las Subtareas**: Divide tareas grandes en pasos pequeños
3. **Mantén tu Racha**: Completa al menos una tarea diaria
4. **Usa el Pomodoro**: Trabaja en bloques de 25 minutos
5. **Etiqueta Inteligentemente**: Usa tags para organizar por proyecto o contexto
6. **Revisa Estadísticas**: Motívate viendo tu progreso

## 🔄 Migración de Datos

Si tienes tareas de versiones anteriores, la aplicación las migrará automáticamente al nuevo formato con todas las funcionalidades.

## 🌐 Compatibilidad

- ✅ Chrome/Edge (Chromium) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## 📝 Formato de Datos

### Estructura de Tarea
```javascript
{
  id: 1733410800000,
  text: "Completar proyecto",
  category: "trabajo",
  priority: "high",
  dueDate: "2025-12-10",
  completed: false,
  tags: ["urgente", "importante"],
  subtasks: [
    { id: 123, text: "Paso 1", completed: true },
    { id: 124, text: "Paso 2", completed: false }
  ],
  notes: "Detalles adicionales...",
  recurring: { enabled: true, frequency: "weekly" },
  pomodoroTime: 0,
  createdAt: 1733410800000,
  completedAt: null
}
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Elias Halloumi El Amraoui**

- GitHub: [@eliassxv16](https://github.com/eliassxv16)

## 🙏 Agradecimientos

- [SortableJS](https://sortablejs.github.io/Sortable/) por la funcionalidad de drag & drop
- [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) por las animaciones de celebración
- La comunidad de desarrolladores por el feedback y sugerencias

## 📊 Estadísticas del Proyecto

- **15+ Funcionalidades** implementadas
- **1000+ líneas** de JavaScript
- **1000+ líneas** de CSS
- **100% Vanilla** (sin frameworks pesados)
- **Totalmente Responsive**
- **Modo Oscuro** incluido

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
