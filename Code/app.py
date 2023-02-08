from flask import render_template
from flask import Flask

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True  # Html automatically reloads on server when changes are made and page is refreshed

@app.route("/")
def home():
    return render_template("navbar.html")