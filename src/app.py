from flask import render_template, Flask, request, url_for, flash, redirect, jsonify
from flask_login import LoginManager, UserMixin, login_required, login_user, logout_user, current_user
import sqlite3, os
from passlib.hash import pbkdf2_sha256
from models import User, Player, Game
import random
import json
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler

import chess
import chess.engine


# Flask
app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True  # Html automatically reloads on server when changes are made and page is refreshed
app.config['SECRET_KEY'] = os.urandom(24).hex()

# Flask-Login
login_manager = LoginManager(app)
login_manager.login_view = "account"
login_manager.refresh_view = "account"

scheduler = BackgroundScheduler()
scheduler.start()

def get_db_connection():
    conn = sqlite3.connect('db/database.sqlite')
    conn.row_factory = sqlite3.Row
    return conn


@login_manager.user_loader
def load_user(user_id):
   conn = get_db_connection()
   user = conn.execute("SELECT * from Player where PlayerID = (?)", [user_id]).fetchone()
   conn.close()

   if user is None:
      return None
   
   else:
      return User(int(user[0]), user[1], user[2], user[3], user[4], user[5], user[6], user[7], user[8], user[9], user[10])
   

def check_active(id):

    user = load_user(id)

    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    current_time = datetime.strptime(current_time, "%Y-%m-%d %H:%M:%S")

    previous_time = datetime.strptime(user.last_active, "%Y-%m-%d %H:%M:%S")

    difference = (current_time - previous_time).total_seconds()
    print(difference)

    if difference >= 120:

        conn = get_db_connection()
        conn.execute("UPDATE Player SET Status = 'Offline' WHERE PlayerID = ?", (id))
        conn.commit()

        print("Stopping scheduler")
        scheduler.remove_all_jobs()    


def bot_game_obj(id, query, display=None):

    conn = get_db_connection()

    # A list that stores all the game objects
    games = []

    if display:
        query = query[:display]

    # For each Match that needs to be displayed - Get Bot & Player usernames and pic
    for i in query:

        match_id = i["MatchID"]

        bot_id = i["Bot"]
        bot_profile = conn.execute("SELECT * FROM Bot WHERE BotID = (?)", [bot_id]).fetchone()
        bot_match   = conn.execute("SELECT * FROM MatchBot WHERE BotID = (?) AND MatchID = (?)", [bot_id, match_id]).fetchone()
        bot = Player(bot_id, bot_profile["Username"], bot_match["Color"], bot_match["Points"])

        human_profile = conn.execute("SELECT * FROM Player WHERE PlayerID = (?)", [id]).fetchone()
        human_match   = conn.execute("SELECT * FROM MatchPlayer WHERE PlayerID = (?) AND MatchID = (?)", [id, match_id]).fetchone()
        human = Player(id, human_profile["Username"], human_match["Color"], human_match["Points"])

        game = Game(match_id, bot, human, i["Event"], i["Site"], i["Date"], i["Round"], i["Result"], i["Time"], i["Termination"], i["Moves"])
        games.append(game)

    conn.close()
    return games

    

# Redirect user to account if they try to access an authorised route.
@login_manager.unauthorized_handler
def unauthorized():
    return redirect(url_for('account'))

# Index page
@app.route("/")
def home():
    return render_template("pages/index.html")
    
