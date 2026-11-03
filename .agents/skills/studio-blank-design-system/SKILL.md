---
name: studio-blank-design-system
description: >-
  Use this skill when designing or implementing user interfaces following the StudioBlank Design System:
  an ultra-minimal, monochromatic, flat design system where whitespace is the primary feature,
  all elements have 0px border-radius (radius-none), no shadows are used, and typography relies on
  Inter and IBM Plex Mono with strict geometric grids.
---

# StudioBlank Design System

## Overview

**StudioBlank** es un sistema de diseño ultra-minimalista donde el espacio en blanco (*whitespace*) es la característica visual principal. Construido específicamente para portafolios de fotógrafos, artistas visuales y aplicaciones de alta estética editorial, cada elemento de UI se retrae visualmente para que la obra o el contenido comande toda la atención.

Principios cardinales:
- **Zero Border Radius**: Cero bordes redondeados (`0px`). Geometría pura y ortogonal en todos los componentes.
- **Zero Elevation / Zero Shadows**: No se usan sombras (`box-shadow: none`). La profundidad se comunica exclusivamente por capas, espaciado y contraste de bordes.
- **Paleta Monocromática**: Alto contraste blanco/negro/zinc con peso tipográfico (contrastes de peso 300 vs 700 en Inter).
- **Espaciado Generoso**: Mínimo 64px entre secciones principales para otorgar respiración visual absoluta.

---

## 1. Design Tokens

### 1.1 Colores y Superficies

```css
:root {
  /* Brand & Core */
  --color-primary: #0A0A0A;       /* Texto principal, acciones activas, bordes oscuros */
  --color-secondary: #FAFAFA;     /* Fondos principales, superficies inversas */
  --color-tertiary: #D4D4D8;      /* Divisores sutiles, bordes inactivos */

  /* Surfaces */
  --surface-base: #FAFAFA;        /* Fondo base de página */
  --surface-card: #FFFFFF;        /* Superficie de tarjetas e inputs */
  --surface-inverse: #0A0A0A;     /* Secciones oscuras, pie de página */
  --surface-muted: #F4F4F5;       /* Hover de listas y fondos deshabilitados */

  /* Semantic Feedback */
  --color-success: #16A34A;       /* Carga completada */
  --color-warning: #CA8A04;       /* Advertencias de almacenamiento */
  --color-error: #DC2626;         /* Errores de validación */
  --color-info: #71717A;          /* Notas informativas y texto secundario */
  --color-disabled-text: #A1A1AA; /* Texto deshabilitado */
  --color-border-hover: #A1A1AA;  /* Borde en hover */
}
```

### 1.2 Tipografía

- **Headline Font**: `Inter`, sans-serif
- **Body Font**: `Inter`, sans-serif
- **Mono Font**: `'IBM Plex Mono'`, monospace

| Token Tipográfico | Fuente / Peso | Tamaño | Line Height | Uso Canónico |
| :--- | :--- | :--- | :--- | :--- |
| `text-hero` | Inter Bold (700) | 64px | 1.05 | Títulos de impacto en portada |
| `text-h1` | Inter Bold (700) | 40px | 1.1 | Encabezados de página de nivel 1 |
| `text-h2` | Inter SemiBold (600) | 28px | 1.2 | Títulos de secciones |
| `text-h3` | Inter SemiBold (600) | 20px | 1.3 | Subtítulos de módulos o cards |
| `text-body` | Inter Light (300) | 16px | 1.65 | Texto de lectura y párrafos |
| `text-body-sm` | Inter Regular (400) | 14px | 1.6 | Controles de formulario y labels |
| `text-caption` | Inter Regular (400) | 12px | 1.5 | Metadatos y notas al pie |
| `text-mono` | IBM Plex Mono Regular (400) | 13px | 1.5 | Identificadores, fechas, datos técnicos |

### 1.3 Espaciado (Escala Base: 16px)

El espaciado amplio y deliberado es el pilar de StudioBlank:

| Token | Valor | Aplicación Recomendada |
| :--- | :--- | :--- |
| `space-1` | 4px | Espaciados mínimos inline |
| `space-2` | 8px | Separación icono a label |
| `space-3` | 16px | Brecha estándar entre elementos contiguos |
| `space-4` | 32px | Separación entre grupos de controles |
| `space-5` | 48px | Padding interno de secciones |
| `space-6` | 64px | Separación entre bloques o artículos |
| `space-8` | 96px | Divisiones mayores a nivel de página |
| `space-10` | 128px | Márgenes superior e inferior en Hero sections |

