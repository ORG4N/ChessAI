var game;
var board;

window.addEventListener('load', function () {

    // Use chess.js to create moves
    game = new Chess()   

    // Default board position is classic chess Start position
    const config = {
        pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
        draggable: true,
        dropOffBoard: 'snapback',
        position: 'start'
    }

    // Use chessboardjs to render board on html
    board = Chessboard2('board', config);    

    // Resize board to container 
    const h = document.getElementById("board-container").clientHeight + "px"; 
    document.getElementById("board").style.width = h;
    board.resize();

    window.setTimeout(makeRandomMove, 100)

    function makeRandomMove () {
        if (game.isGameOver()) return

        const legalMoves = game.moves()
        const randomIdx = Math.floor(Math.random() * legalMoves.length)
        game.move(legalMoves[randomIdx])
        board.position(game.fen())

        window.setTimeout(makeRandomMove, 100)
    }

})

function submitMove(btn){
    alert("Feature not implemented")
}

function control(btn){
    alert("Feature not implemented")
}