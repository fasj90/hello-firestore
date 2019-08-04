const cheerio = require('cheerio');
const request = require('request-promise');
const admin = require("firebase-admin");
const serviceAccount = require("./config/serviceAccountKey.json");
const PAGE = 'http://ver-pelis-online.com';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://test-project-71f18.firebaseio.com"
});

const db = admin.firestore();

// async function getUsers(){
//     const users = await db.collection('users').get();
//     const a = users.docs.map(user => user.data());
//     console.log('users', a);
// };

// getUsers();

async function startScraping(){
    const html = await request(PAGE);
    const $ = cheerio.load(html);

    const movies = $('article.movie-item')
    .map((index, movie) =>{
        movie = $(movie);
        const url = movie.find('a').attr('href');
        const title = movie.find('a > h3').text();
        const quality = movie.find('ul > li:first-child').text();
        const year = movie.find('ul > li:last-child').text();
        const image = movie.find('a > img').attr('src');
        // console.log(index, movie);
        return {url, title, quality, year, image : `${PAGE}${image}`};
    })
    .get();
    console.log(`Guardando ${movies.length} peliculas...`);
    await Promise.all(movies.map(saveMovie));
    // movies.map(movie => saveMovie(movie));
    console.log('Se guardaron la peliculas!');
}

async function saveMovie(movie){
    await db.collection('movies').add(movie);
}

startScraping();