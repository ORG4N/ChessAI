var chess = new Chess(); // Use chess.js to create moves
var board = null;

window.addEventListener('load', function () {

    // Default board position is classic chess Start position
    const config = {
        draggable: true,
        dropOffBoard: 'snapback',
        position: 'start',
        showNotation: false,
        onDragStart,
        onDrop,
    }

    // Use chessboardjs to render board on html
    board = Chessboard('board', config);   

    // Resize board to container 
    const h = document.getElementById("board-container").clientHeight + "px"; 
    document.getElementById("board").style.width = h;
    board.resize();

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

function onDrop (source, target) {
    // see if the move is legal
    var move = chess.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })
  
    // illegal move
    console.log(move)
    if (move === null) return 'snapback'
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