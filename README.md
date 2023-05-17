# ChessAI
COMP3000 - Computing Project

### Important !!!
For the AI to work, [download the necessary LC0 version](https://lczero.org/play/download/), and extract it into Code/engine. Ensure .exe is named lc0.exe.

### Currently in development !!!
Will eventually need to use LC0 engine via python bindings - and not as CLI. Will let me host application on web server.

### Need to automate process of creating virtual environment and installing dependencies !!!
For now follow these steps to start project:
1. Git clone (and cd into working directory)
2. Create virtual environment:  ```python -m venv .venv```
3. Install dependencies:        ```pip install -r requirements.txt```
4. Run application:             ```flask --app app --debug run```
5. Open webpage in browser (e.g. http://127.0.0.1:5000)

### Recommended browser: Firefox
Works in Chrome but has some styling issues. Other browsers untested.
