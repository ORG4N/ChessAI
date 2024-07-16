window.addEventListener('load', function () {

    // Set the href for Show More button to reload the page with 20 more results
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    let display = 20;

    // On load, check for display param to calculate next display value.
    if (params.has('display')){

        display = parseInt(params.get("display"));
        if (display < 20 || isNaN(display)){
            display = 20;
        }
    }

    display += 20;
    params.set('display', display);
    document.getElementById("more").href = '/profile?' + params.toString();

    console.log(params)

    // On load, check for filter param to apply to all searched games.
    if (params.has('filter')){
        const filter = "toggle-" + params.get('filter');
        toggle_select(filter)
    }


    // Initialise donut
    const donut = document.getElementById('donut');
    let won = 0;
    let lost = 0;
    let drawn = 0;

    // Find all divs representing games played.
    const completed = document.getElementById("completed");
    const children = completed.children;

    let total = sessionStorage.getItem("total");
    if(children.length >= total){ document.getElementById('more').remove(); }

    // Only need to iterate over the most recent 20 games, but it is possible for there to be less than 20 games in total so decide which number is less to avoid index errors  
    let recent = 20;
    if (children.length < recent){recent = children.length;}

    for(let i=0; i<recent; i++){
        let child = children[i];

        if(child.children[0].classList.contains("lose")){ lost++;}
        else if(child.children[0].classList.contains("win")){ won++;}
        else {drawn++;}
    }

    document.getElementById("win-lose").innerText = won + "W " + lost + "L " + drawn + "D";


    data = {
        datasets: [{
            data: [won,lost,drawn],
            backgroundColor: ["#0096FF", "#FF1A00", "#A8A8A8"],
            borderWidth:1,
            borderColor: "black"
        }],
    
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            'Won',
            'Lost',
            "Drawn"
        ]
    };

    var chart = new Chart(donut, {
        type: "doughnut",
        data: data,
        options: {
            maintainAspectRatio: false,
            cutout: 40,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true
                }
            }
        }
    });

    const sections = ["history", "badges", "friends"];

    for (var i=0; i<sections.length; i++){

        const section = sections[i];
        const button_id = section + "-btn";
        const button = document.getElementById(button_id);

        button.addEventListener('click', function(){
            // Change the styling of the nav button on the container
            selected(button);
        
            // Display the currently selected content
            content(button);
        });
    }

    const filters = document.getElementsByClassName("filter-btn")
    
    for (var i=0; i<filters.length; i++){

        const button = filters[i]

        button.addEventListener('click', function(){
            selected_filter(button)
        })
    }

    setInterval(update_current_profile, 1000 * 60 * 0.25); // Interval read in miliseconds - so we convert minutes to miliseconds


})

function update_current_profile() {
    $.ajax({
      url: '/update',
      type: 'GET',
      success: function(response) {

        for (const [key, value] of Object.entries(response)) {

            const element = document.getElementById(key)

            if (key == "avatar"){
                element.title = value
            }

            else {
                element.innerText = value
            }

        }

      }
    });
  }

function selected_filter(clicked){

    for(const selected of document.getElementsByClassName("selected-btn")){
        selected.classList.remove("selected-btn")
    }

    clicked.classList.add("selected-btn")

}

function toggle_select(button){

    // Extract appropriate filter name from button id.
    const filter_name = button.split('-').pop();

    // Get current URL then either overwrite or append new filter.
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    
    params.set('filter', filter_name);

    // Add new url to href field of the show more button so when user loads more search results, the same filters are applied.
    const button_element = document.getElementById("more");
    if (button_element !== null){ button_element.href = url + '&filter=3min';} !!!!!

    // Element that contains all completed games to filter.
    const container = document.getElementById("completed");
    const children = container.children;

    // Unhide all hidden children.
    const hidden = container.querySelectorAll(".hidden");
    for (var i = 0; i < hidden.length; i++) {
        hidden[i].classList.remove("hidden");
    }

    // Hide display count.
    const count = document.getElementById("total");
    count.classList.add("hidden");

    // Show all games.
    if (button == 'toggle-all'){
        count.classList.remove("hidden");
    }

    // Show all games with Human players.
    if (button == 'toggle-friends'){
        for (game of children){
            const event = game.querySelectorAll(".event");
            if (event[0].innerText != 'PLAYER MATCH'){
                game.classList.add('hidden');
            }
        }

    }

    // Show all games with Bot players.
    if (button == 'toggle-bots'){
        for (game of children){
            const event = game.querySelectorAll(".event");
            if (event[0].innerText != 'BOT MATCH'){
                game.classList.add('hidden');
            }
        }

    }

    // Show all games where game length is 1 minute.
    if (button == 'toggle-1minute'){
        for (game of children){
            const time = game.querySelectorAll(".time");
            if (time[0].innerText != '1 min'){
                game.classList.add('hidden');
            }
        }
    }

    // Show all games where game length is 3 minutes.
    if (button == 'toggle-3minute'){
        for (game of children){
            const time = game.querySelectorAll(".time");
            if (time[0].innerText != '3 min'){
                game.classList.add('hidden');
            }
        }
    }
    
    // Show all games where game length is 5 minutes.
    if (button == 'toggle-5minute'){
        for (game of children){
            const time = game.querySelectorAll(".time");
            if (time[0].innerText != '5 min'){
                game.classList.add('hidden');
            }
        }
    }

    // Show all games where game length is 10 minutes.
    if (button == 'toggle-10minute'){
        for (game of children){
            const time = game.querySelectorAll(".time");
            if (time[0].innerText != '10 min'){
                game.classList.add('hidden');
            }
        }
    }
}

// Show selected section but hide others.
function content(clicked){

    // Hide all section
    document.getElementById("history-section").classList.add("hidden");
    document.getElementById("badges-section").classList.add("hidden");
    document.getElementById("friends-section").classList.add("hidden");

    // Create target to get element with section id
    const target = clicked.id.split("-")[0] + "-section";
    const target_id = document.getElementById(target);

    // Remove hidden class from target we want to display
    target_id.classList.remove("hidden");
}

// Selcted button has a unique style.
function selected(clicked){
    
    // Remove selected from all button elements

    const btns = clicked.parentElement.children;
    
    for (var i=0; i<btns.length; i++){
        const element = btns[i];

        if (element.classList.contains("selected")){
            element.classList.remove("selected")
        }
    }

    // Add se;ected to the button element pressed.
    clicked.classList.add("selected");
}

function edit(btn){
    alert("Feature not implemented")
}