from flask import render_template, Flask, request, url_for, flash, redirect
import sqlite3, os
from passlib.hash import pbkdf2_sha256

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

        if not side or not diff or not time:
            flash('Something went wrong... Please refresh the page and try again!')
            return redirect(url_for('play'))
        
        else:
            # Submit form to crate game.
            return redirect(url_for('play'))

    return render_template("pages/play.html", bots=computer_players, times=time_control)

@app.route("/account")
def account():  
    return render_template("pages/account.html")

# Route to handle LOGIN post requests.
@app.route('/login', methods=['POST'])
def login():

    if request.method == 'POST':
        username = request.form['login_username']
        password = request.form['login_password']

        if not username:
            flash('Username is required!')
            return redirect(url_for('account'))

        elif not password:
            flash('Password is required!')
            return redirect(url_for('account'))
        
        else:
            conn = get_db_connection()
            exists = conn.execute("SELECT Password FROM HumanPlayer WHERE Username = (?)", [username]).fetchone()

            conn.close()

            # If there exists a field for the input USERNAME then verify password against hash.
            if exists: 
                phash = exists['Password']

                # Use verify command that automatically compares SECRET with HASH
                if(pbkdf2_sha256.verify(password, phash)):
                    return redirect(url_for('play'))
                
            # Otherwise, there is no username. Invalid submission.
            else:
                flash('Username or password are incorrect!')
                return redirect(url_for('account'))

    return redirect(url_for('account'))


# Route to handle REGISTER aka CREATE ACCOUNT post requests.
@app.route('/register', methods=['POST'])
def register():
    if request.method == 'POST':

        username = request.form['create_username']
        password1 = request.form['create_password1']
        password2 = request.form['create_password2']

        if not username:
            flash('Username is required!')
            return redirect(url_for('account'))

        elif not password1:
            flash('Password is required!')
            return redirect(url_for('account'))

        elif not password2:
            flash('Password confirmation is required!')
            return redirect(url_for('account'))

        else:
            # Do passwords match?
            if password1 == password2:
                conn = get_db_connection()

                usernamecheck = conn.execute("SELECT * FROM HumanPlayer WHERE Username = ?", [username]).fetchall()

                # Username already exists so do nothing
                if usernamecheck:                
                    conn.close()
                    flash('Username is already taken!')
                    return redirect(url_for('account'))              

                # Username valid so hash password and create entry then redirect to profile.
                else:  

                    # Hash password
                    password = pbkdf2_sha256.hash(password1)

                    # Create row in database
                    conn.execute('INSERT INTO HumanPlayer (Username, Password, Online, Biography, Picture, Wins, Losses, Draws) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                                (username, password, "Currently online", "No biography", "None", 0, 0, 0))
                    
                    conn.commit()
                    conn.close()
                    flash('Username is already taken!')   
                    return redirect(url_for('profile')) 

    return redirect(url_for('account'))


@app.route("/learn")
def learn():
    return render_template("pages/learn.html")

@app.route("/profile")
def profile():
    return render_template("pages/profile.html")