// Initialize Firebase
var config = {
	apiKey: "AIzaSyCrGgLqGLTT15otc_73-8Sy8MpJrfT9gX0",
	authDomain: "rock-paper-scissors-d5d13.firebaseapp.com",
	databaseURL: "https://rock-paper-scissors-d5d13.firebaseio.com",
	projectId: "rock-paper-scissors-d5d13",
	storageBucket: "rock-paper-scissors-d5d13.appspot.com",
	messagingSenderId: "768101450073"
};
firebase.initializeApp(config);

var database = firebase.database();
var playerId = '';
var player1 = false;
var player2 = false;

var players = {
	one: {
		name: 'Player 1',
		wins: 0,
		losses: 0
	},
	two: {
		name: 'Player 2',
		wins: 0,
		losses: 0
	}
}

function initDataBase() {
	database.ref('/players').set({
		one: players.one,
		two: players.two
	});
	database.ref('/turn').set({
		player: '',
		move: ''
	});
}

function checkForPlayers() {
	database.ref().once('value')
		.then(function(snapshot) {
			if(snapshot.val().players.one.name !== 'Player 1') {
				let name = snapshot.val().players.one.name;
				$('#Player1 .player-name').html(name);
				player1 = true;
			}
			if(snapshot.val().players.two.name !== 'Player 2') {
				let name = snapshot.val().players.two.name;
				$('#Player2 .player-name').html(name);
				player2 = true;
			}

			if(!player1 || !player2) {
				$('#JoinGame').removeClass('invisible');
			}

		});
}

function addPlayer(addedPlayer) {
	let ref = database.ref();
	ref.once('value')
		.then(function(snapshot) {
			if(snapshot.val().players.one.name === 'Player 1') {
				database.ref('/players').update({
					one: {
						name: addedPlayer,
						losses: 0,
						wins: 0
					}
				});
				$('#Player1 .player-name').html(addedPlayer);
				playerId = 'one'
				player1 = true;
			}else if(snapshot.val().players.two.name === 'Player 2') {
				database.ref('/players').update({
					two: {
						name: addedPlayer,
						losses: 0,
						wins: 0
					}
				});
				$('#Player2 .player-name').html(addedPlayer);
				playerId = 'two';
				player2 = true;
			}

			if(player1 && player2) {
				turnSelect();
				database.ref('/turn').update({
					player: 'one'
				});
			}
		});
	$('#JoinGame').addClass('invisible');
}

function turnSelect() {
	database.ref().on('value', function(snapshot) {
		let player = snapshot.val().turn.player;
		if(player == 'one') {
			$('#Player2 .box').removeClass('green');
			$('#Player1 .box').addClass('green');
			registerMove('#Player1', player);
		}else if(turn == 'two') {
			$('#Player1 .box').removeClass('green');
			$('#Player2 box').addClass('green');
		}
	});
}

function registerMove(playerDiv, playerNumber) {
	if(playerId === playerNumber) {
		$(playerDiv + ' .move').on('click', function() {
			let move = $(this).html();
			database.ref('/turn').update({
				move: move
			});
		});
	}
}

$(document).ready(function() {
	checkForPlayers();
	$('#JoinGame .submit').on('click', function() {
		let playerName = $('#PlayerName').val();
		addPlayer(playerName);
	});
	//initDataBase();
});