-- Active: 1764178761702@@127.0.0.1@5432@econova_db
DROP TABLE IF EXISTS Usuario_Insignia;
DROP TABLE IF EXISTS Insignias ;
DROP TABLE IF EXISTS Resultados ;
DROP TABLE IF EXISTS Simulaciones ;
DROP TABLE IF EXISTS Notificaciones ;
DROP TABLE IF EXISTS Usuario_Benchmarking ;
DROP TABLE IF EXISTS Benchmarking_Grupo ;
DROP TABLE IF EXISTS Ranking ;
DROP TABLE IF EXISTS Usuarios ;
CREATE TABLE Usuarios(
    usuario_id SERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(50) UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(70) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    password_hash TEXT,
    empresa VARCHAR(100),
    sector VARCHAR(100),
    tamano_empresa VARCHAR(50),
    newsletter BOOLEAN DEFAULT FALSE,
    nivel VARCHAR(80) DEFAULT 'basico',
    foto_perfil VARCHAR(255),
    email_confirmado BOOLEAN DEFAULT FALSE,
    confirmation_token VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Simulaciones(
    simulacion_id SERIAL PRIMARY KEY,
    usuario_id int,
    nombre VARCHAR(100),
    tipo_simulacion VARCHAR(70) NOT NULL,
    parametros JSONB,
    resultados JSONB,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Foreign Key (usuario_id) REFERENCES Usuarios(usuario_id)
);

CREATE TABLE Resultados(
    resultado_id SERIAL PRIMARY KEY,
    simulacion_id INT NOT NULL REFERENCES Simulaciones(simulacion_id),
    indicador VARCHAR(40) NOT NULL,
    valor NUMERIC(12,2) NOT NULL
);

CREATE TABLE Insignias(
    insignia_id SERIAL PRIMARY KEY,
    nombre_insig    varchar(80) NOT NULL UNIQUE,
    descripcion_insig VARCHAR(80) NOT NULL
);

CREATE TABLE Usuario_Insignia(
    insignia_id int NOT NULL REFERENCES Insignias(insignia_id),
    usuario_id int NOT NULL REFERENCES Usuarios(usuario_id),
    fecha_obtenida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id,insignia_id)
);

CREATE Table Ranking(
    ranking_id SERIAL PRIMARY KEY,
    usuario_id int NOT NULL REFERENCES Usuarios(usuario_id),
    puntaje NUMERIC(8,2),
    sector VARCHAR(60),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE Notificaciones(
    notificacion_id SERIAL PRIMARY KEY,
    usuario_id int NOT NULL REFERENCES Usuarios(usuario_id),
    tipo VARCHAR(50) NOT NULL,
    mensaje TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(40) DEFAULT 'Pendiente'
);


CREATE TABLE Benchmarking_Grupo(
    benchmarking_id SERIAL PRIMARY KEY,
    nombre_grupo VARCHAR(60),
    descripcion VARCHAR(60)
);

CREATE TABLE Usuario_Benchmarking(
    usuario_id int not null REFERENCES Usuarios(usuario_id),
    benchmarking_id int not null REFERENCES Benchmarking_Grupo(benchmarking_id),
    PRIMARY KEY (usuario_id,benchmarking_id)
);

insert into usuarios(nombre_usuario,email,nombres, apellidos,nivel)
values('francou','jjgonzaleses@unitru.edu.pe','Jeanfranco Jefferson','Gonzales Esquivel','Principiante');

SELECT * from Usuarios;

update Usuarios
    set nombre_usuario='francouu'
where nombre_usuario='francou';
