import QueryString from './querystring';
import store from './store.js';
import util from './util.js'

var twitter = {};
var cb = new Codebird;
twitter.cb = cb;

// Go to apps.twitter.com and get your keys there!
cb.setConsumerKey("YOUR_AUTH_TOKEN", "YOUR_AUTH_SECRET");

// localStorage.clear();

function saveTokens (oauth_token, oauth_token_secret) {
  localStorage.setItem('oauth_token', oauth_token);
  localStorage.setItem('oauth_token_secret', oauth_token_secret);
}

function authorize (oauth_token, oauth_verifier) {
  cb.setToken(localStorage.getItem('oauth_token'), localStorage.getItem('oauth_token_secret'));

  cb.__call(
      "oauth_accessToken",
      {
          oauth_verifier: oauth_verifier
      },
      function (reply, rate, err) {
          if (err) {
              console.log("error response or timeout exceeded" + err.error);
              store.loggedIn = false;
              showLoginScreen();
          }
          else if (reply) {
              cb.setToken(reply.oauth_token, reply.oauth_token_secret);
              saveTokens(reply.oauth_token, reply.oauth_token_secret);
              location.reload();
          }
      }
  );
}

function showLoginScreen () {
  if (document.readyState === "complete" || document.readyState === "loaded") {
    document.addEventListener("deviceready", function () {
      window.f7.loginScreen();
    });
  }
  else {
    document.addEventListener('DOMContentLoaded', () => {
      document.addEventListener("deviceready", function () {
        window.f7.loginScreen();
      });
    });
  }
}

if (!localStorage.getItem('oauth_token') || !localStorage.getItem('oauth_token_secret')){
  store.loggedIn = false;
  showLoginScreen();
}
else {
  cb.setToken(localStorage.getItem('oauth_token'), localStorage.getItem('oauth_token_secret'));
  cb.__call(
      "statuses_homeTimeline",
      {},
      function (reply, rate, err) {
          if (err && err.errors.length > 0 || reply && reply.errors && reply.errors.length > 0) {
            store.loggedIn = false;
            showLoginScreen();
          }
          else {
            console.log(reply);
            store.loggedIn = true;
            store.tweets.length = 0;
            store.tweets.push(...reply);
          }
      }
  );
}

twitter.login = function () {
  cb.__call(
      "oauth_requestToken",
      {oauth_callback: "about:blank?twitvue=true"},
      function (reply,rate,err) {
          if (err) {
              console.log("error response or timeout exceeded" + err.error);
          }
          if (reply) {
              // stores it
              cb.setToken(reply.oauth_token, reply.oauth_token_secret);
              saveTokens(reply.oauth_token, reply.oauth_token_secret);

              // gets the authorize screen URL
              cb.__call(
                  "oauth_authorize",
                  {},
                  function (auth_url) {
                      // window.codebird_auth = window.open(auth_url);
                      // location.href = auth_url;
                      var ref = cordova.InAppBrowser.open(auth_url, '_blank', 'location=yes');
                      ref.addEventListener('loadstart', (param) => {
                        if (param.url.indexOf('about:blank?twitvue=true') == 0) {
                          var pos = param.url.indexOf('?twitvue=true');
                          var searchString = param.url.substring(pos);
                          var qs = QueryString(searchString);
                          var oauth_token = qs.oauth_token;
                          var oauth_verifier = qs.oauth_verifier;
                          ref.close();
                          authorize(oauth_token, oauth_verifier);
                        }
                      });
                  }
              );
          }
      }
  );  
}

export default twitter;