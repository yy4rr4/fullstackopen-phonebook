require("dotenv").config()
const express = require("express")
const Person = require("./models/person")
const morgan = require("morgan")

const app = express()

app.use(express.static("dist"))
app.use(express.json())

morgan.token("body", (request) => JSON.stringify(request.body))

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
)

app.get("/api/persons", (request, response, next) => {
  Person.find({})
    .then((people) => {
      if (people) {
        response.json(people)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.get("/info", (request, response, next) => {
  Person.countDocuments({})
    .then((count) => {
      response.send(`
      <div>
      <p>Phonebook has info for ${count} people</p>
      <p>${new Date()}</p>
      </div>
    `)
    })
    .catch((error) => next(error))
})

app.post("/api/persons", (request, response, next) => {
  const body = request.body

  if (!(body.name && body.number)) {
    return response.status(400).json({
      error: "content is missing",
    })
  }

  Person.findOne({ name: body.name }).then((existingPerson) => {
    if (existingPerson) {
      return response.status(400).json({
        error: "name must be unique",
      })
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    })

    person
      .save()
      .then((savedPerson) => {
        response.json(savedPerson)
      })
      .catch((error) => next(error))
  })
})

app.put("/api/persons/:id", (request, response, next) => {
  const id = request.params.id
  const person = {
    name: request.body.name,
    number: request.body.number,
  }

  Person.findByIdAndUpdate(id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(() => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "uknkown endpoint" })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
