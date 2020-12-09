require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose")
const bodyParser = require("body-parser")
// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(`mongodb+srv://${process.env.db_user}:${process.env.db_password}@freecodecamp.hjizl.mongodb.net/${process.env.db_name}?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const ShortUrlSchema = mongoose.Schema({
  original_url: String,
  short_url: Number
})

const ShortUrlModel = mongoose.model('short_url', ShortUrlSchema)

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:short_url', async(req, res) => {
  const dbQuery = await ShortUrlModel.findOne({ short_url: req.params.short_url })
  if (dbQuery == null) {
    res.json({ error: 'invalid url' })

  }
  else {
    res.redirect(dbQuery.original_url)
  }
})

app.post('/api/shorturl/new', async(req, res) => {
  let urlRegex = new RegExp(/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/gi);

  if (!req.body.url.match(urlRegex)) {
    res.json({ error: 'Invalid URL' })
    return
  }


  const bdQuery = await ShortUrlModel.findOne({ original_url: req.body.url })

  if (bdQuery == null) {
    const bdQueryAll = await ShortUrlModel.find({}, { original_url: false }).sort({ short_url: -1 })

    ShortUrlModel.create({
        original_url: req.body.url,
        short_url: bdQueryAll.length != 0 ? bdQueryAll[0].short_url + 1 : 0
      },
      (error, newShortUrl) => {
        const response = {
          original_url: newShortUrl.original_url,
          short_url: newShortUrl.short_url
        }

        res.json(response)
      })
  }
  else if (bdQuery != null) {
    const response = {
      original_url: bdQuery.original_url,
      short_url: bdQuery.short_url
    }

    res.json(response)
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
