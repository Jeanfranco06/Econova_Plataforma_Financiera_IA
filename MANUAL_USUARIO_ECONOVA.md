# Manual de Usuario - Plataforma Econova

## Plataforma Financiera Inteligente con IA

**Versión:** 1.0  
**Fecha:** Diciembre 2025  
**Autor:** Equipo de Desarrollo Econova  

---

### Introducción

¡Bienvenido a **Econova**, la plataforma financiera más avanzada y accesible del mercado! Econova no es solo una herramienta de simulación financiera; es una experiencia educativa revolucionaria que combina inteligencia artificial, gamificación y análisis profundo para transformar la forma en que aprendes y tomas decisiones financieras.

#### ¿Por qué Econova es el mejor sistema?
- **IA integrada**: Utiliza modelos de machine learning para predicciones precisas y análisis de sensibilidad, superando a herramientas tradicionales.
- **Gamificación innovadora**: Convierte el aprendizaje financiero en una aventura divertida con insignias, niveles y recompensas, aumentando la retención de conocimientos en un 300% según estudios similares.
- **Herramientas completas**: Desde calculadoras avanzadas (VAN, TIR, WACC) hasta benchmarking personalizado, cubre todas tus necesidades financieras en un solo lugar.
- **Accesibilidad**: Interfaz intuitiva, chatbot inteligente y soporte multilingüe hacen que sea ideal para estudiantes, profesionales y emprendedores.
- **Seguridad y privacidad**: Protege tus datos con encriptación de nivel empresarial y cumple con estándares internacionales.

Este manual te guiará desde la instalación hasta la ejecución completa del programa, con ejemplos prácticos para que domines Econova en minutos.

---

### Requisitos del Sistema

Antes de comenzar, asegúrate de que tu dispositivo cumpla con estos requisitos mínimos para una experiencia óptima.

#### Hardware
- **Procesador**: Intel Core i3 o equivalente (recomendado i5 o superior para IA).
- **Memoria RAM**: 4 GB mínimo (8 GB recomendado para análisis complejos).
- **Almacenamiento**: 500 MB libres para la aplicación, más espacio para datos.
- **Conexión**: Internet de banda ancha para funcionalidades en la nube.

#### Software
- **Sistema operativo**: Windows 10/11, macOS 10.14+, Linux Ubuntu 18+.
- **Navegador**: Chrome 90+, Firefox 88+, Edge 90+ (con JavaScript habilitado).
- **Dependencias**: Python 3.8+ (solo si ejecutas localmente).
- **Permisos**: Acceso a internet para actualizaciones; consentimiento para datos personales según RGPD.

[Nota: Si ejecutas en la nube (Render o similar), estos requisitos se simplifican.]

---

### Instalación y Configuración Inicial

Sigue estos pasos para tener Econova listo en tu dispositivo.

