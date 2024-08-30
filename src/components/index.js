const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors")

app.use(cors())

app.use(express.json()) ///metodo exclusivo de express para convertir dato json a objeto javascript
app.use(morgan('tiny'))

morgan.token('body', (req) =>{
  if(req.method === 'POST'){
    return JSON.stringify(req.body)
  }

  return '';
});

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let persons = [

    { 
        "name": "Arto Hellas", 
        "number": "040-123456",
        "id": 1
      },
      { 

        "name": "Ada Lovelace", 
        "number": "39-44-5323523",
        "id": 2
      },
      { 
        "name": "Dan Abramov", 
        "number": "12-43-234345",
        "id": 3
      },
      { 
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122",
        "id": 4
      }
]

app.get('/api/persons', (request, response) => {
    console.log(request.headers)
    response.json(persons)
})

app.get('/info', (request, response) => {
  const timeNow = new Date();
    const text = `<p>Phonebook has info for ${persons.length} people<p><p>${timeNow.toString()}<p>`
    response.send(text)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id) 

  if(person){
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  console.log(persons)
  persons = persons.filter(person => person.id !== id)
  console.log(persons)

  response.json(persons)
  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const id = Math.floor(Math.random() * (999999 - 1 + 1)) + 1
  
  let person = request.body;
  person.id = id;

  const existingPerson = persons.find(p => p.name === person.name);

  if (existingPerson || !person.name || !person.id) {
    return response.status(400).json({ error: 'name must be unique' });
  }

  persons = persons.concat(person);
  
  response.json(person);
})



const PORT = 7777;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);