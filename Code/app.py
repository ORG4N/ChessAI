from flask import render_template
from flask import Flask

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True  # Html automatically reloads on server when changes are made and page is refreshed

@app.route("/")
def home():
    return render_template("pages/index.html")
    
@app.route("/play")
def play():
    return render_template("pages/play.html")


@app.route("/learn")
def learn():
    return render_template("pages/learn.html")

@app.route("/profile")
def profile():
    return render_template("pages/profile.html")