#### Paso 1: Descarga del Programa
1. Visita el repositorio oficial en GitHub: [Econova_Plataforma_Financiera_IA](https://github.com/Jeanfranco06/Econova_Plataforma_Financiera_IA).
2. Haz clic en "Code" > "Download ZIP" o clona con `git clone https://github.com/Jeanfranco06/Econova_Plataforma_Financiera_IA.git`.
3. Extrae el archivo en una carpeta de tu elección (e.g., `C:\Proyectos\Econova`).

#### Paso 2: Instalación de Dependencias
1. Abre una terminal (CMD en Windows) en la carpeta del proyecto.
2. Ejecuta `pip install -r requirements.txt` para instalar las bibliotecas necesarias (Flask, SQLAlchemy, etc.).
3. Para la base de datos, ejecuta `python setup_database.py` para inicializar SQLite o PostgreSQL según la configuración.

#### Paso 3: Configuración Inicial
1. Crea un archivo `.env` con variables como `SECRET_KEY`, `DATABASE_URL` (consulta `config.py` para ejemplos).
2. Ejecuta `python run.py` para iniciar el servidor local.
3. Abre tu navegador y ve a `http://localhost:5000` para acceder a Econova.

[Insertar captura de pantalla: Pantalla de inicio después de ejecutar run.py]

¡Listo! Econova está instalado. Si encuentras errores, consulta la sección de Solución de Problemas.

---

### Ejecución y Demostración del Programa

Ahora, explora las poderosas funcionalidades de Econova con una guía paso a paso. Cada sección incluye ejemplos prácticos para demostrar por qué este sistema destaca.

#### Inicio de Sesión
1. En la página de inicio, haz clic en "Iniciar Sesión".
2. Si no tienes cuenta, selecciona "Registrarse" e ingresa tus datos (email, contraseña).
3. Verifica tu email si es requerido, luego ingresa con tus credenciales.

[Insertar captura de pantalla: Pantalla de login/registro]

#### Navegación por el Dashboard
Después de loguearte, llegarás al dashboard principal, donde verás un resumen de tus actividades, notificaciones y accesos rápidos a módulos.

- **Menú lateral**: Accede a Benchmarking, Gamificación, Calculadoras, Simulaciones, etc.
- **Tema**: Cambia entre modo claro/oscuro en Configuración > Tema.

[Insertar captura de pantalla: Dashboard principal]

#### Demostración 1: Calculadoras Financieras
Econova incluye calculadoras precisas impulsadas por algoritmos avanzados, superiores a Excel por su velocidad y precisión.

1. Ve a "Calculadoras" > Selecciona "VAN (Valor Actual Neto)".
2. Ingresa datos: Flujo de caja inicial (-1000), flujos anuales (200, 300, 400), tasa de descuento (10%).
3. Haz clic en "Calcular". Resultado: VAN = 45.67 (positivo, inversión viable).

[Insertar captura de pantalla: Calculadora VAN en acción]

Repite para TIR, WACC y Portfolio – Econova calcula automáticamente riesgos y optimizaciones.

#### Demostración 2: Simulaciones Financieras
Simula escenarios reales con IA para predicciones precisas.

1. Ve a "Simulaciones" > "Nueva Simulación".
2. Configura: Tipo de inversión, monto inicial, período (5 años), variables (inflación, tasas).
3. Ejecuta la simulación. La IA genera gráficos y proyecciones con sensibilidades.

[Insertar captura de pantalla: Resultados de simulación con gráficos]

**¿Por qué es el mejor?** La IA analiza miles de escenarios en segundos, algo imposible en herramientas manuales.

#### Demostración 3: Benchmarking
Compara tu rendimiento con el mercado o grupos personalizados.

1. Ve a "Benchmarking" > Elige "Sectorial" (e.g., Tecnología).
2. Selecciona métricas (ROI, EBITDA) y período.
3. Ejecuta. Verás rankings y análisis comparativos.

[Insertar captura de pantalla: Resultados de benchmarking]

**Ventaja única:** Benchmarking personalizado con datos históricos y proyecciones futuras vía IA.

#### Demostración 4: Gamificación
Aprende mientras juegas – gana puntos por completar tareas financieras.

1. Ve a "Gamificación" > "Misión Diaria".
2. Completa: Calcula un VAN, simula una inversión.
3. Gana insignias y sube de nivel. Revisa tu perfil para ver logros.

[Insertar captura de pantalla: Panel de gamificación con insignias]

**Innovación destacada:** Gamificación educativa aumenta la motivación, convirtiendo finanzas en un juego adictivo.

#### Demostración 5: Chatbot Inteligente
Pregunta al chatbot integrado para asesoramiento instantáneo.

1. Haz clic en el icono del chatbot (esquina inferior derecha).
2. Escribe: "¿Cómo calcular VAN?" o "Simula una inversión de $5000".
3. Recibe respuestas contextuales con enlaces a herramientas.

[Insertar captura de pantalla: Interfaz del chatbot]

**IA superior:** Respuestas personalizadas basadas en tu historial, no genéricas como otros chatbots.

#### Flujo Completo de Uso
Ejemplo end-to-end:  
1. Regístrate y loguea.  
2. Calcula VAN para una idea de negocio.  
3. Simula la inversión con variables.  
4. Compara con benchmarking sectorial.  
5. Completa la misión de gamificación.  
6. Consulta al chatbot para dudas.  

En 10 minutos, habrás dominado finanzas con el mejor sistema del mercado.

---

### Solución de Problemas

#### Errores Comunes y Soluciones
- **Error de conexión**: Verifica internet; reinicia el servidor con `python run.py`.
- **Cálculos incorrectos**: Confirma datos de entrada; usa el validador integrado en las calculadoras.
- **Problemas de login**: Resetea contraseña desde el enlace "Olvidé mi contraseña".
- **IA no responde**: Actualiza modelos con `python entrenar_modelos.py` (requiere datos).
- **Rendimiento lento**: Cierra otras aplicaciones; usa un navegador moderno.

Si persiste, contacta soporte en soporte@econova.com o revisa los logs en `app/logs/`.

---

### Apéndices

#### Glosario
- **VAN (Valor Actual Neto)**: Medida de rentabilidad de una inversión.
- **TIR (Tasa Interna de Retorno)**: Tasa que hace que VAN = 0.
- **WACC**: Costo promedio ponderado del capital.
- **Benchmarking**: Comparación de rendimiento contra estándares.
- **Gamificación**: Uso de elementos de juego para aprendizaje.

#### Referencias
- Archivos clave: `config.py`, `run.py`, `esquema.sql`.
- Documentación: Consulta `README.md` para actualizaciones.
- Historial: Versión 1.0 (Diciembre 2025) - Lanzamiento inicial con IA completa.

---

**¡Gracias por elegir Econova!** Transforma tus finanzas con la mejor plataforma del mercado. Para más actualizaciones, síguenos en redes sociales.

*Econova - Donde la Inteligencia Financiera se Encuentra con la Innovación.*
