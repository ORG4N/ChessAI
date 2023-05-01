window.addEventListener('load', function () {

    const donut = document.getElementById('donut');
    won = 1;
    lost = 1;
    drawn = 1;

    data = {
        datasets: [{
            data: [won,lost,drawn],
            backgroundColor: ["blue", "red", "grey"],
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

})

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