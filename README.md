# Factura IA — Equipo inteligente animado

Landing del equipo de Factura IA construida con el mismo sistema visual de la página de Rosario, pero con una dirección de arte propia para Rosario, Fátima, Don Héctor y Jaimito.

La versión evita el recurso genérico de “tarjeta SaaS + mockup”. En el hero aparecen únicamente los cuatro asistentes sobre un fondo blanco de Factura IA, como personajes principales del producto.

## Estructura

```text
FacturaIA_Equipo_Inteligente_Animada/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── assets/
│   └── images/
│       ├── logo-mark.png
│       ├── logo-mark.webp
│       ├── equipo.webp
│       ├── rosario.webp
│       ├── fatima.webp
│       ├── don-hector.webp
│       ├── jaimito.webp
│       ├── avatar-rosario.webp
│       ├── avatar-fatima.webp
│       ├── avatar-don-hector.webp
│       └── avatar-jaimito.webp
└── preview/
```

## Dirección visual

- Azul principal: `#06376C`
- Azul profundo: `#04284F`
- Verde menta: `#4FD1A1`
- Verde de apoyo: `#23A87C`
- Fondo crema: `#F7F4EF`
- Títulos: Bricolage Grotesque
- Texto: Hanken Grotesk
- Etiquetas técnicas: JetBrains Mono

## Animaciones personalizadas

- Entrada escalonada de los cuatro asistentes.
- Movimiento flotante independiente para cada personaje.
- Parallax por profundidad al mover el cursor sobre el equipo.
- Barrido luminoso que conecta visualmente a los asistentes.
- Anillos tecnológicos con rotación lenta en segundo plano.
- Ecosistema animado: cada especialista se activa por turno.
- Pulso de datos desde el especialista activo hacia Factura IA.
- Activación manual del ecosistema al colocar el cursor sobre un avatar.
- Animaciones progresivas al recorrer la página.
- Compatibilidad con `prefers-reduced-motion` para accesibilidad.

## Interacciones

- Navegación sticky y menú móvil.
- Modal de demostración con control de foco y tecla Escape.
- Pestañas accesibles por especialista.
- FAQ tipo acordeón.
- Estado activo de navegación según la sección visible.
- Barra de progreso, regreso al inicio y acceso flotante a WhatsApp.

## Ejecutar localmente

Desde la carpeta del proyecto:

```bash
python -m http.server 8000
```

Después abre:

```text
http://localhost:8000
```

También se puede abrir `index.html` directamente, aunque el servidor local evita restricciones de algunos navegadores.
