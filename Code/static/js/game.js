var game;
var board;

window.addEventListener('load', function () {
    
    // Use chess.js to create moves
    chess = new Chess()   

    // Default board position is classic chess Start position
    const config = {
        pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
        draggable: true,
        dropOffBoard: 'snapback',
        position: 'start',
        onDragStart,
    }

    // Use chessboardjs to render board on html
    board = Chessboard2('board', config);    

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
function onDragStart (dragInfo) {

    console.log(dragInfo)

    if (dragInfo.orientation === 'white' && !isWhitePiece(dragInfo.piece)) return false
    if (dragInfo.orientation === 'black' && !isBlackPiece(dragInfo.piece)) return false
}

  
function isWhitePiece (piece) { return /^w/.test(piece) }
function isBlackPiece (piece) { return /^b/.test(piece) }

function submitMove(btn){
    alert("Feature not implemented")
}

function control(btn){
    alert("Feature not implemented")
}