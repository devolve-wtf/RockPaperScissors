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
var playerOneMove = '';
var playerTwoMove = '';
var registeredName = 'spectator';

function initDataBase() {
	database.ref('/players').set({
		one: players.one,
		two: players.two
	});
	database.ref('/turn').set({
		player: 'one',
		playerOneMove: '',
		playerTwoMove: ''
	});
	database.ref('/chat').set({
		messages: ['hi']
	});
}

function checkForPlayers() {
	database.ref().on('value', function(snapshot){
			if(snapshot.val().players.one.name !== 'Player 1') {
				let name = snapshot.val().players.one.name;
				let wins = snapshot.val().players.one.wins;
				let losses = snapshot.val().players.one.losses;
				$('#Player1 .player-name').html(name);
				$('.player-one .name').html('&larr; ' + name);
				$('.player-one .wins .count').html(wins);
				$('.player-one .losses .count').html(losses);
				$('.player-one').removeClass('invisible');
				player1 = true;
			}

			if(snapshot.val().players.two.name !== 'Player 2') {
				let name = snapshot.val().players.two.name;
				let wins = snapshot.val().players.two.wins;
				let losses = snapshot.val().players.two.losses;
				$('#Player2 .player-name').html(name);
				$('.player-two .name').html(name + ' &rarr;');
				$('.player-two .wins .count').html(wins);
				$('.player-two .losses .count').html(losses);
				$('.player-two').removeClass('invisible');
				player2 = true;
			}

			if(player1 && player2) {
				$('#JoinGame').addClass('invisible');
			}
	});
}

function addPlayer(addedPlayer) {
	registeredName = addedPlayer;
	$('#ScreenName').html('@' + registeredName);
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
			disconnect();
		});
	$('#JoinGame').addClass('invisible');
}

function turnSelect() {
	database.ref().on('value', function(snapshot) {
		let player1 = snapshot.val().players.one.name;
		let player2 = snapshot.val().players.two.name;
		if(player1 !== 'Player 1' && player2 !== 'Player 2') {
			let player = snapshot.val().turn.player;
			if(player == 'one') {
				$('#Player2 .box').removeClass('green');
				$('#Player1 .box').addClass('green');
				registerMove('#Player1', player);
			}else if(player == 'two') {
				$('#Player1 .box').removeClass('green');
				$('#Player2 .box').addClass('green');
				registerMove('#Player2', player);
			}
		}
	});
}

function registerMove(playerDiv, playerNumber) {
	$('.move').removeClass('bg-primary');
	if(playerId === playerNumber) {
		$(playerDiv + ' .move').on('click', function() {
			let move = $(this).html();

			if(playerNumber === 'one') {
				database.ref('/turn').update({
					playerOneMove: move,
					player: 'two'
				});
			}else if(playerNumber === 'two') {
				database.ref('/turn').update({
					playerTwoMove: move,
					player: 'one'
				});
				eval();
			}
			$(this).addClass('bg-primary');
			$(this).off('click');
		});
	}
}

function eval() {
	database.ref().once('value')
		.then(function(snapshot) {
		let winner = 'none';
		playerOneMove = snapshot.val().turn.playerOneMove;
		playerTwoMove = snapshot.val().turn.playerTwoMove;

		if(playerOneMove !== '' && playerTwoMove !== '') {
			if(playerOneMove === 'ROCK' && playerTwoMove === 'SCISSORS') {
				winner = 'one';
			}else if(playerOneMove === 'PAPER' && playerTwoMove === 'ROCK') {
				winner = 'one';
			}else if(playerOneMove === 'SCISSORS' && playerTwoMove === 'PAPER') {
				winner = 'one';
			}else if(playerOneMove === playerTwoMove) {
				winner = 'none';
			}else{
				winner = 'two';
			}

			console.log(winner);

			if(winner === 'one') {
				database.ref('/players').update({
					one: {
						name: snapshot.val().players.one.name,
						wins: snapshot.val().players.one.wins + 1,
						losses: snapshot.val().players.one.losses
					},
					two: {
						name: snapshot.val().players.two.name,
						wins: snapshot.val().players.two.wins,
						losses: snapshot.val().players.two.losses + 1
					}
				});
			}else if(winner === 'two') {
				database.ref('players').update({
					two: {
						name: snapshot.val().players.two.name,
						wins: snapshot.val().players.two.wins + 1,
						losses: snapshot.val().players.two.losses
					},
					one: {
						name: snapshot.val().players.one.name,
						wins: snapshot.val().players.one.wins,
						losses: snapshot.val().players.one.losses + 1
					}
				});
			}

			database.ref('/turn').update({
				playerOneMove: '',
				playerTwoMove: ''
			});
		}
	});
}

function sendMessage() {
	$('#Chat .submit').on('click', function() {
		database.ref('/chat').push('@' + registeredName + ': ' + $('#ChatMessage').val());
		$('#ChatMessage').val('');
	});

	database.ref('/chat').on('child_added', function(snapshot) {
		let message = snapshot.val();
		$('.jumbotron').append('<p>' + message + '</p>');
	});
}

function disconnect() {

	if(playerId === 'one') {
		database.ref('/players').onDisconnect().update({
			one: {
				name: 'Player 1',
				wins: 0,
				losses: 0
			}
		});
	}else if(playerId === 'two') {
		database.ref('/players').onDisconnect().update({
			two: {
				name: 'Player 2',
				wins: 0,
				losses: 0
			}
		});
	}

	database.ref().on('value', function(snapshot) {
		let playerOneName = snapshot.val().players.one.name;
		let playerTwoName = snapshot.val().players.two.name;
		if(playerOneName === 'Player 1') {
			$('#Player1 .player-name').html('Waiting for new player');
			$('.player-one').addClass('invisible');
			$('.box').removeClass('green');
			database.ref('/chat').set('');
			if(player1) {
				alert('The player left the game');
				player1 = false;
			}

		}

		if(playerTwoName === 'Player 2') {
			$('#Player2 .player-name').html('Waiting for new player');
			$('.player-two').addClass('invisible');
			$('.box').removeClass('green');
			database.ref('/chat').set('');
			if(player2) {
				alert('The Player left the game');
				player2 = false;
			}
		}
	});
}

$(document).ready(function() {
	checkForPlayers();
	turnSelect();
	$('#JoinGame .submit').on('click', function() {
		let playerName = $('#PlayerName').val();
		addPlayer(playerName);
	});
	//initDataBase();
	sendMessage();
	disconnect();
});