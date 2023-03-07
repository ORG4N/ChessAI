from flask import render_template
from flask import Flask
import sqlite3

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True  # Html automatically reloads on server when changes are made and page is refreshed



def get_db_connection():
    conn = sqlite3.connect('db/database.db')
    conn.row_factory = sqlite3.Row
    return conn



@app.route("/")
def home():
    return render_template("pages/index.html")
    
@app.route("/play")
def play():

    conn = get_db_connection()
    computer_players = conn.execute('SELECT * FROM ComputerPlayer').fetchall()
    time_control = conn.execute('SELECT * FROM TimeControl').fetchall()
    conn.close()

    return render_template("pages/play.html", bots=computer_players, times=time_control)


@app.route("/learn")
def learn():
    return render_template("pages/learn.html")

@app.route("/profile")
def profile():
    return render_template("pages/profile.html")