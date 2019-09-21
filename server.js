const express = require('express')
const app = express()
const port = 8080

app.use('/', express.static(__dirname))
app.use('/v-can', express.static(__dirname + '/node_modules/v-can/'))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
