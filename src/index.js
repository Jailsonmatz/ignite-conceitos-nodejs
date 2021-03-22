const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {

  const {username} = request.headers;

  const userExists = users.find( user=> user.username === username);

  if(!userExists){
    return response.status(404).json({error: 'User not found!!'})
  }

  request.user = userExists;

  return next();

}

app.post('/users', (request, response) => {

  const {name, username} = request.body;

  const user = users.some( user=> user.username === username);

  if(user){ return response.status(400).json({error: 'User already exists!!'})}

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  }
  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/users', (request, response) => {
  return response.json(users);
});

app.use(checksExistsUserAccount);

app.get('/todos', (request, response) => {
    const {user} = request;

    return response.json(user.todos);
});

app.post('/todos', (request, response) => {
  const { title, deadline} = request.body;
  const {user} = request;

  const newTodo = {
    id: uuidv4(),
    done: false,
    title,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', (request, response) => {
  const { title, deadline} = request.body;
  const {id} = request.params;
  const {user} = request;

  const todo =  user.todos.find( todo => todo.id === id);

  if(!todo){
      return response.status(404).json({error: 'Todo not found!!'})
  }

  todo.deadline = deadline;
  todo.title = title

  return response.status(201).json(todo);

});

app.patch('/todos/:id/done', (request, response) => {

  const {id} = request.params;
  const {user} = request;

  const todo =  user.todos.find( todo => todo.id === id);

  if(!todo){
    return response.status(404).json({error: 'Todo not found!!'})
  }

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', (request, response) => {
  const {id} = request.params;
  const {user} = request;

  const todo =  user.todos.find( todo => todo.id === id);

  if(!todo){
    return response.status(404).json({error: 'Todo not found!!'})
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();

});

module.exports = app;