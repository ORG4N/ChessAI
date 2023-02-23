// Simple function that will make a button stay highlighted when pressed and removes colour from previously selected buttons
function setStart(element){
    document.getElementById("white").classList.remove("selected");
    document.getElementById("rand").classList.remove("selected");
    document.getElementById("black").classList.remove("selected");

    element.classList.add("selected")
}

// Simple function to show dropdown
function Dropdown(id){
    const dropdown_element = id + "-values";

    document.getElementById(dropdown_element).classList.toggle("show");
    document.getElementById(dropdown_element).classList.toggle("hidden");
}

// Simple function to set value of DIFFICULTY and highlight button pressed
function setDiff(element){

    const value = element.value;

    // Get parent and see if there is an already selected value, to remove .SELECTED
    const parent = document.getElementById("difficulty-values");
    const active = parent.querySelector('.selected');
    if(active != null){
        active.classList.remove('selected');
    }

    // Add selected class to the clicked element
    element.classList.add("selected");

    // Replace text to show selected VALUE
    const text = document.getElementById("difficulty-selected");
    text.innerText = value;
}

// Simple function to set value of TIME and highlight button pressed
function setTime(element){

    const value = element.value;

    // Get parent and see if there is an already selected value, to remove .SELECTED
    const parent = document.getElementById("time-values");
    const active = parent.querySelector('.selected');
    if(active != null){
        active.classList.remove('selected');
    }

    // Add selected class to the clicked element
    element.classList.add("selected");

    // Replace text to show selected VALUE
    const text = document.getElementById("time-selected");
    text.innerText = element.innerText;
}