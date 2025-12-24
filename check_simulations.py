#!/usr/bin/env python3
"""
Script para verificar qué usuarios tienen simulaciones guardadas
"""

import sys
sys.path.append('.')

from app.utils.base_datos import get_db_connection

def check_simulations():
    db = get_db_connection()
    db.connect()

    # Ver usuarios con más simulaciones
    result = db.execute_query('''
        SELECT u.usuario_id, u.nombres, u.apellidos, COUNT(s.simulacion_id) as num_simulaciones,
               GROUP_CONCAT(DISTINCT s.tipo_simulacion) as tipos
        FROM Usuarios u
        LEFT JOIN Simulaciones s ON u.usuario_id = s.usuario_id
        GROUP BY u.usuario_id, u.nombres, u.apellidos
        HAVING num_simulaciones > 0
        ORDER BY num_simulaciones DESC
        LIMIT 10
    ''', fetch=True)

    if result:
        print('Usuarios con simulaciones guardadas:')
        for row in result:
            tipos = row['tipos'] if row['tipos'] else 'Ninguno'
            print(f'ID: {row["usuario_id"]}, Nombre: {row["nombres"]} {row["apellidos"]}, Simulaciones: {row["num_simulaciones"]}, Tipos: {tipos}')
    else:
        print('No se encontraron usuarios con simulaciones guardadas')

    db.disconnect()

if __name__ == "__main__":
    check_simulations()
