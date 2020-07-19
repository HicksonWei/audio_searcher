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
	console.log('url', url)
	console.log('target', target)
	const data = await fetchBody(url)
	const dom = new JSDOM(data)
	const nodeList = dom.window.document.querySelectorAll(target)
	console.log('nodeList', nodeList)
	// return [...nodeList]
	return Promise.resolve([...nodeList])
}

const wordTest = word => {
	return /^[A-Za-z\-]+$/.test(word)
}

app.get('/', (req, res) => {
	res.send('Welcome to a basic express App')
})

app.get('/:word', async (req, res) => {
	try {
		const word = req.params.word
		const site = req.query.q
		let audioArr = []
		if (!wordTest(word)) return
		if (site === 'oxford') {
			audioArr = await getAudioArray(
				`https://www.lexico.com/definition/${word}`,
				'.headwordAudio'
			)
			console.log('audioArr', audioArr)
			if (audioArr.length <= 0) {
				return res.json({
					status: 'fail',
					message: 'No result!'
				})
			}

			const arr = audioArr.map(item => item.firstChild.src)
			console.log('arr', arr)
			res.json({
				status: 'success',
				message: '',
				audioArray: arr,
				from: 'Oxford'
			})
		} else {
			audioArr = await getAudioArray(
				`https://dictionary.cambridge.org/us/dictionary/english-chinese-traditional/${word}`,
				'[id^=ampaudio]'
			)
			console.log('audioArr1', audioArr)
			if (audioArr.length <= 0) {
				audioArr = await getAudioArray(
					`https://dictionary.cambridge.org/us/dictionary/english/${word}`,
					'[id^=ampaudio]'
				)
				console.log('audioArr2', audioArr)
				if (audioArr.length <= 0) {
					return res.json({
						status: 'fail',
						message: 'No result!'
					})
				}
			}

			let arr = []
			audioArr.forEach(item => {
				let target = [...item.getElementsByTagName('source')].filter(
					source => source.type === 'audio/mpeg'
				)[0].src
				arr.push(target)
			})
			console.log('arr', arr)
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
