DROP TABLE IF EXISTS BotMatch;
DROP TABLE IF EXISTS ComputerParticipant;
DROP TABLE IF EXISTS HumanParticipant;
DROP TABLE IF EXISTS HumanPlayer;
DROP TABLE IF EXISTS ComputerPlayer;
DROP TABLE IF EXISTS TimeControl;

CREATE TABLE BotMatch (

    MatchID INTEGER PRIMARY KEY AUTOINCREMENT,
    Participant1 INTEGER NOT NULL,
    Participant2 INTEGER NOT NULL,
    "Event" TEXT NOT NULL,
    "Site" TEXT NOT NULL,
    "Date" TEXT NOT NULL,
    Round INTEGER NOT NULL,
    Result TEXT NOT NULL,
    "Time" INTEGER NOT NULL,
    Termination TEXT NOT NULL,
    Moves TEXT,

    FOREIGN KEY(Participant1) REFERENCES ComputerParticipant(ComputerID),
    FOREIGN KEY(Participant2) REFERENCES HumanParticipant(PlayerID),
    FOREIGN KEY("Time") REFERENCES TimeControl(Value)
);

CREATE TABLE ComputerParticipant (
    ParticipantID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username INTEGER NOT NULL,
    Color TEXT NOT NULL,
    Points  INTEGER NOT NULL,

    FOREIGN KEY(Username) REFERENCES ComputerPlayer(Username)
);

CREATE TABLE HumanParticipant (
    ParticipantID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username INTEGER NOT NULL,
    Color TEXT NOT NULL,
    Points  INTEGER NOT NULL,

    FOREIGN KEY(Username) REFERENCES HumanPlayer(Username)
);

CREATE TABLE HumanPlayer(
    PlayerID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT UNIQUE NOT NULL,
    "Password" TEXT NOT NULL,
    Created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Online" TEXT NOT NULL,
    Biography TEXT NOT NULL,
    Picture TEXT NOT NULL,
    Wins INTEGER NOT NULL,
    Losses INTEGER NOT NULL,
    Draws INTEGER NOT NULL
);

CREATE TABLE ComputerPlayer(
    ComputerID INTEGER PRIMARY KEY AUTOINCREMENT,
    Username TEXT UNIQUE NOT NULL,
    Rating INTEGER UNIQUE NOT NULL
);

CREATE TABLE TimeControl(
    TimeID INTEGER PRIMARY KEY AUTOINCREMENT,
    "Name" TEXT UNIQUE NOT NULL,
    "Value" INTEGER UNIQUE NOT NULL
);
