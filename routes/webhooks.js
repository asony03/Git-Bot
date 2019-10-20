const request = require('superagent');

function getDefaultOptions(method)
{
	var options = {
		url: 'https://api.github.com/repos/MJSiddu/Algorithms/hooks',
		method: method,
		headers: {
			"User-Agent": "GitBot",
			"content-type": "application/json",
			"Authorization": `token 393d06e72272835a5ead3ad1f0ddd79e57952a70`
		}
	};
	return options;
}

async function listHooks()
{
	let options = getDefaultOptions("GET");

	// Send a http request to url and specify a callback that will be called upon its return.
	return new Promise(function(resolve, reject)
	{
		request(options, function (error, response, body) {

			if( error )
			{
				console.log( error );
				reject(error);
				return; // Terminate execution.
			}

			var obj = JSON.parse(body);
			console.log(body);
			// Return object for people calling our method.
			resolve( obj );

		});
	});
}

module.exports = (app) => {

  app.get('/webhooks', (req, res, next) => {

    const access_token = '393d06e72272835a5ead3ad1f0ddd79e57952a70';

    request
    .post('https://api.github.com/repos/MJSiddu/HousingPlatform/hooks')
    .send({
      "name": "web",
      "active": true,
      "events": [
        "issues",
        "pull_request",
        "issue_comment",
        "pull_request_review",
        "pull_request_review_comment"
      ],
      "config": {
        "url": "http://localhost:8090/gateway",
        "content_type": "json",
        "insecure_ssl": "0"
      }
    })
    .set('Authorization', 'token ' + access_token)
    .set('Cache-Control', 'no-cache')
    .set('Accept', 'application/json')
    .set('User-Agent', 'GitBot')
    .set('content-type', 'application/json')
    .then(result => {
      console.log(result.body);
    })
    .catch(err => {
      console.log("---error occured---");
      console.log(err.message);
      console.log(err);
    });
       
  });

  app.get('/web', async (req, res, next) => {

    const access_token = '393d06e72272835a5ead3ad1f0ddd79e57952a70';

    await listHooks();

    // request
    // .get('https://api.github.com/repos/MJSiddu/Algorithms/hooks')
    // .set('Authorization', 'token ' + access_token)
    // .set('Cache-Control', 'no-cache')
    // .set('Accept', 'application/json')
    // .set('User-Agent', 'GitBot')
    // .set('content-type', 'application/json')
    // .then(result => {
    //   console.log(result.body);
    // })
    // .catch(err => {
    //   console.log("---error occured---");
    //   console.log(err.message);
    //   //console.log(err);
    // });
       
  });

};