### 1.4 Bordes y Elevación (Bordes Rectos y Flat)

- **`radius-none`**: `0px`. Todos los componentes utilizan esquinas estrictamente rectas. Queda prohibido `border-radius: 4px`, `8px` o redondeos en botones, tarjetas, inputs o badges.
- **`shadow-none`**: `none`. Cero sombras paralelas.
- **Focus Indicator**: Los estados de foco (`:focus-visible`) utilizan un contorno de borde o un outline de `2px solid #0A0A0A` con un offset de `2px` (`outline-offset: 2px`), en lugar de anillos de sombra (*box-shadow ring*).

---

## 2. Especificación de Componentes

### 2.1 Botones (`Buttons`)
Rectángulos de borde afilado con esquinas en `0px`. El estado hover se comunica invirtiendo fondo y texto, sin transiciones lentas (máximo 150-200ms o instantáneo).

#### Variantes:
- **Primary**:
  - Fill: `#0A0A0A`
  - Text: `#FAFAFA`
  - Border: `none`
  - Hover: Fill `#27272A`
- **Secondary**:
  - Fill: `transparent`
  - Text: `#0A0A0A`
  - Border: `1px solid #0A0A0A`
  - Hover: Fill `#0A0A0A`, Text `#FAFAFA`
- **Ghost**:
  - Fill: `transparent`
  - Text: `#0A0A0A`
  - Border: `none`
  - Hover: Fill `#F4F4F5`
- **Destructive**:
  - Fill: `#DC2626`
  - Text: `#FAFAFA`
  - Border: `none`
  - Hover: Fill `#B91C1C`

#### Tamaños:
- **Small**: Altura 32px, padding horizontal 16px, font-size 12px, min-width 64px.
- **Medium**: Altura 40px, padding horizontal 24px, font-size 14px, min-width 96px.
- **Large**: Altura 48px, padding horizontal 32px, font-size 16px, min-width 128px.

#### Estado Deshabilitado:
- Opacidad `0.3`, `cursor: not-allowed`, sin eventos de hover ni transiciones.

---

### 2.2 Tarjetas (`Cards`)
- **Fondo**: `#FFFFFF`
- **Borde**: `1px solid #E5E5E5`
- **Forma**: Cuadrada o rectangular ortogonal (`0px radius`)
- **Sombra**: `none`
- **Padding en Cards de Imagen**: `0px`. La fotografía o imagen sangra directamente hasta los bordes de la tarjeta. Los metadatos o pie de foto se ubican inmediatamente debajo con una separación `space-3` (16px).
- **Hover**: El borde conmuta a `1px solid #0A0A0A`.

---

### 2.3 Entradas de Texto (`Inputs`)
- **Altura estándar**: 40px
- **Tipografía**: Inter 14px Regular (400)
- **Border radius**: `0px`
- **Variantes de Borde**: Borde perimetral de 1px o variante minimalista de borde inferior únicamente (`border-bottom: 1px`).

#### Estados:
- **Default**: Borde `#D4D4D8`, fondo `#FFFFFF`, sombra `none`.
- **Hover**: Borde `#A1A1AA`, fondo `#FFFFFF`.
- **Focus**: Borde `2px solid #0A0A0A` (o outline offset 2px), fondo `#FFFFFF`.
- **Error**: Borde `#DC2626`, fondo `#FFFFFF`.
- **Disabled**: Borde `#E5E5E5`, fondo `#F4F4F5`, texto `#A1A1AA`, cursor `not-allowed`.

---

### 2.4 Chips e Indicadores

#### Filter Chips:
- **Altura**: 28px, `border-radius: 0px`, tipografía Inter 12px Regular con tracking mayúsculo `0.05em`.
- **Default**: Fondo `transparent`, texto `#71717A`, borde `1px solid #D4D4D8`.
- **Selected**: Fondo `#0A0A0A`, texto `#FAFAFA`, borde `1px solid #0A0A0A`.
- **Hover**: Fondo `#F4F4F5`, texto `#0A0A0A`, borde `1px solid #A1A1AA`.

