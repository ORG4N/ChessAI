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

@app.route("/account", methods=('GET', 'POST'))
def account():

    if request.method == 'POST':
        username = request.form['create_username']
        password1 = request.form['create_password1']
        password2 = request.form['create_password2']

        if not username:
            flash('Username is required!')

        elif not password1:
            flash('Password is required!')

        elif not password2:
            flash('Password confirmation is required!')

        else:
            if password1 == password2:
                conn = get_db_connection()
                conn.execute('INSERT INTO HumanPlayer (Username, Password, Online, Biography, Picture, Wins, Losses, Draws) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                            (username, password1, "Currently online", "No biography", "None", 0, 0, 0))
                conn.commit()
                conn.close()
                return redirect(url_for('learn'))                

        #allowed = string.letters + string.digits + '_'
        #if not all(char in allowed for char in username):
        #    flash('Username contains special characters!')

        #if any(username.isspace()):
        #    flash('Cannot contain whitespace!')

        

    return render_template("pages/account.html")

@app.route("/learn")
def learn():
    return render_template("pages/learn.html")

@app.route("/profile")
def profile():
    return render_template("pages/profile.html")