#!/usr/bin/env python3
from app.modelos.logro import Usuario_Insignia

# Verificar insignias del usuario 35
insignias_usuario = Usuario_Insignia.obtener_insignias_usuario(35)
print('Insignias del usuario 35:')
for i, item in enumerate(insignias_usuario):
    insignia = item['insignia']
    fecha = item['fecha_obtenida']
    print(f'{i+1}. {insignia["nombre_insig"]} - {fecha}')
print(f'Total: {len(insignias_usuario)} insignias')

# Verificar si tiene "Analista Avanzado"
tiene_analista_avanzado = any(
    item['insignia']['nombre_insig'] == 'Analista Avanzado'
    for item in insignias_usuario
)
print(f'¿Tiene Analista Avanzado? {tiene_analista_avanzado}')
