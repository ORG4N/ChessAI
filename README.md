![title image](https://github.com/ORG4N/ChessAI/blob/main/docs/images/3000.png)

<p align="center"><strong>Module Overview</strong>
<br>
"To develop the skills required to participate in a live, team-based online/offline software development project within a project management paradigm. To apply appropriate design process, take charge of development milestones, evaluate their software solution as well as consider the broader context of business, legal, social and ethical elements on project delivery."
</p>
<br/>

<h2>Learning Outcomes</h2>

- Work as part of a team in identifying, analysing, proposing and documenting a solution to a specific problem appropriate to the degree and/or field of study.
- Implement an effective solution using appropriate techniques accounting for appropriate legal, social and ethical constraints.
- Evaluate and reflect upon the suitability of the solution to the given problem.

<br>

<h2>Assessments</h2>
The module is assessed via 80% coursework and 20% practice:

<details>
<summary><h3>Coursework</h3></summary>

<b> Interim Report </b>
<br>
Assessment consists of a report that represents all work carried out up until the half-way point of the project. This deliverable consists of 30% of the Coursework mark.

<b> Final Report </b>
<br>
Assessment consists of a report that represents all work carried out up until the finale of the project. This report extends upon the Interim Report. This deliverable consists of 70% of the Coursework mark.
<hr>
</details>

<details>
<summary><h3>Practice</h3></summary>

<b> Marketplace Demonstration </b>
<br>
Assessment consists of a practical demonstration (to peers and lecturers) of an initial prototype at the half-way point of the project.

<b> Showcase Presentation </b>
<br>
Assessment consists of a practical demonstration (to peers and lecturers) of the project and the developed prototype at the finale of the module.
<hr>
</details>


<br>

<h2>About the Project</h2>

<h3> ChessAI </h3>
COMP3000 - Computing Project

<h4> Important </h4>
For the AI to work, [download the necessary LC0 version](https://lczero.org/play/download/), and extract it into Code/engine. Ensure .exe is named lc0.exe.

<h4> Currently in development </h4>
Will eventually need to use LC0 engine via python bindings - and not as CLI. Will let me host application on web server.


<h4> Need to automate process of creating virtual environment and installing dependencies </h4>
For now follow these steps to start project:


1. Git clone (and cd into working directory)
2. Create virtual environment:  ```python -m venv .venv```
3. Activate virtual environment:```.venv\Scripts\Activate```
4. Install dependencies:        ```pip install -r requirements.txt```
5. Run application:             ```flask --app app --debug run```
6. Open webpage in browser (e.g. http://127.0.0.1:5000)


<h4> Recommended browser: Firefox </h4>
Works in Chrome but has some styling issues. Other browsers untested.
