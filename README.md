# RIU Frontend — Gestión de Superhéroes
Aplicación SPA desarrollada como prueba técnica. Permite gestionar un catálogo de superhéroes con operaciones CRUD completas, búsqueda con paginación y navegación entre vistas.

---
## Tecnologías
- **Angular 20** — standalone components, Signals, OnPush
- **Angular Material 20** — componentes UI
- **Tailwind CSS v4** — layout, spacing y utilidades
- **RxJS 7** — programación reactiva
- **Karma + Jasmine** — tests unitarios
- **ESLint + angular-eslint** — análisis estático
- **TypeScript 5.8**

---
## Requisitos previos
- Node.js >= 20
- npm >= 10

---
## Instalación
```
npm install
```

---
## Ejecución local
```
npm start
```

La aplicación se abre automáticamente en `http://localhost:4200`.

---
## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Servidor de desarrollo con apertura automática |
| `npm run build` | Build de producción en `dist/` |
| `npm run test` | Tests en modo watch (navegador) |
| `npm run test:ci` | Tests en modo headless (CI) |
| `npm run test:coverage` | Tests con informe de cobertura |
| `npm run lint` | Análisis estático del código |

---

## Arquitectura

```
src/
  app/
    core/
      interceptors/       # loading.interceptor, mock-backend.interceptor
      services/           # HeroService, HeroStore, LoadingService
    features/
      heroes/
        hero-list/        # Listado, búsqueda y paginación
        hero-form/        # Formulario de creación y edición
    models/               # Hero, Universe, PageResult
    shared/
      components/         # ConfirmDialogComponent
      directives/         # UppercaseDirective
```

La aplicación sigue una estructura por funcionalidad (feature-based). Todos los componentes son standalone.

---

## Decisiones técnicas

**Mock backend mediante interceptor HTTP**
No existe backend real. Las peticiones HTTP son interceptadas por `MockBackendInterceptor`, que opera contra un store en memoria (`HeroStore`) basado en Signals. Esto permite simular latencia de red y mantener la misma interfaz de servicio que tendría un backend real.

**Signals + ChangeDetectionStrategy.OnPush**
Todo el estado reactivo de los componentes se gestiona con Angular Signals. Combinado con OnPush, se minimizan los ciclos de detección de cambios innecesarios.

**Búsqueda normalizada**
La búsqueda elimina diacríticos antes de comparar (`normalize('NFD')`), de forma que buscar "heroe" encuentra "Héroe" y viceversa.

**Directiva `appUppercase`**
Convierte a mayúsculas en tiempo real el campo de nombre de superhéroe, conservando la posición del cursor durante la edición.

**Paginación con salto directo**
El paginador de Angular Material se complementa con un input numérico que permite saltar directamente a cualquier página. El estado del paginador se reajusta automáticamente cuando se elimina el último elemento de una página.

---

## Supuestos del proyecto

- Los datos son efímeros: se pierden al recargar la página (store en memoria).
- No existe autenticación ni autorización.
- La búsqueda opera sobre `name` (nombre real) y `heroName` (nombre de superhéroe).
- El campo `power` se trata como texto libre.
- Los universos disponibles son: Marvel, DC y Other.

---

## Autor

Luis Orlando Batista Cejas
