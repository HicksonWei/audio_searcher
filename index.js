const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')
const { JSDOM } = require('jsdom')
const app = express()

const port = process.env.PORT || 5000

app.use(express.urlencoded({ extended: false }))
app.use(cors())

const fetchBody = url => {
	return fetch(url).then(res => res.text())
}

const getAudioArray = async (url, target) => {
	const data = await fetchBody(url)
	const dom = new JSDOM(data)
	const nodeList = dom.window.document.querySelectorAll(target)
	return [...nodeList]
}

app.get('/', (req, res) => {
	res.send('Welcome to a basic express App')
})

app.get('/:word', async (req, res) => {
	try {
		const word = req.params.word
		const site = req.query.q
		let audioArr = []
		if (site === 'oxford') {
			audioArr = getAudioArray(
				`https://www.lexico.com/definition/${word}`,
				'.headwordAudio'
			)
			if (audioArr.length <= 0) {
				return res.json({
					status: 'fail',
					message: 'No result!'
				})
			}

			const arr = audioArr.map(item => item.firstChild.src)
			console.log(arr)
			res.json({
				status: 'success',
				message: '',
				audioArray: arr,
				from: 'Oxford'
			})
		} else {
			audioArr = getAudioArray(
				`https://dictionary.cambridge.org/us/dictionary/english-chinese-traditional/${word}`,
				'[id^=ampaudio]'
			)
			if (audioArr.length <= 0) {
				audioArr = getAudioArray(
					`https://dictionary.cambridge.org/us/dictionary/english/${word}`,
					'[id^=ampaudio]'
				)
				if (audioArr.length <= 0) {
					return res.json({
						status: 'fail',
						message: 'No result!'
					})
				}
			}

			let arr = []
			audio.forEach(item => {
				let target = [...item.getElementsByTagName('source')].filter(
					source => source.type === 'audio/mpeg'
				)[0].src
				arr.push(target)
			})
			console.log(arr)
			res.json({
				status: 'success',
				message: '',
				audioArray: arr,
				from: 'Cambridge'
			})
		}
		/*
      [
        "/us/media/english-chinese-traditional/uk_pron/u/uka/ukalb/ukalbin030.mp3",
        "/us/media/english-chinese-traditional/us_pron/a/ali/align/align.mp3"
      ]
    */
		// baseUrl => https://dictionary.cambridge.org
	} catch (error) {
		res.status(500).send(error)
	}
})

app.listen(port, () => console.log(`Listening on ${port}`))
