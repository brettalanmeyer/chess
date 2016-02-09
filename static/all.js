$(function(){

	var player = "white";

	var player1 = "white";
	var player2 = "black";
	if($(".board").hasClass("black")){
		var player = "black";
		player1 = "black";
		player2 = "white";
	}

	var board;

	var Board = function(){

		var width = 8;
		var height = 8;

		this.squares = [];
		this.pieces = [];
		this.socket;

		// white always move first
		this.turn = "white";

		this.init = function(){
			// define position for squares and pieces in array for w x h board
			for(var x = 0; x < width; x++){
				this.squares[x] = [];
				this.pieces[x] = [];
				for(var y = 0; y < height; y++){
					this.pieces[x][y] = null;
					this.squares[x][y] = null;
				}
			}

			// add square html elements to board
			for(var y = height - 1; y >= 0; y--){
				for(var x = 0; x < width; x++){
					var square = new Square(x, y);
					this.squares[square.x][square.y] = square;
					$(".board").append(square.getElement());
				}
			}

			return this;
		}

		// add pieces to board
		this.add = function(piece){
			this.pieces[piece.x][piece.y] = piece;
			this.getSquare(piece.x, piece.y).getElement().append(piece.getElement());
		};

		this.getSquare = function(x, y){
			return this.squares[x][y];
		};

		this.getPiece = function(x, y){
			return this.pieces[x][y];
		};

		// detemine if square is within the bounds of the w x h board
		this.isSquareInBounds = function(x, y){
			if(x < 0) return false;
			if(x > width - 1) return false;
			if(y < 0) return false;
			if(y > height - 1) return false;
			return true;
		};

		// highlight specific square
		this.highlight = function(x, y){
			this.getSquare(x, y).highlight();
		};

		// unhighlight all squares
		this.unhighlight = function(){
			for(var x = 0; x < this.pieces.length; x++){
				for(var y = 0; y < this.pieces[x].length; y++){
					this.squares[x][y].unhighlight();
				}
			}
		};

		// unselect all squares
		this.unselect = function(){
			for(var x = 0; x < this.pieces.length; x++){
				for(var y = 0; y < this.pieces[x].length; y++){
					var piece = this.pieces[x][y];
					if(piece != null){
						piece.unselect();
					}
				}
			}
		};

		// return piece that has selected value set
		this.getSelectedPiece = function(){
			for(var x = 0; x < this.pieces.length; x++){
				for(var y = 0; y < this.pieces[x].length; y++){
					var piece = this.pieces[x][y];
					if(piece != null && piece.selected){
						return piece;
					}
				}
			}
		};

		// move object and html from source to destination
		this.moveSelectedPieceTo = function(x, y){
			var square = this.getSquare(x, y);
			var enemy = this.getPiece(x, y);
			var piece = board.getSelectedPiece();

			var x0 = piece.x;
			var y0 = piece.y;

			if(enemy != null){
				var jailSquare = $(".jail." + enemy.color + " .square").not(".taken").first();

				enemy.getElement().detach();
				jailSquare.addClass("taken").html(enemy.getElement());

				this.pieces[enemy.x][enemy.y] = null;
				enemy.x = null;
				enemy.y = null;
			}

			piece.getElement().detach();
			square.getElement().append(piece.getElement());

			this.pieces[piece.x][piece.y] = null;
			piece.x = x;
			piece.y = y;
			this.pieces[x][y] = piece;

			if(piece.kind == "pawn"){
				piece.moved = true;
			}

			board.unselect();
			board.unhighlight();

			sendMove(x0, y0, x, y);

			this.turn = this.turn == "white" ? "black" : "white";
			$(".turn .value").html(this.turn);
		};

	};

	var Square = function(x, y){
		this.x = x;
		this.y = y;
		this.highlighted = false;

		var cls = "highlight";

		var square = $("<div />").addClass("square").attr("data-x", this.x).attr("data-y", this.y);
		var coord = $("<span />").addClass("coords").html(this.x + "," + this.y);
		square.html(coord);

		var that = this;
		square.on("click", function(){
			var source = $(this);
			if(!source.hasClass(cls)){
				return;
			}
			board.moveSelectedPieceTo(source.data("x"), source.data("y"));
		});

		// return jquery object
		this.getElement = function(){
			return square;
		};

		// add css class for highlighting
		this.highlight = function(){
			this.highlighted = true;
			square.addClass(cls);
		};

		// remove css class for highlighting
		this.unhighlight = function(){
			this.highlighted = false;
			square.removeClass(cls);
		};
	};

	var Piece = function(x, y, color){
		this.x = x;
		this.y = y;
		this.color = color;
		this.selected = false;

		this.select = function(){
			this.selected = true;
		};

		this.unselect = function(){
			this.selected = false;
		};

		this.getElement = function(){
			return piece;
		};

		this.isFriend = function(piece){
			return this.color == piece.color;
		}

		this.isEnemy = function(piece){
			return this.color != piece.color;
		}

		var piece = $("<div />").addClass("piece").addClass(this.color).addClass(this.kind);
		var that = this;
		piece.on("click", function(){
			if(that.color != board.turn){
				return;
			}

			if(that.selected){
				that.selected = false;
				board.unselect();
				board.unhighlight();
				return;
			}

			board.unselect();
			board.unhighlight();
			that.selected = true;

			var moves = that.getValidMoves();
			for(var i in moves){
				var move = moves[i];
				board.highlight(move.x, move.y);
			}
		});
	};

	var Pawn = function(x, y, color){
		this.kind = "pawn";
		this.moved = false;

		this.getValidMoves = function(){
			var moves = [];
			var that = this;

			var yDir = +1;
			if(this.color == player2){
				yDir = -1;
			}

			var x = this.x;
			var y1 = this.y + yDir;
			var piece1 = board.getPiece(x, y1);

			if(board.isSquareInBounds(x, y1) && piece1 == null){
				moves.push({ x: x, y: y1 });
			}

			if(!this.moved){
				var y2 = this.y + (yDir * 2);
				var piece2 = board.getPiece(x, y2);
				if(board.isSquareInBounds(x, y2) && piece2 == null){
					moves.push({ x: x, y: y2 });
				}
			}

			checkKill(x - 1, this.y + yDir);
			checkKill(x + 1, this.y + yDir);

			function checkKill(x, y){
				if(!board.isSquareInBounds(x, y)) return;

				var piece = board.getPiece(x, y);
				if(piece != null && piece.isEnemy(that)){
					moves.push({ x: x, y: y });
				}
			}

			return moves;
		};

		Piece.call(this, x, y, color);
	};

	var Rook = function(x, y, color){
		this.kind = "rook";

		this.getValidMoves = function(){
			var moves = [];
			var that = this;
			var moveCheckers = [];

			for(var i = 0; i < 4; i++){
				moveCheckers.push(new MoveChecker());
			}

			for(var i = 1; i <= 7; i++){
				moveCheckers[0].check(this, this.x, this.y + i);	// north
				moveCheckers[1].check(this, this.x + i, this.y);	// east
				moveCheckers[2].check(this, this.x, this.y - i);	// south
				moveCheckers[3].check(this, this.x - i, this.y);	// west
			}

			for(var i in moveCheckers){
				moves = moves.concat(moveCheckers[i].getMoves());
			}

			return moves;
		};

		Piece.call(this, x, y, color);
	};

	var Knight = function(x, y, color){
		this.kind = "knight";

		this.getValidMoves = function(){
			var moves = [];

			var coords = [
				{ x: -1, y: +2 },
				{ x: +1, y: +2 },
				{ x: -1, y: -2 },
				{ x: +1, y: -2 },
				{ x: -2, y: +1 },
				{ x: -2, y: -1 },
				{ x: +2, y: +1 },
				{ x: +2, y: -1 },
			];

			for(var i in coords){
				var coord = coords[i];
				var x = this.x + coord.x;
				var y = this.y + coord.y;

				if(board.isSquareInBounds(x, y)){
					var piece = board.getPiece(x, y);
					if(piece == null || piece.isEnemy(this)){
						moves.push({ x: x, y: y });
					}
				}
			}

			return moves;
		};

		Piece.call(this, x, y, color);
	};

	var Bishop = function(x, y, color){
		this.kind = "bishop";

		this.getValidMoves = function(){
			var moves = [];
			var that = this;
			var moveCheckers = [];

			for(var i = 0; i < 4; i++){
				moveCheckers.push(new MoveChecker());
			}

			for(var i = 1; i <= 7; i++){
				moveCheckers[0].check(this, this.x + i, this.y + i); // north east
				moveCheckers[1].check(this, this.x + i, this.y - i); // south east
				moveCheckers[2].check(this, this.x - i, this.y + i); // north west
				moveCheckers[3].check(this, this.x - i, this.y - i); // south west
			}

			for(var i in moveCheckers){
				moves = moves.concat(moveCheckers[i].getMoves());
			}

			return moves;
		};

		Piece.call(this, x, y, color);
	};

	var Queen = function(x, y, color){
		this.kind = "queen";

		this.getValidMoves = function(){
			var moves = [];
			var that = this;
			var moveCheckers = [];

			for(var i = 0; i < 8; i++){
				moveCheckers.push(new MoveChecker());
			}

			for(var i = 1; i <= 7; i++){
				moveCheckers[0].check(this, this.x, this.y + i);		// north
				moveCheckers[1].check(this, this.x + i, this.y + i);	// north east
				moveCheckers[2].check(this, this.x + i, this.y);		// east
				moveCheckers[3].check(this, this.x + i, this.y - i);	// south east
				moveCheckers[4].check(this, this.x, this.y - i);		// south
				moveCheckers[5].check(this, this.x - i, this.y - i);	// south west
				moveCheckers[6].check(this, this.x - i, this.y);		// west
				moveCheckers[7].check(this, this.x - i, this.y + i);	// north west
			}

			for(var i in moveCheckers){
				moves = moves.concat(moveCheckers[i].getMoves());
			}

			return moves;
		};

		Piece.call(this, x, y, color);
	};

	var King = function(x, y, color){
		this.kind = "king";

		this.getValidMoves = function(){
			var moves = [];

			var coords = [
				{ x: +0, y: +1 },
				{ x: +0, y: -1 },
				{ x: +1, y: +1 },
				{ x: +1, y: +0 },
				{ x: +1, y: -1 },
				{ x: -1, y: +1 },
				{ x: -1, y: +0 },
				{ x: -1, y: -1 }
			];

			for(var i in coords){
				var coord = coords[i];
				var x = this.x + coord.x;
				var y = this.y + coord.y;

				if(board.isSquareInBounds(x, y)){
					var piece = board.getPiece(x, y);
					if(piece == null || piece.isEnemy(this)){
						moves.push({ x: x, y: y });
					}
				}
			}

			return moves;
		};

		Piece.call(this, x, y, color);
	};

	var MoveChecker = function(){
		this.cont = true;
		this.moves = [];

		this.check = function(piece, x, y){
			if(!this.cont) return;
			if(!board.isSquareInBounds(x, y)){
				this.cont = false;
				return;
			}

			var boardPiece = board.getPiece(x, y);
			if(boardPiece == null || boardPiece.isEnemy(piece)) this.moves.push({ x: x, y: y });
			if(boardPiece != null) this.cont = false;
		};

		this.getMoves = function(){
			return this.moves;
		};
	};



	board = new Board().init();

	for(var i = 0; i < 8; i++){
		board.add(new Pawn(i, 1, player1));
		board.add(new Pawn(i, 6, player2));
	}

	board.add(new Rook(0, 0, player1));
	board.add(new Rook(7, 0, player1));
	board.add(new Rook(0, 7, player2));
	board.add(new Rook(7, 7, player2));

	board.add(new Knight(1, 0, player1));
	board.add(new Knight(6, 0, player1));
	board.add(new Knight(1, 7, player2));
	board.add(new Knight(6, 7, player2));

	board.add(new Bishop(2, 0, player1));
	board.add(new Bishop(5, 0, player1));
	board.add(new Bishop(2, 7, player2));
	board.add(new Bishop(5, 7, player2));

	board.add(new Queen(3, 0, player1));
	board.add(new Queen(4, 7, player2));

	board.add(new King(4, 0, player1));
	board.add(new King(3, 7, player2));



	var socket = io.connect("http://" + document.domain + ':' + location.port + "/move");
	var send = true;

	socket.on("receive-move", function(data){

		if(data.player != player){

			send = false;

			$(".square[data-x=" + data.x0 + "][data-y=" + data.y0 + "]").find(".piece").click();
			$(".square[data-x=" + data.x1 + "][data-y=" + data.y1 + "]").click();

			board.turn = data.player == "white" ? "black" : "white";

			send = true;

		}

	});

	function sendMove(x0, y0, x1, y1){
		if(!send) return;

		socket.emit("send-move", {
			"x0": x0,
			"y0": y0,
			"x1": x1,
			"y1": y1,
			"player": board.turn
		});

	}

});
