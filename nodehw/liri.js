
var Twitter = require("twitter");

var twitterKeysFile = require("./keys.js");

var spotify = require("spotify");

var request = require("request");

var fs = require("fs");

// Output file for logs.
var filename = './log.txt';

var log = require('simple-node-logger').createSimpleFileLogger( filename );

// All log information printed to log.txt.
log.setLevel('all');

var action = process.argv[2];

var argument = "";

doSomething(action, argument);

function doSomething(action, argument) {

	argument = getThirdArgument();

	switch (action) {
		
		// Gets list of tweets.
		case "my-tweets": 
		getMyTweets();
		break;

		// Gets song information.
		case "spotify-this-song":
		
		var songTitle = argument;
	
		if (songTitle === "") {
			lookupSpecificSong();
		} else {

			getSongInfo(songTitle);
		}
		break;

		// Gets movie information.
		case "movie-this":

		var movieTitle = argument;

		if (movieTitle === "") {
			getMovieInfo("Mr. Nobody");

		} else {
			getMovieInfo(movieTitle);
		}
		break;

		case "do-what-it-says": 
		doWhatItSays();
		break;
	}
}


function getThirdArgument() {


	argumentArray = process.argv;

	for (var i = 3; i < argumentArray.length; i++) {
		argument += argumentArray[i];
	}
	return argument;
}

// Function to show my last 20 tweets.
function getMyTweets() {
	
	var client = new Twitter(twitterKeysFile.twitterKeys);

	var params = {q: '@danielleshirel3', count: 20};

	client.get('search/tweets', params, function(error, tweets, response) {
	  if (!error) {

	  	for (var i = 0; i < tweets.statuses.length; i++) {
	  		var tweetText = tweets.statuses[i].text;
	  		logOutput("Tweet Text: " + tweetText);
	  		var tweetCreationDate = tweets.statuses[i].created_at;
	  		logOutput("Tweet Creation Date: " + tweetCreationDate);
	  	}
	  } else {
	  	logOutput(error);
	  }
	});
}

// Calls Spotify API to retrieve song information for song title.
function getSongInfo(songTitle) {

	spotify.search({type: 'track', query: songTitle}, function(err, data) {
		if (err) {
			logOutput.error(err);
			return
		}

		var artistsArray = data.tracks.items[0].album.artists;
		var artistsNames = [];

		for (var i = 0; i < artistsArray.length; i++) {
			artistsNames.push(artistsArray[i].name);
		}

		var artists = artistsNames.join(", ");

		logOutput("Artist(s): " + artists);
		logOutput("Song: " + data.tracks.items[0].name)
		logOutput("Spotify Preview URL: " + data.tracks.items[0].preview_url)
		logOutput("Album Name: " + data.tracks.items[0].album.name);
	});
	
}

// When no song title provided, defaults to specific song, The Sign.
function lookupSpecificSong() {

	// Calls Spotify API to retrieve a specific track, The Sign, Ace of Base.
	spotify.lookup({type: 'track', id: '3DYVWvPh3kGwPasp7yjahc'}, function(err, data) {
		if (err) {
			logOutput.error(err);
			return
		}
		logOutput("Artist: " + data.artists[0].name);
		logOutput("Song: " + data.name);
		logOutput("Spotify Preview URL: " + data.preview_url);
		logOutput("Album Name: " + data.album.name);
	});
}


function getMovieInfo(movieTitle) {

	var queryUrl = "http://www.omdbapi.com/?t=" + movieTitle + "&y=&plot=short&tomatoes=true&r=json";

	request(queryUrl, function(error, response, body) {

	  if (!error && response.statusCode === 200) {
	    
	    var movie = JSON.parse(body);


	    logOutput("Movie Title: " + movie.Title);
	    logOutput("Release Year: " + movie.Year);
	    logOutput("IMDB Rating: " + movie.imdbRating);
	    logOutput("Country Produced In: " + movie.Country);
	    logOutput("Language: " + movie.Language);
	    logOutput("Plot: " + movie.Plot);
	    logOutput("Actors: " + movie.Actors);


	    logOutput("Rotten Tomatoes Rating: " + movie.Ratings[2].Value);
	    logOutput("Rotten Tomatoes URL: " + movie.tomatoURL);
	  }
	});
}


function doWhatItSays() {

	fs.readFile("random.txt", "utf8", function(err, data) {
		if (err) {
			logOutput.error(err);
		} else {

			var randomArray = data.split(",");
			action = randomArray[0];
			argument = randomArray[1];

			doSomething(action, argument);
		}
	});
}

function logOutput(logText) {
	log.info(logText);
	console.log(logText);
}