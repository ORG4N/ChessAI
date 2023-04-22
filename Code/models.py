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
