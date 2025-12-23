import sqlite3

# Connect to database
conn = sqlite3.connect('econova.db')
cur = conn.cursor()

# Check total users
cur.execute('SELECT COUNT(*) FROM Usuarios')
total_users = cur.fetchone()[0]
print(f'Total users in database: {total_users}')

# Check for users with confirmation tokens
cur.execute('SELECT usuario_id, email, confirmation_token, email_confirmado FROM Usuarios WHERE confirmation_token IS NOT NULL')
results = cur.fetchall()

print(f'\nUsers with confirmation tokens ({len(results)}):')
for row in results:
    print(f'ID: {row[0]}, Email: {row[1]}, Token: {row[2]}, Confirmed: {row[3]}')

# Check confirmed users
cur.execute('SELECT usuario_id, email, confirmation_token, email_confirmado FROM Usuarios WHERE email_confirmado = 1')
confirmed_results = cur.fetchall()

print(f'\nConfirmed users ({len(confirmed_results)}):')
for row in confirmed_results:
    print(f'ID: {row[0]}, Email: {row[1]}, Token: {row[2]}, Confirmed: {row[3]}')

# Specifically check for the problematic tokens
tokens_to_check = [
    'Ptpy9sSaf394curVnizHtO1PsVSXeGPhD1RH3Yi-1NQ',
    'j-jgZq2dRw3nqq9Cz8fE1dDH5OJa_JzKlKmTBcvxOg4'
]

for token in tokens_to_check:
    cur.execute('SELECT usuario_id, email, confirmation_token, email_confirmado FROM Usuarios WHERE confirmation_token = ?', (token,))
    result = cur.fetchone()

    if result:
        print(f'\nToken found: {token}')
        print(f'  ID: {result[0]}, Email: {result[1]}, Confirmed: {result[3]}')
    else:
        print(f'\nToken "{token}" not found in database')

# Check if token exists but is NULL (already used)
cur.execute('SELECT usuario_id, email, confirmation_token, email_confirmado FROM Usuarios WHERE email_confirmado = 1 AND confirmation_token IS NULL')
used_tokens = cur.fetchall()

print(f'\nUsers with used tokens (confirmed and token cleared) ({len(used_tokens)}):')
for row in used_tokens:
    print(f'ID: {row[0]}, Email: {row[1]}, Confirmed: {row[3]}')

conn.close()
