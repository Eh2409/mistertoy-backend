import express from 'express'

const app = express()

app.use(express.static('public'))
app.use(express.json())





const port = 3030
app.listen(port, () => console.log(`Server ready at port http://127.0.01:${port}`))