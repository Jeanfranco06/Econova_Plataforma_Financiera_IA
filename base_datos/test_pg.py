import psycopg2

conn = psycopg2.connect(
    dbname="econova_db",
    user="postgres",
    password="admin123",
    host="localhost",
    port="5432"
)

cur = conn.cursor()
cur.execute("INSERT INTO USUARIOS(nombre_usuario,email,nombres,apellidos,nivel) VALUES (%s,%s,%s,%s,%s)",
            ("nuevoUser",'nuevouser@unitru.edu.pe','nombres completos','apellidos completos','Avanzado'))
cur.execute("SELECT * FROM USUARIOS")

filas = cur.fetchall()
for fila in filas:
    print(fila)

cur.close()
conn.close()