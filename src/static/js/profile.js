window.addEventListener('load', function () {

    // URL and params
    let url = new URL(window.location.href);
    let params = new URLSearchParams(url.search);

    // Set donut values and find element ID
    const donut = document.getElementById('donut');
    let won = 0;
    let lost = 0;
    let drawn = 0;

    // Total count of all games user has finished
    const total = sessionStorage.getItem("total");

    // Only do this stuff if games are being displayed
    if (total){

        // Find all divs representing games played.
        const completed = document.getElementById("completed");
        const children = completed.children;

        // If all games are displayed, remove show more button
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

        // If there is a current filter then apply filters. Used incase of refresh.
        if(params.has('filter')){
            const button_id = "toggle-" + params.get('filter')
            const element = document.getElementById(button_id)
            filter_content(element)
        }


    }

    // Chart.js initialising data for donut
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

    // Chart.js setting donut settings
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


    // For history, badges, friends elements create click event listener to update style + content
    const sections = ["history", "badges", "friends"];

    for (var i=0; i<sections.length; i++){

        const button_id = sections[i] + "-btn";
        const button = document.getElementById(button_id);

        button.addEventListener('click', function() {
            // Change the styling of the nav button on the container
            selected(button);
        
            // Display the currently selected content
            content(button);
        });
    }

    // For following filters create click event listener to update url param
    const filters = ["all", "friends", "bots", "1minute", "3minute", "5minute", "10minute"];
    for (var i=0; i<filters.length; i++){

        const filter = filters[i];
        const button_id = "toggle-" + filter;
        const button = document.getElementById(button_id);

        button.addEventListener('click', function() {

            filter_style(button);       // Changes the styling of the filter button
            filter_content(button);      // Changes the content displayed according to selected filter
            filter_url(url, filter);      // Appends the current filter to the URL

        });
    }

    const button = document.getElementById('more')

    if (button){
        button.addEventListener('click', function() {

            let display = Number(params.get("display"));               // Read params for display count
            if (isNaN(display) || display < 20){ display = 20; }      // If not found, set to default.
            display = display + 20;                                    // Increment by 20 to show 20 more results

            // Create new url and set calculated display as a param
            let new_url = new URL(window.location.href);
            new_url.searchParams.set('display', display);

            // Set new url to href value of button - redirects to new url page
            button.href = new_url;
            alert(button.href)

        });
    }
    
    // Update profile every 15 seconds
    setInterval(update_current_profile, 1000 * 60 * 0.25); // Interval read in miliseconds - so we convert minutes to miliseconds

});

// Update profile data on page
function update_current_profile() {
    $.ajax({
      url: '/update',
      type: 'GET',
      success: function(response) {

        for (const [key, value] of Object.entries(response)) {

            const element = document.getElementById(key)

            if (key == "avatar"){
                element.title = value;
            }

            else {
                element.innerText = value;
            }

        }

      }
    });
}

// Adding filter to URL parameter
function filter_url(url, new_param){

    // Will overwrite filter if existing or add new para,
    url.searchParams.set('filter', new_param)

    // Overwrite href of Show More button so when redirected, filters are still applied
    const element = document.getElementById("more");
    if (element) {element.href = url;}

    // Append params to URL in browser
    const params = '?' + url.searchParams.toString();
    window.history.replaceState(null, null, params);

}

// Highlight selected filter button
function filter_style(button){

    for(const selected of document.getElementsByClassName("selected-btn")){
        selected.classList.remove("selected-btn")
    }

    button.classList.add("selected-btn")
}

// Hide/Display content according to selected filter
function filter_content(button){

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

    // Show all games -- All games will already be shown but we can unhide count of how many elements are bein shown
    if (button.id == 'toggle-all'){
        count.classList.remove("hidden");
    }

    // Show all games with Human players.
    if (button.id == 'toggle-friends'){
        for (game of children){
            const event = game.querySelectorAll(".event");
            if (event[0].innerText != 'PLAYER MATCH'){
                game.classList.add('hidden');
            }
        }
    }

    // Show all games with Bot players.
    if (button.id == 'toggle-bots'){
        for (game of children){
            const event = game.querySelectorAll(".event");
            if (event[0].innerText != 'BOT MATCH'){
                game.classList.add('hidden');
            }
        }

    }

    // Show all games where game length is 1 minute.
    if (button.id == 'toggle-1minute'){
        for (game of children){
            const time = game.querySelectorAll(".time");
            if (time[0].innerText != '1 min'){
                game.classList.add('hidden');
            }
        }
    }

    // Show all games where game length is 3 minutes.
    if (button.id == 'toggle-3minute'){
        button.classList.add("selected-btn")
        for (game of children){
            const time = game.querySelectorAll(".time");
            if (time[0].innerText != '3 min'){
                game.classList.add('hidden');
            }
        }
    }
    
    // Show all games where game length is 5 minutes.
    if (button.id == 'toggle-5minute'){
        for (game of children){
            const time = game.querySelectorAll(".time");
            if (time[0].innerText != '5 min'){
                game.classList.add('hidden');
            }
        }
    }

    // Show all games where game length is 10 minutes.
    if (button.id == 'toggle-10minute'){
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

    // Add selected to the button element pressed.
    clicked.classList.add("selected");
}

function edit(btn){
    alert("Feature not implemented")
}