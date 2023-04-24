from flask import render_template, Flask, request, url_for, flash, redirect
from flask_login import LoginManager, UserMixin, login_required, login_user, logout_user, current_user
import sqlite3, os
from passlib.hash import pbkdf2_sha256
from models import User



app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True  # Html automatically reloads on server when changes are made and page is refreshed
app.config['SECRET_KEY'] = os.urandom(24).hex()

login_manager = LoginManager(app)
login_manager.login_view = "home"


def get_db_connection():
    conn = sqlite3.connect('db/database.sqlite')
    conn.row_factory = sqlite3.Row
    return conn

@login_manager.user_loader
def load_user(user_id):
   conn = get_db_connection()
   user = conn.execute("SELECT * from HumanPlayer where PlayerID = (?)", [user_id]).fetchone()
   conn.close()

   if user is None:
      return None
   
   else:
      return User(int(user[0]), user[1], user[2], user[3], user[4], user[5], user[6], user[7], user[8], user[9])

# Redirect user to account if they try to access an authorised route.
@login_manager.unauthorized_handler
def unauthorized():
    return redirect(url_for('account'))

@app.route("/")
def home():
    return render_template("pages/index.html")
    
@app.route("/play", methods=('GET', 'POST'))
@login_required
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

    if current_user.is_authenticated:
        return redirect(url_for('profile'))
    
    return render_template("pages/account.html")

# Route to handle LOGOUT.
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))


# Route to handle LOGIN post requests.
@app.route('/login', methods=['POST'])
def login():

    if request.method == 'POST':
        username = request.form['login_username']
        password = request.form['login_password']

        if not username:
            flash('Username is required!', 'login')
            return redirect(url_for('account'))

        elif not password:
            flash('Password is required!', 'login')
            return redirect(url_for('account'))
        
        else:
            # SELECT entry where username matches input username
            conn = get_db_connection()
            user_exists = conn.execute("SELECT * FROM HumanPlayer WHERE Username = (?)", [username]).fetchone()
            conn.close()

            # If there exists a field for the input USERNAME then verify password against hash.
            if user_exists: 

                # Get the hashed password from the account matching the username.
                phash = user_exists['Password']

                # Use verify command that automatically compares SECRET with HASH. Compares input to stored password.
                if(pbkdf2_sha256.verify(password, phash)):

                    # Use load_user function to load PlayerID query into a class object of user.
                    user = load_user(user_exists['PlayerID'])

                    # Use FLASK-LOGIN to load the class object as a user.
                    login_user(user)

                    return redirect(url_for('account'))
                
                else:
                    flash('Password is incorrect!', 'login')
                    return redirect(url_for('account'))
                
            # Otherwise, there is no username. Invalid submission.
            else:
                flash('User does not exist!', 'login')
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
            flash('Username is required!', 'register')
            return redirect(url_for('account'))

        elif not password1:
            flash('Password is required!', 'register')
            return redirect(url_for('account'))

        elif not password2:
            flash('Password confirmation is required!', 'register')
            return redirect(url_for('account'))

        else:
            # Do passwords match?
            if password1 == password2:
                conn = get_db_connection()

                usernamecheck = conn.execute("SELECT * FROM HumanPlayer WHERE Username = ?", [username]).fetchall()

                # Username already exists so do nothing
                if usernamecheck:                
                    conn.close()
                    flash('Username is already taken!', 'register')
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
                    return redirect(url_for('profile')) 
            else:
                flash('Passwords do not match!', 'register')
                return redirect(url_for('account'))   

    return redirect(url_for('account'))


@app.route("/learn")
@login_required
def learn():
    return render_template("pages/learn.html")

@app.route("/profile")
@login_required
def profile():
    return render_template("pages/profile.html")