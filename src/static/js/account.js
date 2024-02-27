// On window load, add event listener to call prevent default when button is clicked to submit forms
window.addEventListener('load', function () {
 
    // If dropdowns were open before refresh then reopen them.
    dropdownOnload("login");
    dropdownOnload("create");

    // Display flash messages div if theres children otherwise hide it.
    const flashes_login = document.getElementById("validate-flask-login");
    if (flashes_login.children.length != 0){
        flashes_login.classList.remove("hidden");
    }

    const flashes_register = document.getElementById("validate-flask-create");
    if (flashes_register.children.length != 0){
        flashes_register.classList.remove("hidden");
    }

    const loginForm = document.getElementById("login-dropdown");
    loginForm.addEventListener("submit", function(event) {

        // Stop page refresh
        //event.preventDefault();

        // Submit form.
        event.currentTarget.submit();
    });

    const createForm = document.getElementById("create-dropdown");
    createForm.addEventListener("submit", function(event) {
        
        // Stop page refresh
        event.preventDefault();

        // Get password values.
        const password = event.currentTarget.create_password1.value;
        const password_confirm = event.currentTarget.create_password2.value;

        // Check if PASSWORDS MATCH
        if (password != password_confirm){

            const field = document.getElementById("create-password-2");
            const m = "Passwords do not match.";
            message(field, m);
        }
        else{
            // Create user POST.
            // Validate on backend.
            // Check if user exists.
            alert("Create user");
            event.currentTarget.submit();
        }

    });

    const createFormFields = ["create-username", "create-password-1", "create-password-2"];

    for (var i=0; i<createFormFields.length; i++){
        const field = document.getElementById(createFormFields[i]);

        field.addEventListener("input", function(event) {
            const inputValue = event.target.value;                              // Username field value
            const minLen = parseInt(event.target.attributes.minlength.value);   // minLen taken from html
            const maxLen = parseInt(event.target.attributes.maxlength.value);   // maxLen taken from html
            
            // For USERNAME field only
            if(event.target.id == "create-username"){

                // Forbidden char values for USERNAME and PASSWORD.
                const forbidden =  /[`!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?~]/;

                // If USERNAME contains SPECIAL CHARACTERS or WHITE SPACE
                if(forbidden.test(inputValue) || /\s/.test(inputValue)){
                    const m = "Username cannot contain special character characters or white space. Please only use letters and numbers.";
                    message(field, m);
                    return false;
                }
            }

            if(/\s/.test(inputValue)){
                const m = "Field cannot contain white space. Please only use letters, numbers, and underscores.";
                message(field, m);
                return false;
            }

            // If INPUT is less than N chars long
            if(inputValue.length < minLen ){
                const m = "Please use atleast " + minLen + " characters.";
                message(field, m);
                return false;
            }

            // If INPUT is greater than N chars long
            if(inputValue.length > maxLen ){
                const m = "Please use less than " + maxLen + " characters.";
                message(field, m);
                return false;
            }

            else{
                field.setCustomValidity("");
                field.reportValidity(); 
            }

        });
    }
  
})

function message(input, text){
    input.setCustomValidity(text);
    input.reportValidity();
}

// Simple function to show dropdown
function dropdown(id){

    const dropdown_element = id + "-dropdown";
    const chevron = id + "-chevron";

    document.getElementById(dropdown_element).classList.toggle("show");
    document.getElementById(dropdown_element).classList.toggle("hidden");

    if (document.getElementById(dropdown_element).classList.contains("show")){
        document.getElementById(chevron).classList.remove("fa-chevron-down");
        document.getElementById(chevron).classList.add("fa-chevron-up");
        localStorage.setItem(id, "show");

    }

    else {
        document.getElementById(chevron).classList.remove("fa-chevron-up");
        document.getElementById(chevron).classList.add("fa-chevron-down");
        localStorage.setItem(id, "hide");
    }
}

// Open dropdowns on page load
function dropdownOnload(id){
    const value = localStorage.getItem(id);

    if (value == "show"){
        dropdown(id);
    }
}

// Hide password text or display password text based on clicking eye icon.
function togglePassword(button){

    // Gets the previous element (which should structurally be the input field)
    const input_element = button.previousElementSibling;
    const icon = button.firstElementChild;

    // Convert password to text OR text to password
    const type = input_element.getAttribute('type') === 'password' ? 'text' : 'password';
    input_element.setAttribute('type', type);

    // Change the icon
    if (type == 'text'){
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }

    else{
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    }
}

function setType(element){
    if (element.value.length == 0){ element.setAttribute('type', 'text')}
    else{ element.setAttribute('type', 'password')}
}

function guest(){
    alert("Feature not implemented")
}

function forgot(){
    alert("Feature not implemented")
}