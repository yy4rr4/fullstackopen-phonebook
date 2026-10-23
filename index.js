const express = require("express")
const morgan = require("morgan")

const app = express()

app.use(express.json())
app.use(express.static("dist"))

morgan.token("body", (request) => JSON.stringify(request.body))

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
)

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
]

const generateId = () => {
  const randomId = Math.floor(1000000 + Math.random() * 9000000)
  return randomId.toString()
}

app.post("/api/persons", (request, response) => {
  const body = request.body

  if (!(body.name && body.number)) {
    return response.status(400).json({
      error: "content is missing",
    })
  }

  if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({
      error: "name must be unique",
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)
  response.json(persons)
})

app.get("/api/persons", (request, response) => {
  response.json(persons)
})

app.get("/info", (request, response) => {
  const info = `
    <div>
      <p>Phonebook has info for ${persons.length} people</p>
      <p>${new Date()}</p>
    </div>
    `

  response.send(info)
})

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id
  persons = persons.filter((person) => person.id !== id)
  response.status(204).end()
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "uknkown endpoint" })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
