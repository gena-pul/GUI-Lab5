    /*
     * APIs — both free, no authentication, CORS-safe for browser fetch()
     * ─────────────────────────────────────────────────────────────────────
     * Quote : GET https://dummyjson.com/quotes/random
     *         Returns { id, quote, author }
     *
     * Image : https://picsum.photos/id/{n}/800/420
     *         No fetch() needed — the URL IS the image.
     *         We wrap the browser's img load event in a Promise so it can
     *         participate in Promise.all() alongside the quote fetch.
     *
     * CONCEPTS DEMONSTRATED
     * ─────────────────────
     *  1. fetchJSON()      — reusable helper: fetch + response.ok check
     *  2. loadImage()      — wraps an img load event in a Promise
     *  3. Promise.all()    — quote fetch and image load run in parallel
     *  4. Shape validation — check data before trusting it
     *  5. .catch()         — one handler covers both promises
     *  6. .finally()       — cleans up UI in all cases
     */

    var QUOTE_API  = 'https://dummyjson.com/quotes/random';
    var IMAGE_BASE = 'https://picsum.photos/id/';

    // ── DOM refs ───────────────────────────────────────────
    var btn         = document.getElementById('btn');
    var spinner     = document.getElementById('spinner');
    var statusEl    = document.getElementById('status');
    var card        = document.getElementById('card');
    var photo       = document.getElementById('photo');
    var quoteText   = document.getElementById('quote-text');
    var quoteAuthor = document.getElementById('quote-author');

    // Show card immediately — placeholder content is already in the HTML
    card.style.display = 'block';
    card.classList.add('ready');

    function fetchJSON(url) {
      return fetch(url)
        .then(function (response) {
          if (!response.ok) {
            throw new Error('HTTP ' + response.status + ' from ' + url);
          }
          return response.json();
        });
    }

    function loadImage(url) {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.addEventListener('load',  function () { resolve(url); });
        img.addEventListener('error', function () { reject(new Error('Image failed to load')); });
        img.src = url;
      });
    }

    function randomImageUrl() {
      var id = Math.floor(Math.random() * 100) + 1;
      return IMAGE_BASE + id + '/800/420';
    }

    btn.addEventListener('click', function () {

      statusEl.textContent = '';
      card.classList.remove('ready');
      photo.classList.remove('loaded');
      btn.disabled = true;
      spinner.classList.add('active');

      var imageUrl = randomImageUrl();

      Promise.all([
        fetchJSON(QUOTE_API),
        loadImage(imageUrl)
      ])
        .then(function (results) {

          var quoteData      = results[0];
          var resolvedImgUrl = results[1];

          if (!quoteData.quote || !quoteData.author) {
            throw new Error('Unexpected quote shape — missing "quote" or "author".');
          }

          quoteText.textContent   = quoteData.quote;
          quoteAuthor.textContent = '— ' + quoteData.author;

          photo.src = resolvedImgUrl;
          photo.classList.add('loaded');

          card.classList.add('ready');
        })

        .catch(function (err) {
          statusEl.textContent = 'Error: ' + err.message;
        })

        .finally(function () {
          btn.disabled = false;
          spinner.classList.remove('active');
        });
    });