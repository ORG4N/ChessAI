window.addEventListener('load', function () {
    
    // Display flash messages div if theres children otherwise hide it.
    const flashes = document.getElementById("validate-flask");
    if (flashes.children.length != 0){
        flashes.classList.remove("hidden");
    }

    // Function that will call VALIDATE() and then determine whether a match is created or user is directed to modify inputs.
    const matchForm = document.getElementById("match-form");
    matchForm.addEventListener("submit", function(event) {

        // Stop page refresh
        event.preventDefault();
        console.log(event);

        const valid = validate();

        // If validation is correct then disable button
        if (valid == "valid"){
            document.getElementById("submitBtn").toggleAttribute('disabled');
            alert("Creating Game...");
            event.target.submit();
        }
    });

})

// Simple function that will make a button stay highlighted when pressed and removes colour from previously selected buttons
function setStart(element){
    document.getElementById("white").classList.remove("selected");
    document.getElementById("rand").classList.remove("selected");
    document.getElementById("black").classList.remove("selected");

    element.classList.add("selected");
    document.getElementById("side-input").value = element.id;

}

// Simple function to show dropdown
function dropdown(id){
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
    document.getElementById("difficulty-text").innerText = value;

    // Set hidden INPUT FIELD value in form to value chosen
    document.getElementById("difficulty-input").value = value;
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
    document.getElementById("time-text").innerText = element.innerText;

    // Set hidden INPUT FIELD value in form to value chosen
    document.getElementById("time-input").value = value;
}

// Function that validates whether STARTING SIDE, TIME, and DIFFICULTY have been selected.
function validate(){

    // Hide all VALIDATION text by default
    document.getElementById("validate").classList.add("hidden");
    document.getElementById("validate-side").classList.add("hidden");
    document.getElementById("validate-rating").classList.add("hidden");
    document.getElementById("validate-time").classList.add("hidden");


    // Remove VALIDATION outline from all items
    document.getElementById("side-box").classList.remove("invalid");
    document.getElementById("rating-box").classList.remove("invalid");
    document.getElementById("time-box").classList.remove("invalid");


    const SIDE = document.getElementById("side-input").value;
    const DIFF = document.getElementById("difficulty-input").value;
    const TIME = document.getElementById("time-input").value;

    if (!SIDE || !DIFF || !TIME){
        document.getElementById("validate").classList.remove("hidden");

        if (!SIDE){
            document.getElementById("validate-side").classList.remove("hidden");
            document.getElementById("side-box").classList.add("invalid");
        }
    
        if (!DIFF){
            document.getElementById("validate-rating").classList.remove("hidden");
            document.getElementById("rating-box").classList.add("invalid");

        }
    
        if (!TIME){
            document.getElementById("validate-time").classList.remove("hidden");
            document.getElementById("time-box").classList.add("invalid");
        }

        return "invalid";

    }

    return "valid"
}