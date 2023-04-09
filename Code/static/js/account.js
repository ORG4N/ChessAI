// Simple function to show dropdown
function dropdown(id){

    const dropdown_element = id + "-dropdown";
    const chevron = id + "-chevron";

    document.getElementById(dropdown_element).classList.toggle("show");
    document.getElementById(dropdown_element).classList.toggle("hidden");


    if (document.getElementById(dropdown_element).classList.contains("show")){
        document.getElementById(chevron).classList.remove("fa-chevron-down");
        document.getElementById(chevron).classList.add("fa-chevron-up");
    }

    else {
        document.getElementById(chevron).classList.remove("fa-chevron-up");
        document.getElementById(chevron).classList.add("fa-chevron-down");
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