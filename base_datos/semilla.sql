-- ECONOVA - DATOS DE SEMILLA (SEED DATA)
-- Datos iniciales para testing y desarrollo

-- Limpiar datos existentes (solo para desarrollo)
-- TRUNCATE TABLE predicciones_ml, conversaciones_chatbot, comparaciones, logros, simulaciones, modelos_ml, usuarios RESTART IDENTITY CASCADE;


-- USUARIOS DE PRUEBA
INSERT INTO usuarios (email, nombre, nivel, fecha_registro) VALUES
('juan.perez@econova.com', 'Juan Pérez', 'basico', CURRENT_TIMESTAMP - INTERVAL '30 days'),
('maria.garcia@econova.com', 'María García', 'avanzado', CURRENT_TIMESTAMP - INTERVAL '20 days'),
('carlos.lopez@econova.com', 'Carlos López', 'experto', CURRENT_TIMESTAMP - INTERVAL '45 days'),
('ana.martinez@econova.com', 'Ana Martínez', 'basico', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('diego.silva@econova.com', 'Diego Silva', 'avanzado', CURRENT_TIMESTAMP - INTERVAL '15 days')
ON CONFLICT (email) DO NOTHING;


-- SIMULACIONES DE EJEMPLO


-- Simulación VAN - Usuario 1
INSERT INTO simulaciones (usuario_id, nombre, tipo_simulacion, parametros, resultados, fecha_creacion) VALUES
(1, 'Proyecto Paneles Solares', 'VAN', 
'{
    "inversion_inicial": 100000,
    "flujos_caja": [30000, 35000, 40000, 45000, 50000],
    "tasa_descuento": 0.10
}'::jsonb,
'{
    "van": 49789.12,
    "decision": "ACEPTAR",
    "flujos_descontados": [27272.73, 28925.62, 30052.59, 30735.16, 31030.42]
}'::jsonb,
CURRENT_TIMESTAMP - INTERVAL '5 days'),

-- Simulación TIR - Usuario 2
(2, 'Expansión de Negocio', 'TIR',
'{
    "inversion_inicial": 200000,
    "flujos_caja": [50000, 60000, 70000, 80000, 90000],
    "tasa_referencia": 0.12
}'::jsonb,
'{
    "tir": 0.1847,
    "tir_porcentaje": 18.47,
    "decision": "ACEPTAR"
}'::jsonb,
CURRENT_TIMESTAMP - INTERVAL '3 days'),

-- Simulación WACC - Usuario 3
(3, 'Costo de Capital Empresa ABC', 'WACC',
'{
    "capital_propio": 500000,
    "deuda": 300000,
    "costo_capital": 0.15,
    "costo_deuda": 0.08,
    "tasa_impuesto": 0.30
}'::jsonb,
'{
    "wacc": 0.1148,
    "wacc_porcentaje": 11.48,
    "peso_capital": 0.625,
    "peso_deuda": 0.375
}'::jsonb,
CURRENT_TIMESTAMP - INTERVAL '2 days'),

-- Simulación Portafolio - Usuario 3
(3, 'Portafolio Diversificado', 'PORTAFOLIO',
'{
    "retornos": [0.12, 0.15, 0.10],
    "ponderaciones": [0.4, 0.35, 0.25],
    "volatilidades": [0.20, 0.25, 0.15]
}'::jsonb,
'{
    "retorno_esperado": 0.1235,
    "retorno_esperado_porcentaje": 12.35,
    "riesgo": 0.1876,
    "ratio_sharpe": 0.6582
}'::jsonb,
CURRENT_TIMESTAMP - INTERVAL '1 day'),

-- Simulación Reemplazo - Usuario 2
(2, 'Reemplazo Maquinaria Industrial', 'REEMPLAZO_ACTIVOS',
'{
    "costo_actual_anual": 50000,
    "costo_nuevo_anual": 30000,
    "costo_nuevo_compra": 150000,
    "valor_salvamento_actual": 20000,
    "vida_util_nuevo": 10,
    "tasa_descuento": 0.10
}'::jsonb,
'{
    "decision": "REEMPLAZAR",
    "van_reemplazo": 12891.34,
    "ahorro_anual": 20000
}'::jsonb,
CURRENT_TIMESTAMP - INTERVAL '4 days');


-- LOGROS INICIALES

INSERT INTO logros (usuario_id, tipo_logro, nombre, descripcion, puntos, fecha_obtencion) VALUES
(1, 'bienvenida', '¡Bienvenido a Econova!', 'Te registraste en la plataforma', 5, CURRENT_TIMESTAMP - INTERVAL '30 days'),
(1, 'primera_simulacion', '¡Primera Simulación!', 'Realizaste tu primera simulación', 10, CURRENT_TIMESTAMP - INTERVAL '5 days'),
(1, 'primera_van', 'Experto en VAN', 'Primera simulación de VAN', 10, CURRENT_TIMESTAMP - INTERVAL '5 days'),

(2, 'bienvenida', '¡Bienvenido a Econova!', 'Te registraste en la plataforma', 5, CURRENT_TIMESTAMP - INTERVAL '20 days'),
(2, 'primera_simulacion', '¡Primera Simulación!', 'Realizaste tu primera simulación', 10, CURRENT_TIMESTAMP - INTERVAL '4 days'),
(2, 'primera_tir', 'Maestro de TIR', 'Primera simulación de TIR', 10, CURRENT_TIMESTAMP - INTERVAL '3 days'),
(2, 'cinco_simulaciones', 'Usuario Activo', '5 simulaciones realizadas', 25, CURRENT_TIMESTAMP - INTERVAL '1 day'),

