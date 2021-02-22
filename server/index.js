const path = require('path');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');

const organizeData = require('./utils');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(express.static(path.resolve('client', 'dist')));

const getRelatedReview = async (relatedGames) => {
  const result = [];
  for (let i = 0; i < relatedGames.length; i++) {
    const currentGame = relatedGames[i];
    const gameId = currentGame.game_id;
    const { data } = await axios.get(`http://localhost:3001/reviews?id=${gameId}`);
    result.push(data);
  }
  return result;
};

const getRelatedMetaData = async (relatedGames) => {
  const result = [];
  for (let i = 0; i < relatedGames.length; i++) {
    const currentGame = relatedGames[i];
    const gameId = currentGame.game_id;
    const { data } = await axios.get(`http://localhost:3005/metadata?id=${gameId}`);
    result.push(data);
  }
  return result;
};

app.get('/morelikethis', async (req, res) => {
  console.log(req.query.id);
  // call to game info
  // 7 calls to meta for title/release based on game_id
  // 7 calls to reviews_counts for overall reviews based on game_id
  try {
    const { data: { relatedGames } } = await
    axios.get(`http://localhost:3008/game_info/related?id=${req.query.id}`);
    const overallReviews = await getRelatedReview(relatedGames);
    const relatedMetaData = await getRelatedMetaData(relatedGames);
    const conjoinedData = organizeData(relatedGames, overallReviews, relatedMetaData);
    res.json({ data: conjoinedData });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`service running on port ${PORT}`);
});