# Game matchmaking - currently only bots    
@app.route("/game/bot/<id_>", methods=['GET', 'POST'])
@login_required
def game(id_):
    conn = get_db_connection()
    game = conn.execute("SELECT * FROM Match WHERE MatchID = (?)", [id_]).fetchone()     # Fetch MATCH info 
    
    computerID = game["Bot"]            # Fetch ID for COMPUTER player
    playerID = current_user.get_id()    # Fetch ID for HUMAN player

    if request.method == 'POST':

        # Computer (AKA Bot) turn
        if 'fen' in request.form:

            # Find Bot record
            bot = conn.execute("SELECT * FROM Bot WHERE (BotID) = (?)", [computerID]).fetchone()

            # Get rating and form string to create model path
            rating = bot["Rating"]
            model = 'maia-' + str(rating) + '.pb.gz'

            enginePath = os.getcwd() + '/engine/' + 'lc0.exe'
            weightsPath = os.getcwd() + '/engine/model_weights/' + model
            engine = chess.engine.SimpleEngine.popen_uci([enginePath, f"--weights={weightsPath}"])

            fen = request.form.get('fen')
            board = chess.Board(fen)

            result = engine.play(board, chess.engine.Limit(nodes=1))

            engine.quit() 

            source = chess.square_name(result.move.from_square)
            target = chess.square_name(result.move.to_square)

            return jsonify(model=model, source=source, target=target)

        else:
            result = request.form.get('result')
            termination = request.form.get('termination')
            moves = request.form.get('moves')
            bot_points = request.form.get('computer_points')
            player_points = request.form.get('human_points')

            conn.execute("UPDATE Match SET Result = ?, Termination = ?, Moves = ?" 
                        " WHERE MatchID = ?", (result, termination, moves, id_))
            
            conn.execute("UPDATE MatchBot SET Points = ?" 
                        " WHERE MatchID = ? AND BotID = ?", (bot_points, id_, computerID))
            
            conn.execute("UPDATE MatchPlayer SET Points = ?" 
                        " WHERE MatchID = ? AND PlayerID = ?", (player_points, id_, playerID))

            conn.commit()
            conn.close()

            return redirect(url_for('play'))
 
    # Accessing the game after creation (such as via refreshing the page or reopening on new tab)
    if request.method == 'GET':

        # If user tries to access route at an ID that does not exist.
        if not game:
            flash("Game does not exist")
            return redirect(url_for('play'))
        
        computerID = game["Bot"]            # Fetch ID for COMPUTER player
        playerID = current_user.get_id()    # Fetch ID for HUMAN player

        # Find MatchPlayer record and then get username from Player's account table
        player = conn.execute("SELECT * FROM MatchPlayer WHERE (MatchID, PlayerID) = (?, ?)", [id_, playerID]).fetchone()
        playerAccount = conn.execute("SELECT * FROM Player WHERE (PlayerID) = (?)", [playerID]).fetchone()
        username = playerAccount["Username"]

        # Game does not belong to player.
        if not username == current_user.username:
            return redirect(url_for('play'))
        
        # Find MatchBot record
        bot = conn.execute("SELECT * FROM MatchBot WHERE (MatchID, BotID) = (?, ?)", [id_, computerID]).fetchone()

        # Make HUMAN object
        p_human = Player(player["PlayerID"], username , player["Color"], player["Points"])

        # Make COMPUTER object
        bot_username = conn.execute("SELECT * FROM Bot WHERE (BotID) = (?)", [computerID]).fetchone()
        bot_username = bot_username["Username"]
        p_computer = Player(bot["BotID"], bot_username , bot["Color"], bot["Points"])

        # Make MATCH object
        game_obj = Game(game["MatchID"], p_computer, p_human, game["Event"], game["Site"], game["Date"], game["Round"], game["Result"], game["Time"], game["Termination"], game["Moves"])

        conn.close()

    return render_template("pages/game.html", game=game_obj)

