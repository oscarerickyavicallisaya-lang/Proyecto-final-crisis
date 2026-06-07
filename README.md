# CrisisCalc — Simulador Económico Interactivo

> Proyecto final de Programación Web I — Universidad Mayor de San Andrés (UMSA), 2025

## 📋 Descripción

**CrisisCalc** es una página web interactiva educativa que simula situaciones económicas reales que afectan el abastecimiento, los precios y el poder adquisitivo de las familias bolivianas. Permite a cualquier usuario ingresar datos y visualizar el impacto de diferentes variables económicas en tiempo real.

## 🎯 Objetivo

Aplicar los fundamentos de Programación Web I para desarrollar una aplicación funcional, responsiva e interactiva que modele matemáticamente problemas económicos cotidianos mediante HTML5, CSS3 y JavaScript con manipulación del DOM.

## ⚙️ Tecnologías utilizadas

| Tecnología | Uso |
|-----------|-----|
| **HTML5** | Estructura semántica con etiquetas `header`, `nav`, `main`, `section`, `article`, `footer` |
| **CSS3** | Estilos responsivos con Grid, Flexbox, animaciones y media queries |
| **JavaScript (ES6+)** | Lógica de cálculo, validaciones y eventos |
| **DOM API** | Captura de datos, modificación dinámica de contenido y resultados |
| **Google Fonts** | Tipografías Bebas Neue, DM Sans y DM Mono |

## 🗂️ Estructura del proyecto

```
proyecto-web-crisis/
│
├── index.html          ← Estructura HTML5 semántica
│
├── css/
│   └── estilos.css     ← Todos los estilos (responsivo, colores, animaciones)
│
├── js/
│   └── script.js       ← Lógica JavaScript y manipulación del DOM
│
├── img/                ← Carpeta de imágenes (reservada)
│
└── README.md           ← Este archivo
```

## 🧮 Simuladores incluidos

### Escenario A — Carburante
Calcula cuántos días durará la reserva de una estación de servicio. Muestra una tabla día a día e indica cuándo llega al nivel crítico.

**Modelo matemático:**
```
Reserva(día n) = Reserva(día n-1) + Reabastecimiento - Consumo
```

### Escenario B — Precios de Alimentos
Calcula el aumento del gasto familiar ante el alza de precios de la canasta básica.

**Modelo matemático:**
```
Porcentaje de aumento = ((Precio actual - Precio anterior) / Precio anterior) × 100
Gasto total = Σ (Precio actual × Cantidad × Semanas)
```

### Escenario C — Transporte
Estima el costo adicional cuando hay bloqueos o desvíos en las rutas.

**Modelo matemático:**
```
Costo adicional semanal = (Distancia desvío - Distancia normal) × Costo/km × Viajes/semana
```

### Escenario D — Compras Familiares
Verifica si el presupuesto familiar alcanza para cubrir la lista de compras.

**Modelo matemático:**
```
Total compra = Σ (Precio × Cantidad)
Saldo = Presupuesto - Total compra
```

### Escenario E — Escasez por Rumor
Simula cómo los rumores de escasez generan compras por pánico y agotan el stock.

**Modelo matemático:**
```
Nueva demanda = Demanda normal + Demanda normal × (Porcentaje aumento / 100)
Stock restante = Stock disponible - Nueva demanda
```

### Escenario F — Poder Adquisitivo
Calcula la pérdida del poder de compra cuando los precios suben pero el salario no.

**Modelo matemático:**
```
Pérdida poder adquisitivo (%) = ((Gasto actual - Gasto anterior) / Gasto anterior) × 100
Saldo actual = Ingreso - Gasto actual
```

## 📊 Casos de estudio incluidos

| # | Escenario | Resultado esperado |
|---|-----------|-------------------|
| 1 | Reserva de carburante (10,000 L, consumo 1,200 L/día, reabasto 300 L/día, crítico 2,000 L) | Nivel crítico ~día 9 |
| 2 | Alza de precios (Arroz, Papa, Aceite) | Gasto sube de 206 Bs a 302 Bs (+46.6%) |
| 3 | Transporte con desvío (10 km → 16 km, 2 Bs/km, 5 viajes/sem) | +60 Bs/semana, +240 Bs/mes |
| 4 | Presupuesto 500 Bs, compra 580 Bs | No alcanza, faltan 80 Bs |
| 5 | Demanda 100 u., pánico +40%, stock 120 u. | Nueva demanda 140 u. — stock insuficiente |

## ✅ Características técnicas

- **HTML5 semántico** con etiquetas correctas
- **CSS externo** separado del HTML
- **JavaScript externo** separado del HTML  
- **Diseño responsivo** con media queries para móvil, tablet y escritorio
- **Paleta de colores coherente**: negro carbón, amarillo crisis, rojo alerta, verde ok
- **Formularios interactivos** con validación de campos
- **Resultados dinámicos** con tablas, métricas y barras de progreso
- **Código comentado** y organizado por secciones
- **Animaciones CSS** y efectos de scroll con IntersectionObserver

## 📝 Materia

- **Materia:** Programación Web I  
- **Universidad:** Universidad Mayor de San Andrés (UMSA)  
- **Carrera:** Informática  
- **Gestión:** 2025

---
*Proyecto educativo — No representa postura política alguna.*
