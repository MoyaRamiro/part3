require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const app = express();

const cors = require("cors");

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const Person = require("../../models/person.js");

app.use(express.json()); ///metodo exclusivo de express para convertir dato json a objeto javascript
app.use(morgan("tiny"));
app.use(express.static("dist"));

morgan.token("body", (req) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }

  return "";
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

app.get("/api/persons", (request, response) => {
  Person.find({})
    .then((persons) => {
      console.log("Persons from the database:", persons);
      response.json(persons);
    })
    .catch((error) => {
      console.error("Error retrieving persons:", error);
      response.status(500).json({ error: "Failed to retrieve persons" });
    });
});

app.get("/info", (request, response) => {
  Person.find({}).then((persons) => {
    const timeNow = new Date();
    const text = `<p>Phonebook has info for ${
      persons.length
    } people<p><p>${timeNow.toString()}<p>`;
    response.send(text);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const id = Math.floor(Math.random() * (999999 - 1 + 1)) + 1;

  let body = request.body;
  body.id = id;

  const existingPerson = persons.find((p) => p.name === body.name);

  if (existingPerson) {
    return response.status(400).json({ error: "name must be unique" });
  } else if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({ error: "content mising" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
    id: body.id,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => (next(error)));
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number, id } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number, id },
    { new: true, runValidators: true, context: "query" }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.use((error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message }); 
  }

  next(error);
});


const PORT = process.env.PORT;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
