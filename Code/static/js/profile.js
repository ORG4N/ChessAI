window.addEventListener('load', function () {

    const donut = document.getElementById('donut');
    win = 40;
    lose = 10;

    data = {
        datasets: [{
            data: [win,lose],
            backgroundColor: ["blue", "red"],
            borderWidth:1,
            borderColor: "black"
        }],
    
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [
            'Win',
            'Lose',
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
                    enabled: false
                }
            }
        }
    });
})

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