import sqlite3

connection = sqlite3.connect('database.sqlite')


with open('schema.sql') as f:
    connection.executescript(f.read())

cur = connection.cursor()

elo = ['1100', '1200', '1300', '1400', '1500', '1600', '1700', '1900']
time = ['1', '3', '5', '10']

for i in elo:
    username = 'BOT ' + i
    cur.execute("INSERT INTO Bot (Username, Rating) VALUES (?, ?)",
            (username, i)
            )

    
for i in time:
    name = i + ' min'
    cur.execute("INSERT INTO TimeControl (Name, Value) VALUES (?, ?)",
                (name, i)
                )

connection.commit()
connection.close()
