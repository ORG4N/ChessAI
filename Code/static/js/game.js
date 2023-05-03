var chess = new Chess() // Use chess.js to create moves
var board = null

window.addEventListener('load', function () {

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

    // Use chessboardjs to render board on html
    board = Chessboard('board', config)   

    // Resize board to container 
    const h = document.getElementById("board-container").clientHeight + "px"
    document.getElementById("board").style.width = h
    board.resize()

    // Human is white so Computer is black
    if (game.human.color == "white"){
        document.getElementById("white_name").innerText = game.human.username
        document.getElementById("black_name").innerText = game.computer.username
        board.orientation('white')
    }

    // Human is black so Computer is white
    else{
        document.getElementById("white_name").innerText = game.computer.username
        document.getElementById("black_name").innerText = game.human.username
        board.orientation('black')

        window.setTimeout(makeRandomMove, 250)
    }


    document.getElementById("time").innerText = game.time
    document.getElementById("rating").innerText = game.computer.username.substring(4)
    document.getElementById("player").innerText = game.human.username
    document.getElementById("computer").innerText = game.computer.username

})

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
        
        // Store turn because .move() changes the turn and we need to append to the history AFTER making the move.
        turn = chess.turn()

        chess.move({ from: source, to: target, promotion: 'q'})
    }

    // Exception will be thrown if move is illegal. 
    catch (e){
        alert(e)
        return 'snapback'
    }

    window.setTimeout(makeRandomMove, 250)
}

// Board position has changed.
function onChange (oldPos, newPos) {

    // Remove all highlighted pieces on board.
    removeHighlight()

    // If Game is over then alert the winner.
    if(chess.isGameOver()){

        if(chess.isCheckmate()){
            if(chess.turn() == 'w') {
                game.result = "1-0"
                alert("Game over. Black has won. White has lost.") 
            }

            if(chess.turn() == 'b') {
                game.result = "0-1"
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

        // If the turn is currently BLACK then WHITE's turn has just ended. 
        // As white plays first, each time they finish a turn update the history by creating a new row.
        if(chess.turn() == 'b'){

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

        else{
            // Set black value. This statement runs if white turn.
            document.getElementById(row.id).lastChild.innerText = values[2]

            black = document.getElementById(row.id).lastChild
            prependHistory(black, values[2][0])
        }
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
        
    console.log("King is at " + square)

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
}

// Remove styling from all pieces.
function removeHighlight(){
    $('#board .square-55d63').css('background', '')
    $('#board .square-55d63').css('opacity', '')
}

function makeRandomMove () {
    var possibleMoves = chess.moves()
  
    // game over
    if (possibleMoves.length === 0) return
  
    var randomIdx = Math.floor(Math.random() * possibleMoves.length)
    chess.move(possibleMoves[randomIdx])
    board.position(chess.fen())
}

function moveNumber(){
    const split = chess.fen().split(" ")
    const last = split.length - 1

    return parseInt(split[last])
}

function resign(btn){
    chess.clear()
    board.position(chess.fen())

    if (game.computer.color == "black"){
        document.getElementById("black").style.backgroundColor = "green"
        document.getElementById("white").style.backgroundColor = "red"
    } 

    else{
        document.getElementById("black").style.backgroundColor = "red"
        document.getElementById("white").style.backgroundColor = "green"
    }

    alert("Winner is: " + game.computer.username + " (" + game.computer.color + ")")

}

function submitMove(btn){
    alert("Feature not implemented")
}

function control(btn){
    alert("Feature not implemented")
}