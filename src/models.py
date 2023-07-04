from flask_login import UserMixin

class User(UserMixin):
    def __init__(self, id, username, password, created, online, biography, picture, wins, losses, draws):
        self.id = str(id)
        self.username = username
        self.password = password
        self.created = created
        self.online = online
        self.biography = biography
        self.picture = picture
        self.wins = wins
        self.losses = losses
        self.draws = draws
        self.authenticated = False     
         
        def is_anonymous(self):
            return False    
        
        def is_authenticated(self):
            return self.authenticated   
         
        def is_active(self):
            return True    
        
        def get_id(self):
            return self.id

class Player():
    def __init__(self, id, username, color, points):
        self.id = str(id)
        self.username = username
        self.color = color
        self.points = points

class Game():
    def __init__(self, id, computer, human, event, site, date, round_, result, time, termination, moves):
        self.id = str(id)
        self.computer = computer
        self.human = human
        self.event = event
        self.site = site
        self.date = date
        self.round = round_
        self.result = result
        self.time = time
        self.termination = termination
        self.moves = moves