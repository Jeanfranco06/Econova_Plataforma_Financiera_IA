-- ECONOVA - PLATAFORMA FINANCIERA INTELIGENTE
-- Esquema de Base de Datos PostgreSQL
-- Autor: Germaín (Backend) + Jeanfranco (BD y Gamificación)

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABLA: usuarios
-- Gestiona los usuarios de la plataforma
-- ================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    nivel VARCHAR(20) DEFAULT 'basico' CHECK (nivel IN ('basico', 'avanzado', 'experto')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    ultima_conexion TIMESTAMP,
    
    CONSTRAINT email_valido CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_nivel ON usuarios(nivel);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- TABLA: simulaciones
-- Almacena todas las simulaciones financieras
CREATE TABLE IF NOT EXISTS simulaciones (
    simulacion_id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    tipo_simulacion VARCHAR(50) NOT NULL CHECK (
        tipo_simulacion IN ('VAN', 'TIR', 'WACC', 'PORTAFOLIO', 'REEMPLAZO_ACTIVOS')
    ),
    parametros JSONB NOT NULL,
    resultados JSONB NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    
    CONSTRAINT parametros_no_vacio CHECK (parametros != '{}'::jsonb),
    CONSTRAINT resultados_no_vacio CHECK (resultados != '{}'::jsonb)
);

-- Índices para simulaciones
CREATE INDEX idx_simulaciones_usuario ON simulaciones(usuario_id);
CREATE INDEX idx_simulaciones_tipo ON simulaciones(tipo_simulacion);
CREATE INDEX idx_simulaciones_fecha ON simulaciones(fecha_creacion DESC);
CREATE INDEX idx_simulaciones_activo ON simulaciones(activo);

-- Índice GIN para búsquedas en JSONB
CREATE INDEX idx_simulaciones_parametros ON simulaciones USING GIN (parametros);
CREATE INDEX idx_simulaciones_resultados ON simulaciones USING GIN (resultados);

-- TABLA: logros
-- Sistema de gamificación - logros y puntos
CREATE TABLE IF NOT EXISTS logros (
    logro_id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    tipo_logro VARCHAR(100) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    puntos INTEGER DEFAULT 10 CHECK (puntos >= 0),
    fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT logro_unico_por_usuario UNIQUE (usuario_id, tipo_logro)
);


-- Índices para logros
CREATE INDEX idx_logros_usuario ON logros(usuario_id);
CREATE INDEX idx_logros_tipo ON logros(tipo_logro);
CREATE INDEX idx_logros_fecha ON logros(fecha_obtencion DESC);


-- TABLA: comparaciones (Benchmarking/Crowdsourcing)
-- Para Jeanfranco - almacena comparaciones anónimas
CREATE TABLE IF NOT EXISTS comparaciones (
    comparacion_id SERIAL PRIMARY KEY,
    simulacion_id INTEGER REFERENCES simulaciones(simulacion_id) ON DELETE CASCADE,
    tipo_simulacion VARCHAR(50) NOT NULL,
    sector VARCHAR(100),
    region VARCHAR(100),
    metrica_clave VARCHAR(100),
    valor_metrica NUMERIC(15, 4),
    fecha_comparacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    anonimo BOOLEAN DEFAULT true
);

-- Índices para comparaciones
CREATE INDEX idx_comparaciones_tipo ON comparaciones(tipo_simulacion);
CREATE INDEX idx_comparaciones_sector ON comparaciones(sector);
CREATE INDEX idx_comparaciones_region ON comparaciones(region);
CREATE INDEX idx_comparaciones_metrica ON comparaciones(metrica_clave);


-- TABLA: conversaciones_chatbot
-- Para Ronaldo - almacena historial del chatbot
CREATE TABLE IF NOT EXISTS conversaciones_chatbot (
    conversacion_id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    simulacion_id INTEGER REFERENCES simulaciones(simulacion_id) ON DELETE SET NULL,
    mensaje_usuario TEXT NOT NULL,
    respuesta_chatbot TEXT NOT NULL,
    contexto JSONB,
    fecha_mensaje TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para conversaciones
CREATE INDEX idx_conversaciones_usuario ON conversaciones_chatbot(usuario_id);
CREATE INDEX idx_conversaciones_simulacion ON conversaciones_chatbot(simulacion_id);
CREATE INDEX idx_conversaciones_fecha ON conversaciones_chatbot(fecha_mensaje DESC);


-- TABLA: modelos_ml
-- Para Diego - metadata de modelos de ML
CREATE TABLE IF NOT EXISTS modelos_ml (
    modelo_id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    tipo_modelo VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    metricas JSONB,
    ruta_archivo VARCHAR(500),
    fecha_entrenamiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT true,
    
    CONSTRAINT modelo_version_unica UNIQUE (nombre, version)
);

-- Índices para modelos ML
CREATE INDEX idx_modelos_nombre ON modelos_ml(nombre);
CREATE INDEX idx_modelos_tipo ON modelos_ml(tipo_modelo);
CREATE INDEX idx_modelos_activo ON modelos_ml(activo);


-- TABLA: predicciones_ml
-- Para Diego - almacena predicciones realizadas
CREATE TABLE IF NOT EXISTS predicciones_ml (
    prediccion_id SERIAL PRIMARY KEY,
    modelo_id INTEGER REFERENCES modelos_ml(modelo_id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(usuario_id) ON DELETE CASCADE,
    simulacion_id INTEGER REFERENCES simulaciones(simulacion_id) ON DELETE SET NULL,
    entrada JSONB NOT NULL,
    prediccion JSONB NOT NULL,
    confianza NUMERIC(5, 4),
    fecha_prediccion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para predicciones
CREATE INDEX idx_predicciones_modelo ON predicciones_ml(modelo_id);
CREATE INDEX idx_predicciones_usuario ON predicciones_ml(usuario_id);
CREATE INDEX idx_predicciones_fecha ON predicciones_ml(fecha_prediccion DESC);



-- VISTAS ÚTILES
-- Vista: Ranking de usuarios por puntos
CREATE OR REPLACE VIEW ranking_usuarios AS
SELECT 
    u.usuario_id,
    u.nombre,
    u.nivel,
    COALESCE(SUM(l.puntos), 0) as puntos_totales,
    COUNT(l.logro_id) as total_logros,
    COUNT(DISTINCT s.simulacion_id) as total_simulaciones,
    RANK() OVER (ORDER BY COALESCE(SUM(l.puntos), 0) DESC) as ranking
FROM usuarios u
LEFT JOIN logros l ON u.usuario_id = l.usuario_id
LEFT JOIN simulaciones s ON u.usuario_id = s.usuario_id AND s.activo = true
WHERE u.activo = true
GROUP BY u.usuario_id, u.nombre, u.nivel
ORDER BY puntos_totales DESC;

-- Vista: Estadísticas por tipo de simulación
CREATE OR REPLACE VIEW estadisticas_simulaciones AS
SELECT 
    tipo_simulacion,
    COUNT(*) as total_simulaciones,
    COUNT(DISTINCT usuario_id) as usuarios_unicos,
    AVG(EXTRACT(EPOCH FROM (fecha_modificacion - fecha_creacion))) as tiempo_promedio_segundos
FROM simulaciones
WHERE activo = true
GROUP BY tipo_simulacion;

-- Vista: Actividad reciente de usuarios
CREATE OR REPLACE VIEW actividad_reciente AS
SELECT 
    u.usuario_id,
    u.nombre,
    u.email,
    COUNT(s.simulacion_id) as simulaciones_ultima_semana,
    MAX(s.fecha_creacion) as ultima_simulacion
FROM usuarios u
LEFT JOIN simulaciones s ON u.usuario_id = s.usuario_id 
    AND s.fecha_creacion >= CURRENT_TIMESTAMP - INTERVAL '7 days'
    AND s.activo = true
WHERE u.activo = true
GROUP BY u.usuario_id, u.nombre, u.email
ORDER BY ultima_simulacion DESC NULLS LAST;



-- FUNCIONES ÚTILES

-- Función: Actualizar fecha de modificación
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Actualizar fecha_modificacion en simulaciones
CREATE TRIGGER trigger_actualizar_fecha_modificacion
BEFORE UPDATE ON simulaciones
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Función: Otorgar logro automático por primera simulación
CREATE OR REPLACE FUNCTION otorgar_logro_primera_simulacion()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si es la primera simulación del usuario
    IF (SELECT COUNT(*) FROM simulaciones WHERE usuario_id = NEW.usuario_id) = 1 THEN
        INSERT INTO logros (usuario_id, tipo_logro, nombre, descripcion, puntos)
        VALUES (
            NEW.usuario_id,
            'primera_simulacion',
            '¡Primera Simulación!',
            'Realizaste tu primera simulación financiera',
            10
        )
        ON CONFLICT (usuario_id, tipo_logro) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Otorgar logro por primera simulación
CREATE TRIGGER trigger_logro_primera_simulacion
AFTER INSERT ON simulaciones
FOR EACH ROW
EXECUTE FUNCTION otorgar_logro_primera_simulacion();

-- COMENTARIOS EN TABLAS
COMMENT ON TABLE usuarios IS 'Usuarios registrados en la plataforma Econova';
COMMENT ON TABLE simulaciones IS 'Simulaciones financieras realizadas (VAN, TIR, WACC, etc.)';
COMMENT ON TABLE logros IS 'Sistema de gamificación - logros y puntos de usuarios';
COMMENT ON TABLE comparaciones IS 'Benchmarking anónimo entre usuarios';
COMMENT ON TABLE conversaciones_chatbot IS 'Historial de conversaciones con el chatbot asesor';
COMMENT ON TABLE modelos_ml IS 'Modelos de Machine Learning entrenados';
COMMENT ON TABLE predicciones_ml IS 'Predicciones realizadas por modelos ML';