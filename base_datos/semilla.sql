-- Seed data for Econova gamification and benchmarking system

-- Insertar insignias (badges)
INSERT INTO Insignias (nombre_insig, descripcion_insig) VALUES
('Primeros Pasos', 'Completó su primera simulación financiera'),
('Analista Novato', 'Realizó 5 simulaciones diferentes'),
('Experto en VAN', 'Calculó VAN en más de 10 proyectos'),
('Maestro TIR', 'Dominó el cálculo de TIR en escenarios complejos'),
('Optimizador', 'Encontró la mejor combinación de portafolio'),
('Benchmarking Explorer', 'Se unió a su primer grupo de benchmarking'),
('Líder de Sector', 'Ocupó el primer lugar en ranking sectorial'),
('Innovador', 'Creó una estrategia financiera única'),
('Comparador', 'Comparó sus resultados con 10+ usuarios'),
('Exportador', 'Exportó resultados a Excel/Google Sheets'),
('Notificado', 'Recibió 20+ notificaciones positivas'),
('Consistente', 'Mantuvo rendimiento superior al promedio por un mes'),
('Colaborador', 'Ayudó a 5+ usuarios con consejos'),
('Aprendiz Rápido', 'Avanzó de nivel principiante a avanzado en menos de una semana'),
('Perfeccionista', 'Alcanzó precisión del 95% en predicciones');

-- Insertar grupos de benchmarking
INSERT INTO Benchmarking_Grupo (nombre_grupo, descripcion) VALUES
('Emprendedores Tecnológicos', 'Grupo para startups y empresas de tecnología'),
('PYMEs Industriales', 'Pequeñas y medianas empresas del sector industrial'),
('Comercio Minorista', 'Empresas dedicadas al comercio minorista'),
('Servicios Financieros', 'Instituciones y consultores financieros'),
('Agricultura Moderna', 'Empresas del sector agrícola con enfoque innovador'),
('Turismo y Hospitalidad', 'Empresas del sector turístico'),
('Construcción', 'Empresas constructoras y del sector inmobiliario'),
('Educación', 'Instituciones educativas y edtech'),
('Salud', 'Empresas del sector salud y biotecnología'),
('Energías Renovables', 'Empresas de energías limpias y sostenibles');

-- Insertar datos de ejemplo para rankings (si hay usuarios)
-- Estos se insertarán después de que existan usuarios y simulaciones

-- Insertar notificaciones de ejemplo (requiere usuarios existentes)
-- Estas se crearán dinámicamente en el código

-- Insertar usuario de ejemplo en grupo de benchmarking (requiere usuario existente)
-- Este se hará después de crear usuarios

COMMIT;
