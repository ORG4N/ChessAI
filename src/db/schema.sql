DROP TABLE IF EXISTS Match;
DROP TABLE IF EXISTS MatchBot;
DROP TABLE IF EXISTS MatchPlayer;
DROP TABLE IF EXISTS Player;
DROP TABLE IF EXISTS Bot;
DROP TABLE IF EXISTS TimeControl;

CREATE TABLE Match (

    MatchID INTEGER PRIMARY KEY AUTOINCREMENT,
    Bot INTEGER NOT NULL,
    Player INTEGER NOT NULL,
    "Event" TEXT NOT NULL,
    "Site" TEXT NOT NULL,
    "Date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Round TEXT NOT NULL,
    Result TEXT NOT NULL,
    "Time" INTEGER NOT NULL,
    Termination TEXT NOT NULL,
    Moves TEXT,

    FOREIGN KEY(Bot) REFERENCES MatchBot(BotID),
    FOREIGN KEY(Player) REFERENCES MatchPlayer(PlayerID),
    FOREIGN KEY("Time") REFERENCES TimeControl("Value")
);

CREATE TABLE MatchBot (
    MatchID INTEGER NOT NULL,
    BotID INTEGER NOT NULL,
    Color TEXT NOT NULL,
    Points  INTEGER NOT NULL,

    FOREIGN KEY(MatchID) REFERENCES Match(MatchID),
    FOREIGN KEY(BotID) REFERENCES Player(PlayerID)
);

CREATE TABLE MatchPlayer (
    MatchID INTEGER NOT NULL,
    PlayerID INTEGER NOT NULL,
    Color TEXT NOT NULL,
    Points  INTEGER NOT NULL,

    FOREIGN KEY(MatchID) REFERENCES Match(MatchID),
    FOREIGN KEY(PlayerID) REFERENCES Player(PlayerID)
);


CREATE TABLE Player(
    PlayerID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT UNIQUE NOT NULL,
    "Password" TEXT NOT NULL,
    "Status" TEXT NOT NULL,
    Biography TEXT NOT NULL,
    Created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Picture TEXT NOT NULL,
    Wins INTEGER NOT NULL,
    Losses INTEGER NOT NULL,
    Draws INTEGER NOT NULL
);

CREATE TABLE Bot(
    BotID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT UNIQUE NOT NULL,
    Rating TEXT NOT NULL
);

CREATE TABLE TimeControl(
    TimeID INTEGER PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT UNIQUE NOT NULL,
    "Value" INTEGER UNIQUE NOT NULL
);