#### Status Chips:
- **Published**: Fondo `#0A0A0A`, texto `#FAFAFA`, sin borde.
- **Draft**: Fondo `transparent`, texto `#71717A`, borde `1px solid #D4D4D8`.
- **Archived**: Fondo `#F4F4F5`, texto `#A1A1AA`, sin borde.
- **Featured**: Fondo `transparent`, texto `#0A0A0A`, borde `1px solid #0A0A0A`.

---

### 2.5 Listas (`Lists`)
- **Altura de fila**: 48px
- **Padding horizontal**: 16px
- **Divisor**: `1px solid #F4F4F5`
- **Hover background**: `#F4F4F5`
- **Active background**: `#0A0A0A` con texto en `#FFFFFF`
- **Geometría**: Filas cuadradas (`0px radius`), tipografía Inter 14px Regular.

---

### 2.6 Casillas de Verificación (`Checkboxes`)
- **Dimensiones**: 18px $\times$ 18px, `border-radius: 0px`.
- **Unchecked**: Fondo `#FFFFFF`, borde `1px solid #D4D4D8`.
- **Checked**: Fondo `#0A0A0A`, borde `1px solid #0A0A0A`, marca de verificación `#FAFAFA`.
- **Disabled**: Fondo `#F4F4F5`, borde `1px solid #E5E5E5`, marca `#A1A1AA`.
- **Focus**: `outline: 2px solid #0A0A0A`, `outline-offset: 2px`.

---

### 2.7 Botones de Radio (`Radio Buttons`)
- **Dimensiones**: 18px $\times$ 18px (o marco cuadrado estricto con selector central).
- **Diámetro del punto interior**: 8px.
- **Unselected**: Fondo `#FFFFFF`, borde `1px solid #D4D4D8`.
- **Selected**: Fondo `#FFFFFF`, borde `1px solid #0A0A0A`, punto interior `#0A0A0A`.
- **Disabled**: Fondo `#F4F4F5`, borde `1px solid #E5E5E5`, punto `#A1A1AA`.
- **Focus**: `outline: 2px solid #0A0A0A`, `outline-offset: 2px`.

---

### 2.8 Tooltips
- **Fondo**: `#0A0A0A`
- **Texto**: `#FAFAFA`, 12px Inter 400
- **Padding**: 8px vertical, 12px horizontal
- **Geometría**: Caja cuadrada (`border-radius: 0px`), ancho máximo 200px, flecha triangular de 6px.
- **Timing**: Aparición a los 200ms, ocultado inmediato (0ms), sombra `none`.

---

## 3. Guía de Do's and Don'ts (Reglas Innegociables)

1. **DO**: Deja que las imágenes hablen por sí solas. La obra visual es el diseño; la interfaz debe desaparecer en segundo plano.
2. **DON'T**: No agregues elementos decorativos como gradientes de color, texturas, patrones ornamentales o ilustraciones recargadas.
3. **DO**: Utiliza márgenes generosos (mínimo 64px entre secciones principales, hasta 128px en cabeceras) para crear respiración visual.
4. **DON'T**: No introduzcas más de un color de acento semántico en toda la aplicación. El monocromatismo es la identidad de la marca.
5. **DO**: Reduce el cromo de la interfaz al mínimo estricto. La navegación debe ser limpia y sutil.
6. **DON'T**: No utilices bordes redondeados (`border-radius > 0px`), sombras paralelas (`box-shadow`), ni efectos de pseudo-profundidad 3D. El sistema es plano y ortogonal.
7. **DO**: Establece la jerarquía tipográfica mediante el contraste de peso de la fuente `Inter` (peso 300 Light vs 700 Bold) en lugar de depender únicamente de escalas masivas de tamaño.
8. **DON'T**: No superpongas texto sobre las imágenes a menos que sea estrictamente indispensable. La integridad visual de la fotografía es prioritaria.
9. **DO**: Prioriza el rendimiento de carga y utiliza transiciones de fade-in muy sutiles para el renderizado progresivo de galerías.
10. **DON'T**: No implementes animaciones o transiciones que duren más de 200ms. Todo movimiento debe ser conciso, sutil e instantáneo.