(3, 'bienvenida', '¡Bienvenido a Econova!', 'Te registraste en la plataforma', 5, CURRENT_TIMESTAMP - INTERVAL '45 days'),
(3, 'primera_simulacion', '¡Primera Simulación!', 'Realizaste tu primera simulación', 10, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(3, 'primera_wacc', 'Analista Financiero', 'Primera simulación de WACC', 15, CURRENT_TIMESTAMP - INTERVAL '2 days'),
(3, 'primera_portafolio', 'Gestor de Portafolio', 'Primera simulación de portafolio', 15, CURRENT_TIMESTAMP - INTERVAL '1 day'),
(3, 'experto', 'Experto Financiero', 'Alcanzaste nivel experto', 50, CURRENT_TIMESTAMP - INTERVAL '1 day'),

(4, 'bienvenida', '¡Bienvenido a Econova!', 'Te registraste en la plataforma', 5, CURRENT_TIMESTAMP - INTERVAL '10 days'),

(5, 'bienvenida', '¡Bienvenido a Econova!', 'Te registraste en la plataforma', 5, CURRENT_TIMESTAMP - INTERVAL '15 days')
ON CONFLICT (usuario_id, tipo_logro) DO NOTHING;


-- DATOS DE BENCHMARKING (COMPARACIONES ANÓNIMAS)
-- Para Jeanfranco

INSERT INTO comparaciones (simulacion_id, tipo_simulacion, sector, region, metrica_clave, valor_metrica) VALUES
(1, 'VAN', 'Energía', 'Lima', 'van', 49789.12),
(2, 'TIR', 'Comercio', 'Arequipa', 'tir', 0.1847),
(3, 'WACC', 'Industrial', 'Lima', 'wacc', 0.1148),
(4, 'PORTAFOLIO', 'Inversiones', 'Lima', 'retorno_esperado', 0.1235),
(5, 'REEMPLAZO_ACTIVOS', 'Industrial', 'Cusco', 'van_reemplazo', 12891.34);


-- MODELOS ML INICIALES
-- Para Diego

INSERT INTO modelos_ml (nombre, tipo_modelo, version, metricas, activo) VALUES
('predictor_ventas_v1', 'RandomForest', '1.0',
'{
    "r2_score": 0.85,
    "mae": 1250.50,
    "rmse": 1890.25
}'::jsonb, true),

('clasificador_riesgo_v1', 'XGBoost', '1.0',
'{
    "accuracy": 0.92,
    "precision": 0.89,
    "recall": 0.91,
    "f1_score": 0.90
}'::jsonb, true),

('predictor_tir_v1', 'LinearRegression', '1.0',
'{
    "r2_score": 0.78,
    "mae": 0.025
}'::jsonb, true)
ON CONFLICT (nombre, version) DO NOTHING;


-- CONVERSACIONES CHATBOT DE EJEMPLO
-- Para Ronaldo

INSERT INTO conversaciones_chatbot (usuario_id, simulacion_id, mensaje_usuario, respuesta_chatbot, contexto) VALUES
(1, 1, '¿Qué significa un VAN positivo?',
'Un VAN (Valor Actual Neto) positivo significa que el proyecto genera valor. En tu caso, el VAN de $49,789.12 indica que el proyecto de Paneles Solares es rentable y deberías aceptarlo. Esto significa que después de recuperar tu inversión y considerando el costo del dinero en el tiempo (tasa del 10%), tendrás una ganancia de casi $50,000.',
'{"tipo_simulacion": "VAN", "nivel_usuario": "basico"}'::jsonb),

(2, 2, '¿Mi TIR es buena?',
'¡Excelente! Tu TIR del 18.47% es superior a tu tasa de referencia del 12%. Esto significa que tu proyecto de Expansión de Negocio rinde un 6.47% más de lo mínimo esperado. Es un proyecto muy atractivo desde el punto de vista financiero.',
'{"tipo_simulacion": "TIR", "nivel_usuario": "avanzado"}'::jsonb),

(3, 3, 'Explica el WACC',
'El WACC (Weighted Average Cost of Capital) es el costo promedio que tu empresa paga por su financiamiento. Tu WACC del 11.48% indica que cada proyecto que realices debe generar al menos ese rendimiento para crear valor. Es tu "tasa mínima" para evaluar nuevas inversiones.',
'{"tipo_simulacion": "WACC", "nivel_usuario": "experto"}'::jsonb);


-- VERIFICACIÓN DE DATOS

-- Mostrar resumen de datos insertados
DO $$
DECLARE
    total_usuarios INTEGER;
    total_simulaciones INTEGER;
    total_logros INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_usuarios FROM usuarios;
    SELECT COUNT(*) INTO total_simulaciones FROM simulaciones;
    SELECT COUNT(*) INTO total_logros FROM logros;
    
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Datos de semilla insertados:';
    RAISE NOTICE 'Usuarios: %', total_usuarios;
    RAISE NOTICE 'Simulaciones: %', total_simulaciones;
    RAISE NOTICE 'Logros: %', total_logros;
    RAISE NOTICE '====================================';
END $$;