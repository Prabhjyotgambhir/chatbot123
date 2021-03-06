const express = require('express');
const bodyParser = require('body-parser');
const API_KEY = require('./api');
const http = require('http');
const server = express();
const morgan = require('morgan');
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(morgan('dev'));

server.use(bodyParser.json());
server.use(bodyParser.json());

server.post('/movies', (req, res) => {

    const movieToSearch = req.body.result && req.body.result.parameters && req.body.result.parameters.movie ? req.body.result.parameters.movie : 'The Godfather';
    const reqUrl = encodeURI(`http://www.omdbapi.com/?t=${movieToSearch}&apikey=${API_KEY}`);
    http.get(reqUrl, (responseFromAPI) => {
        let completeResponse = '';
        responseFromAPI.on('data', (chunk) => {
            completeResponse += chunk;
        });
        responseFromAPI.on('end', () => {
            const movie = JSON.parse(completeResponse);
            let dataToSend = movieToSearch === 'The Godfather' ? `I don't have the required info on that. Here's some info on 'The Godfather' instead.\n` : '';
            dataToSend += `${movie.Title} is a ${movie.Actors} starer ${movie.Genre} movie, released in ${movie.Year}. It was directed by ${movie.Director}`;
            return res.status(200).json({
                fulfillmentMessages: [
                    {
                      "text": {
                        "text": [
                          dataToSend
                        ]
                      }
                    }
                  ],
                displayText: dataToSend,
                source: 'movies'
            })
        });
    }, (error) => {
        return res.json({
            speech: 'Something went wrong!',
            displayText: 'Something went wrong!',
            source: 'get-movie-details'
        });
    });
});

server.get('/', (req,res) => {
    res.send('Invalid endpoint');
});

server.listen(process.env.PORT || 2000, () => {
    console.log('Server running');
});