const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const app = express();

const port = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: false }));
app.use(cors());

function fetchBody(url) {
	return fetch(url).then(res => res.text());
}

app.get('/', (req, res) => {
	res.send('Welcome to a basic express App');
});

app.get('/:word', async (req, res) => {
	try {
		const word = req.params.word;
		const site = req.query.q;
		console.log(site);
		if (site === 'oxford') {
			const data = await fetchBody(`https://www.lexico.com/definition/${word}`);

			const dom = new JSDOM(data);

			const audio = dom.window.document.querySelectorAll('.headwordAudio');
			if ([...audio].length <= 0) {
				res.json({
					status: 'fail',
					message: 'No result!'
				});
				return;
			}

			const arr = [...audio].map(item => item.firstChild.src);
			console.log(arr);
			res.json({
				status: 'success',
				message: '',
				audioArray: arr,
				from: 'Oxford'
			});
		} else {
			const data = await fetchBody(
				`https://dictionary.cambridge.org/us/dictionary/english-chinese-traditional/${word}`
			);
			const dom = new JSDOM(data);

			const audio = dom.window.document.querySelectorAll('[id^=ampaudio]');
			if ([...audio].length <= 0) {
				res.json({
					status: 'fail',
					message: 'No result!'
				});
				return;
			}

			let arr = [];
			audio.forEach(item => {
				let target = [...item.getElementsByTagName('source')].filter(
					source => source.type === 'audio/mpeg'
				)[0].src;
				arr.push(target);
			});
			console.log(arr);
			res.json({
				status: 'success',
				message: '',
				audioArray: arr,
				from: 'Cambridge'
			});
		}
		/*
      [
        "/us/media/english-chinese-traditional/uk_pron/u/uka/ukalb/ukalbin030.mp3",
        "/us/media/english-chinese-traditional/us_pron/a/ali/align/align.mp3"
      ]
    */
		// baseUrl => https://dictionary.cambridge.org
	} catch (error) {
		res.status(500).send(error);
	}
});

app.listen(port, () => console.log(`Listening on ${port}`));
