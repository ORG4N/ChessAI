var chess = new Chess() // Use chess.js to create moves
var board = null
var countdown = null

// Default board position is classic chess Start position
const config = {
    draggable: true,
    dropOffBoard: 'snapback',
    position: 'start',
    showNotation: true,
    onDragStart,
    onDrop,
    onChange
}

window.addEventListener("beforeunload", function () {   

    if(!$('#time').hasClass('pause')) {
        document.getElementById("time").classList.add('pause');
    }

    var obj = {
        "result": game.result,
        "termination": game.termination,
        "time"  : countdown/60,
        "pgn"   : chess.pgn()
    }

    window.sessionStorage.setItem(game.id, JSON.stringify(obj))
    
})

window.addEventListener('load', function () {

    // Use chessboardjs to render board on html
    board = Chessboard('board', config)   

    // Load object from session storage. This is used to load a game into a tab that has been refreshed. Otherwise, game must be played from the start.
    var obj = sessionStorage.getItem(game.id);      
    obj = jQuery.parseJSON(obj);  

    // Resize board to container 
    const h = document.getElementById("board-container").clientHeight + "px"
    document.getElementById("board").style.width = h
    board.resize()

    // Human is white so Computer is black
    if (game.human.color == "white"){
        document.getElementById("white_name").innerText = game.human.username
        document.getElementById("black_name").innerText = game.computer.username
        board.orientation('white')

        countdownTimer()
    }

    // Human is black so Computer is white
    else{
        document.getElementById("white_name").innerText = game.computer.username
        document.getElementById("black_name").innerText = game.human.username
        board.orientation('black')

        // Computer to make first move.
        if (chess.turn() == 'w' && game.result == "Ongoing"){
            document.getElementById("time").classList.add('pause');

            $.ajax({
                url: view,
                type: 'POST',
                data: {
                    fen: chess.fen()
                },
                success: function (response) {
                    console.log(response)
                    makeBotMove(response.source, response.target)
                },
                error: function (response) {
                    window.setTimeout(makeRandomMove, 250)
                    console.log("error")
                }
            });
        }

        countdownTimer()
    }

    // If game is over - loaded from database.
    if (game.result != "Ongoing"){

        chess.loadPgn(game.moves)              // Load pgn from session storage. Loads match history moves. Loads board into latest position.
        var history = chess.history()       // Get match history moves.
        chess.reset()                       // Reset the board because we need each move to be played for the history html to be created.

        history.forEach(m => {
            chess.move(m)                   // Make move one by one.
            board.position(chess.fen())     // Each time a move is made update the board.
        });
        
        resultDisplay()
    }


    // If object exists - basically if page has been refreshed or closed previously
    else if(obj){

        chess.loadPgn(obj.pgn)              // Load pgn from session storage. Loads match history moves. Loads board into latest position.
        var history = chess.history()       // Get match history moves.
        chess.reset()                       // Reset the board because we need each move to be played for the history html to be created.

        history.forEach(m => {
            chess.move(m)                   // Make move one by one.
            board.position(chess.fen())     // Each time a move is made update the board.
        });

        game.time = obj.time
    }


    document.getElementById("time").innerText = game.time + ":00"
    document.getElementById("rating").innerText = game.computer.username.substring(4)
    document.getElementById("player").innerText = game.human.username
    document.getElementById("computer").innerText = game.computer.username
})

function countdownTimer(){
    var startTime = Date.now();

    var interval = setInterval(function() {

        if(!$('#time').hasClass('pause')) {
            var elapsedTime = Date.now() - startTime;
            countdown = (game.time*60) - (elapsedTime / 1000).toFixed(0);
            //document.getElementById("time").innerHTML = countdown.toString().slice(0,3)

            document.getElementById("time").innerHTML = fancyTimeFormat(countdown)

            if (countdown <= 0){
                document.getElementById("time").innerHTML  = "TIME'S UP"
                clearInterval(interval)

                // If human is white then score is 0-1 (they lost). Likewise 1-0 if they are black.
                if (game.human.color == "white"){
                    game.result = "0-1"
                } else{
                    game.result = "1-0"
                }

                game.termination = "time forfeit"
                alert("Player has run out of time.\nComputer wins: " + game.computer.username + " (" + game.computer.color + ")")
                result()
            } 
        }

    }, 100);
}

function fancyTimeFormat(duration) {
    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;
  
    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";
  
    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
  
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
  
    return ret;
  }

// only allow pieces to be dragged when the board is oriented in their direction
function onDragStart (source, piece, position, orientation) {

    // Game is over so pieces cannot be moved.
    if (chess.isGameOver()) return false

    // Example: If turn is white and player is white then check if the piece being picked up is not black then make move.
    // 1. Check if turn is for player.
    // 2. And also check if the 'dragged' piece belongs to players colour side.
    // 3. Return true if piece can be moved; Return false if move is illegal.

    if (chess.turn() == 'w' && orientation == 'white' && game.human.color == 'white' && piece.search(/^w/) !== -1) { return true }
    if (chess.turn() == 'b' && orientation == 'black' && game.human.color == 'black' && piece.search(/^b/) !== -1) { return true }
    else{ return false}
  }

