import sqlite3

connection = sqlite3.connect('database.db')


with open('schema.sql') as f:
    connection.executescript(f.read())

cur = connection.cursor()

elo = ['400', '500', '600', '700', '800', '900', '1000', '1100', '1200', '1300', '1400', '1500', '1600', '1700']
time = ['1', '3', '5', '10']

for i in elo:
    username = 'BOT ' + i
    cur.execute("INSERT INTO ComputerPlayer (Username, Rating) VALUES (?, ?)",
                (username, i)
                )
    
for i in time:
    name = i + ' min'
    cur.execute("INSERT INTO TimeControl (Name, Value) VALUES (?, ?)",
                (name, i)
                )

connection.commit()
connection.close()
