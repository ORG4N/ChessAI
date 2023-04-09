from flask import render_template, Flask, request, url_for, flash, redirect
import sqlite3, os

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True  # Html automatically reloads on server when changes are made and page is refreshed
app.config['SECRET_KEY'] = os.urandom(24).hex()



def get_db_connection():
    conn = sqlite3.connect('db/database.sqlite')
    conn.row_factory = sqlite3.Row
    return conn



@app.route("/")
def home():
    return render_template("pages/index.html")
    
@app.route("/play", methods=('GET', 'POST'))
def play():

    conn = get_db_connection()
    computer_players = conn.execute('SELECT * FROM ComputerPlayer').fetchall()
    time_control = conn.execute('SELECT * FROM TimeControl').fetchall()
    conn.close()

    if request.method == 'POST':
        side = request.form['side']
        diff = request.form['difficulty']
        time = request.form['time']

        if not side:
            flash('Side is required!')
        elif not diff:
            flash('Diff is required!')
        elif not time:
            flash('Time is required!')
        else:
            return redirect(url_for('home'))

    return render_template("pages/play.html", bots=computer_players, times=time_control)

@app.route("/account")
def account():
    return render_template("pages/account.html")

@app.route("/learn")
def learn():
    return render_template("pages/learn.html")

@app.route("/profile")
def profile():
    return render_template("pages/profile.html")