function onDrop (source, target, piece) {

    // If player puts piece back where it came from then return snapback. Move is ongoing.
    if(source == target){ return 'snapback'}

    // Make the move, from source to target. Source is the location of the piece picked up. Target is the location where the piece is dropped.
    try{
        chess.move({ from: source, to: target, promotion: 'q'})
        board.position(chess.fen())
        document.getElementById("time").classList.add('pause');

        if(!chess.isGameOver()){

            $.ajax({
                url: view,
                type: 'POST',
                data: {
                    fen: chess.fen()
                },
                success: function (response) {
                    console.log(response)
                    makeBotMove(response.source, response.target)
                },
                error: function (response) {
                    window.setTimeout(makeRandomMove, 250)
                    console.log("error")
                }
            });
        }
    }

    // Exception will be thrown if move is illegal. 
    catch (e){
        alert(e)
        return 'snapback'
    }  
}

// Board position has changed.
function onChange (oldPos, newPos) {

    // Remove all highlighted pieces on board.
    removeHighlight()

    // If Game is over then alert the winner.
    if(chess.isGameOver()){

        document.getElementById("time").classList.add('pause');

        if(chess.isCheckmate()){
            if(chess.turn() == 'w') {
                game.result = "0-1"
                alert("Game over. Black has won. White has lost.") 
            }

            if(chess.turn() == 'b') {
                game.result = "1-0"
                alert("Game over. White has won. Black has lost.") 
            }
        }

        else if (chess.isDraw()){
            game.result = "1/2-1/2"

            if (chess.isInsufficientMaterial()){
                alert("Game over. Draw: insufficient material.") 
            }

            else if (chess.isStalemate()){
                alert("Game over. Draw: stalemate.") 
            }
    
            else if (chess.isThreefoldRepetition()){
                alert("Game over. Draw: threefold repetition (current board position has occurred three or more times).")
            }

            else {
                alert("Game over. Draw: 50-move rule.") 
            }
        }

        game.termination = "normal"
        result()
    }

    else{

        // If King is in check then highlight it red
        if (chess.inCheck()){
            highlightCheck(oldPos)
        }

        // Move is highlighted when made. 
        highlightLastMove()

        const table = document.getElementById("history")    // Get the ID of the table where MOVE history is displayed.
        const row = document.createElement("div")           // Each row represents white' and black' move on the same turn.
        row.classList.add("row")

        // PGN is a large string that contains format of moves played. Split by comma to get each turn.
        const pgn = chess.pgn({ maxWidth: 5, newline: ',' }).split(",") 

        const values = pgn[pgn.length-1].split(" ")         // Split again to seperate Move num, white move, black move.

        row.id = values[0].slice(0, -1)                     // Remove '.' from string and set as id of row.

        const item = document.createElement("div")          // Create generic row 'item'.
        item.classList.add("item", "value")                 // Set classes for CSS styling
        item.innerText = "?"                                // Display ? for each item when move has not been made.

        // If turn not 1
        // If last row id = this row id

        // If the turn is currently BLACK then WHITE's turn has just ended. 
        // As white plays first, each time they finish a turn update the history by creating a new row.
        if(chess.turn() == 'b'){
            if (row.id != table.lastElementChild.id){
                const num = item.cloneNode(true)        // Create a copy of generic ITEM element for num, white, black
                const white = item.cloneNode(true)      
                const black = item.cloneNode(true)

                num.innerText = values[0]               // First element is move number, example: '1.'
                white.innerText = values[1]             // Second element is white move, example: 'Qh5'

                prependHistory(white, values[1][0])

                // Add the three items to the row.
                row.appendChild(num)
                row.appendChild(white)
                row.appendChild(black)

                // Add the row to the table.
                table.appendChild(row) 
            }
        }

        else{
            // Set black value. This statement runs if white turn.
            document.getElementById(row.id).lastChild.innerText = values[2]

            black = document.getElementById(row.id).lastChild
            prependHistory(black, values[2][0])
        }

        table.scrollTop = table.scrollHeight - table.clientHeight;

    }
}

// Prepend move history with chess piece icons
function prependHistory(div, value){

    const icon = document.createElement("i")
    icon.classList.add("fa-solid", "fa-fw")    

    if(value == 'R'){ 
        icon.classList.add("fa-chess-rook") 
        div.prepend(icon)
    }

    else if(value == 'N'){ 
        icon.classList.add("fa-chess-knight") 
        div.prepend(icon)
    }

    else if(value == 'B'){ 
        icon.classList.add("fa-chess-bishop") 
        div.prepend(icon)
    }

    else if(value == 'Q'){ 
        icon.classList.add("fa-chess-queen") 
        div.prepend(icon)
    }

    else if(value == 'K'){ 
        icon.classList.add("fa-chess-king") 
        div.prepend(icon)
    }

    else if(value == 'O'){ 
        icon.classList.add("fa-chess") 
        div.prepend(icon)
    }

    else{ 
        icon.classList.add("fa-chess-pawn") 
        div.prepend(icon)
    }
}

