// ********************SET YOUR API KEY HERE**********************
// Insert your Rotten Tomatoes API Key here. README for more info.
var apiKey = 'PLACE-YOUR-API-KEY-HERE';
// ***************************************************************

// Check if valid API Key
function checkKeyValidity() {
	var url = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/opening.json?limit=1&apikey=' + apiKey;

	invalidKey = false;

	// Docs: http://app-framework-software.intel.com/api2/index.html#$_get
	keyTest = $.get(url, "GET", function(data) {});
	keyTest.onreadystatechange = function() {
		if (keyTest.readyState == 4) {
			if (keyTest.status == 403) {
				invalidKeyAlert();
				invalidKey = true;
			}
		}
	}
}

function invalidKeyAlert() {
	alert('Invalid API key. See README and edit js/api.js file.');
}

// Make Opening_Movies API call to RottenTomatoes
// Docs: http://developer.rottentomatoes.com/docs/read/json/v10/Opening_Movies
function fetchOpeningMovies() {
    if (invalidKey) {
        invalidKeyAlert();
        return false;
    }
        
	var search = $('#search').val();
	var url = 'http://api.rottentomatoes.com/api/public/v1.0/lists/movies/opening.json?apikey=' + apiKey;
	// Docs: http://app-framework-software.intel.com/api2/index.html#$_get
	var apiCall = $.get(url, function(data) {
		fetchOpeningMoviesCallback(data);
	});
}

function fetchOpeningMoviesCallback(payload) {
	var data = $.parseJSON(payload);
	if (!data.movies) {
		alert('No movies were found. Sorry!');
		return false;
	}
	var movies = data.movies;
	$("#rottentomatoes-results-output").show();
	$("#rottentomatoes-results-output").html('<p class="center"><strong>Top Movies</strong></p>');

	$.each(movies, function(index, movie) {
		var html = '<hr />';
		html += '<div id="box-' + index + '"class="box"><img src="' + movie.posters.thumbnail + '" />';
		if (movie.ratings.critics_score > 0) {
			if (movie.ratings.critics_rating === 'Rotten') {
				html += ' <img src="http://content.developer.mashery.com.s3.amazonaws.com/xdk-demos/rottentomatoes/rotten.png" />';
			} else {
				html += ' <img src="http://content.developer.mashery.com.s3.amazonaws.com/xdk-demos/rottentomatoes/fresh.png" />';
			}
			html += ' ' + movie.ratings.critics_score + '%';
		}
		html += '<p><a href="' + movie.links.alternate + '" target="_blank">' + movie.title + '</a></p></div>';
		$("#rottentomatoes-results-output").append(html);
	});
}

// Make Top DVD Rentals API call to RottenTomatoes
// Docs: http://developer.rottentomatoes.com/docs/read/json/v10/Top_Rentals
function fetchTopRentals() {
    if (invalidKey) {
        invalidKeyAlert();
        return false;
    }
	var search = $('#search').val();
	var url = 'http://api.rottentomatoes.com/api/public/v1.0/lists/dvds/new_releases.json?apikey=' + apiKey;
	var apiCall = $.get(url, function(data) {
		fetchTopRentalsCallback(data);
	});
}

function fetchTopRentalsCallback(payload) {
	var data = $.parseJSON(payload);
	if (!data.movies) {
		alert('No DVDs were found. Sorry!');
		return false;
	}
	var movies = data.movies;
	$("#rottentomatoes-results-output").show();
	$("#rottentomatoes-results-output").html('<p class="center"><strong>Top DVD Rentals</strong></p>');

	$.each(movies, function(index, movie) {
		var html = '<hr />';
		html += '<div id="box-' + index + '"class="box"><img src="' + movie.posters.thumbnail + '" />';
		if (movie.ratings.critics_score > 0) {
			if (movie.ratings.critics_rating === 'Rotten') {
				html += ' <img src="http://content.developer.mashery.com.s3.amazonaws.com/xdk-demos/rottentomatoes/rotten.png" />';
			} else {
				html += ' <img src="http://content.developer.mashery.com.s3.amazonaws.com/xdk-demos/rottentomatoes/fresh.png" />';
			}
			html += ' ' + movie.ratings.critics_score + '%';
		}
		html += '<p><a href="' + movie.links.alternate + '" target="_blank">' + movie.title + '</a></p></div>';
		$("#rottentomatoes-results-output").append(html);
	});
}
