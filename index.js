require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const urlParser = require('url');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Test endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Memory DB
let urls = [];

// POST para crear URL corta
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  const urlObject = urlParser.parse(originalUrl);

  if (!urlObject.protocol || !urlObject.hostname) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(urlObject.hostname, (err) => {
    if (err) return res.json({ error: "invalid url" });

    const shortUrl = urls.length + 1;

    urls.push({
      original_url: originalUrl,
      short_url: shortUrl
    });

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});

// GET para redirigir
app.get('/api/shorturl/:short_url', (req, res) => {
  const id = parseInt(req.params.short_url);
  const found = urls.find(u => u.short_url === id);

  if (!found) return res.json({ error: "No short URL found" });

  res.redirect(found.original_url);
});

// Start server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