// Using the updated position find where the king is and highlight the square. Check.
function highlightCheck(pos){

    // Search for for bK or wK (black King or white King)
    var toFind = chess.turn() + 'K'
    var square = Object.keys(pos).find(item => pos[item] === toFind);

    // Make checkmated king square red.
    var $square = $('#board .square-' + square)
    var background = '#CD5C5C'
    $square.css('background', background)
}

// Highlight last move made on the board.
function highlightLastMove(){

    // Get history and find last move made.
    const i = chess.history().length-1
    const lastMove = chess.history({ verbose: true })[i]

    var background, $square
    background = '#ffff00'

    // From: make yellow and apply opacity to seem darker.
    $square = $('#board .square-' + lastMove.from)
    $square.css('background', background)
    $square.css('opacity', 0.8)

    // To: make yellow.
    $square = $('#board .square-' + lastMove.to)
    $square.css('background', background)

    return lastMove.san
}

// Remove styling from all pieces.
function removeHighlight(){
    $('#board .square-55d63').css('background', '')
    $('#board .square-55d63').css('opacity', '')
}

function makeBotMove (source, target){
    chess.move({ from: source, to: target, promotion: 'q'})
    board.position(chess.fen())
    document.getElementById("time").classList.remove('pause');
}

function makeRandomMove () {

    var possibleMoves = chess.moves()
  
    // game over
    if (possibleMoves.length === 0) return
  
    var randomIdx = Math.floor(Math.random() * possibleMoves.length)
    chess.move(possibleMoves[randomIdx])
    board.position(chess.fen())

    document.getElementById("time").classList.remove('pause');
}

function resultDisplay(){
    config.draggable = false
    config.position = chess.fen
    document.getElementById("time").classList.add('pause')
    document.getElementById("resign").disabled = true

    if (game.result == "0-1"){
        document.getElementById("white").style.backgroundColor = "red"
        document.getElementById("black").style.backgroundColor = "green"
    } 

    if (game.result == "1-0"){
        document.getElementById("white").style.backgroundColor = "green"
        document.getElementById("black").style.backgroundColor = "red"
    }

    if (game.result == "1/2-1/2"){
        document.getElementById("white").style.backgroundColor = "red"
        document.getElementById("black").style.backgroundColor = "red"
    }


}

function getPlayerResult(){

    let result_counter_to_update

    // If draw, then increment Draw counter
    if (game.result == "1/2-1/2"){
        result_counter_to_update = "draw"
    }

    // If player is white
    else if (game.human.color == "white"){

        // If white (aka player) wins, then incremenent Win counter
        if (game.result == "1-0"){
            result_counter_to_update = "win"
        }

        // If white (aka player) loses, then incremenent Loss counter
        if (game.result == "0-1"){
            result_counter_to_update = "loss"
        }
    }

    // If player is black
    else{

        // Black loses
        if (game.result == "1-0"){
            result_counter_to_update = "loss"
        }

        // Black wins
        if (game.result == "0-1"){
            result_counter_to_update = "win"
        }
    }

    console.log(result_counter_to_update)

    $.ajax({
        url: '/profile',
        type: 'PATCH',
        data: {counter: result_counter_to_update},
        success: function (response) {
            console.log("Updated + ", result_counter_to_update )
        },
        error: function (response) {
            console.log("error")
        }
    });
}

function result(){

    game.moves = chess.pgn()
    resultDisplay()

    $.ajax({
        url: view,
        type: 'POST',
        data: {
            result: game.result,
            termination: game.termination,
            moves: game.moves,
            computer_points: String(game.computer.points),
            human_points: String(game.human.points)
        },
        success: function (response) {
            console.log("posted")
            getPlayerResult()
        },
        error: function (response) {
            console.log("error")
        }
    });
}

function resign(){
    
    // If player is white then score is 0 for White, 1 for Black
    if (game.human.color == "white"){
        game.result = "0-1"
    }

    // Else player is black. Score is 1 for Computer on white, 0 for Player on black
    else{
        game.result = "1-0"
    }

    game.termination = "abandoned"

    alert("Player has resigned.\nComputer wins: " + game.computer.username + " (" + game.computer.color + ")")
    result()
}

function submitMove(btn){
    alert("Feature not implemented")
}

function control(btn){
    alert("Feature not implemented")
}





// Push result to database.
// When player opens page, load chess.moves onto board.
// When player opens page, load chess.moves history onto history.
// If logged in user != game human then disable config.