# Game creation - currently only BOTs
@app.route("/play", methods=('GET', 'POST'))
@login_required
def play():

    conn = get_db_connection()
    bots = conn.execute('SELECT * FROM Bot').fetchall()
    time_control = conn.execute('SELECT * FROM TimeControl').fetchall()
    conn.close()

    if request.method == 'POST':
        side = request.form['side']
        diff = request.form['difficulty']
        time = request.form['time']

        # Check if values are not empty.
        if not side or not diff or not time:
            flash('Something went wrong... Please refresh the page and try again!')
            return redirect(url_for('play'))
        
        else:   # Submit form to create game.
            
            # If side is not black or white then it is either RAND or invalid. Either way just select a random side value.
            side_choices = ["white", "black"]
            if side not in side_choices:
                side = random.choice(side_choices)

            conn = get_db_connection()
            cursor = conn.cursor()

            # See if difficulty exists in db
            difficulty_get = conn.execute("SELECT * FROM Bot WHERE Rating = (?)", [diff]).fetchone()
            if not difficulty_get:
                flash('Opponent is invalid.')
                return redirect(url_for('play'))
            else:
                bot_id = difficulty_get["BotID"]
                
            # See if time exists in db
            time_get = conn.execute("SELECT * FROM TimeControl WHERE Value = (?)", [time]).fetchone()
            if not time_get:
                flash('Time is invalid.')
                return redirect(url_for('play'))
            
            player_id = current_user.get_id()

            # Create match
            cursor.execute('INSERT INTO Match (Bot, Player, Event, Site, Round, Result, Time, Termination) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                (bot_id, player_id, "Bot Match", "ChessAI.com", "?", "Ongoing", time, "?"))
            
            game_id =  cursor.lastrowid

            # Create Player participant
            cursor.execute('INSERT INTO MatchPlayer (MatchID, PlayerID, Color, Points) VALUES (?, ?, ?, ?)',
                        (game_id, player_id, side, 0))

            # Create Bot participant
            side_choices.remove(side)
            side = side_choices[0]
            cursor.execute('INSERT INTO MatchBot (MatchID, BotID, Color, Points) VALUES (?, ?, ?, ?)',
                        (game_id, bot_id, side, 0))

            conn.commit()
            conn.close()

            return redirect(url_for('game', id_=game_id))

    return render_template("pages/play.html", bots=bots, times=time_control)

# Account creation and login
@app.route("/account")
def account():  

    if current_user.is_authenticated:
        return redirect(url_for('profile'))
    
    return render_template("pages/account.html")

# Route to handle LOGOUT.
@app.route('/logout')
@login_required
def logout():

    print("Stopping scheduler")
    scheduler.remove_all_jobs()

    id = current_user.get_id()
    logout_user()

    conn = get_db_connection()
    conn.execute("UPDATE Player SET Status = 'Offline' WHERE PlayerID = ?", (id))
    conn.commit()

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
            user_exists = conn.execute("SELECT * FROM Player WHERE Username = (?)", [username]).fetchone()
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

                    # Update status when login
                    conn = get_db_connection()
                    conn.execute("UPDATE Player SET Status = 'Online' WHERE PlayerID = ?", (user.id))
                    conn.commit()

                    job = scheduler.add_job(check_active, 'interval', [user.id] , minutes=0.25) # Execute function every set interval
                    scheduler.resume()
                    print("Starting scheduler")

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

                usernamecheck = conn.execute("SELECT * FROM Player WHERE Username = ?", [username]).fetchall()

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
                    cursor = conn.cursor()
                    cursor.execute('INSERT INTO Player (Username, Password, Status, Biography, Picture, Wins, Losses, Draws) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                                (username, password, "Online", "biography_null", "static/images/pfp/default/placeholder.png", 0, 0, 0))
                    
                    # Get the ID of the row just created
                    player_id = cursor.lastrowid

                    conn.commit()
                    conn.close()

                    # Use load_user function to load PlayerID query into a class object of user.
                    user = load_user(player_id)

                    # Use FLASK-LOGIN to load the class object as a user.
                    login_user(user)

                    return redirect(url_for('profile')) 
            else:
                flash('Passwords do not match!', 'register')
                return redirect(url_for('account'))   

    return redirect(url_for('account'))

@app.route('/learn')
@login_required
def learn():
    return render_template("pages/learn.html")

# Player profile page - currently only for the client player
@app.route('/profile', methods=['GET', 'PATCH'])
@login_required
def profile():

    # On page load, load up to 20 games.
    display = request.args.get('display', default = 20, type = int)
    if display < 20: display = 20   # If user manually sets route to a negative number or 0 (which is invalid) reset the display filter to 20

    if request.method == 'PATCH':

        conn = get_db_connection()

        # Get Account ID
        id = current_user.get_id()
        profile = load_user(id)

        # Get value to increment for counter
        counter_to_increment = request.form['counter']

        # If PATCH request returns draw then update draw counter
        if counter_to_increment == "draw":
            increment = int(profile.draws) + 1
            conn.execute("UPDATE Player SET Draws = Draws + 1 WHERE PlayerID = ?", (id))
            conn.commit()

        if counter_to_increment == "win":
            increment = int(profile.wins) + 1
            conn.execute("UPDATE Player SET Wins = ? WHERE PlayerID = ?", (increment, id))
            conn.commit()
            
        if counter_to_increment == "loss":  
            increment = 10
            conn.execute("UPDATE Player SET Losses = Losses + 1 WHERE PlayerID = ?", (id))
            conn.commit()

        conn.close()

    if request.method == 'GET':

        # Get Account ID
        id = current_user.get_id()

        # Search all matches where human participant username matches current user profile
        conn = get_db_connection()

        ongoing_games = conn.execute("SELECT * FROM Match WHERE Player = (?) AND Result = (?)", [id, "Ongoing"]).fetchall()
        finished_games = conn.execute("SELECT * FROM Match WHERE Player = (?) AND Result != (?)", [id, "Ongoing"]).fetchall()

        total = len(finished_games)

        # If games display them
        if ongoing_games or finished_games:

            ongoing = bot_game_obj(id, ongoing_games)
            games = bot_game_obj(id, finished_games, display)

            conn.close()
            return render_template("pages/profile.html", games=games, ongoing=ongoing, total=total)
        
                
        # If no games then omit returning objects games and bot
        else:
            conn.close()
            return render_template("pages/profile.html")
        

# Check if user is active.    
@app.route('/heartbeat', methods=['PATCH'])
@login_required
def heartbeat():

    if request.method == 'PATCH':

        id = current_user.get_id()

        current_time = datetime.now()
        date_time = current_time.strftime("%Y-%m-%d %H:%M:%S")

        conn = get_db_connection()
        conn.execute("UPDATE Player SET LastActive = ? WHERE PlayerID = ?", (date_time, id))

        query = conn.execute("SELECT * FROM Player WHERE PlayerID = ?", (id)).fetchone()

        if query["Status"] == 'Offline':
            conn.execute("UPDATE Player SET Status = 'Online' WHERE PlayerID = ?", (id))

        conn.commit()
        conn.close()

    return ('', 204)


# Get User info  
@app.route('/update')
@login_required
def update():

    id = current_user.get_id()
    user = load_user(id)

    user_obj = {
        "profile_username": user.username,
        "profile_status": user.online,
        "profile_biography": user.biography,
        "avatar": user.picture,
        "profile_wins": user.wins,
        "profile_losses": user.losses,
        "profile_draws": user.draws,
    }

    return user_obj
