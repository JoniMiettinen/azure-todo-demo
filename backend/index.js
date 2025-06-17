const express = require('express');
const cors = require('cors');
const path = require('path');
const { Connection, Request, TYPES } = require('tedious');

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Azure SQL config using Managed Identity
const config = {
  server: process.env.SQL_SERVER,         // esim. myserver.database.windows.net
  authentication: {
    type: 'azure-active-directory-msi-app-service',
  },
  options: {
    database: process.env.SQL_DATABASE,   // esim. todo-db
    encrypt: true,
    trustServerCertificate: false,
  },
};

// GET /todos
app.get('/todos', (req, res) => {
  const connection = new Connection(config);

  connection.on('connect', err => {
    if (err) return res.status(500).send('DB connect error');

    const todos = [];
    const request = new Request('SELECT Id, Task, IsDone FROM Todos', (err) => {
      if (err) res.status(500).send('Query error');
      else res.json(todos);
      connection.close();
    });

    request.on('row', columns => {
      const todo = {};
      columns.forEach(col => (todo[col.metadata.colName] = col.value));
      todos.push(todo);
    });

    connection.execSql(request);
  });

  connection.connect();
});

// POST /todos
app.post('/todos', (req, res) => {
  const { Task } = req.body;
  if (!Task) return res.status(400).send('Task required');

  const connection = new Connection(config);

  connection.on('connect', err => {
    if (err) return res.status(500).send('DB connect error');

    const request = new Request(
      `INSERT INTO Todos (Task, IsDone) VALUES (@Task, 0)`,
      err => {
        if (err) res.status(500).send('Insert failed');
        else res.status(201).send('Added');
        connection.close();
      }
    );

    request.addParameter('Task', TYPES.NVarChar, Task);
    connection.execSql(request);
  });

  connection.connect();
});

// Serve React build
const frontendPath = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(port, () => console.log(`Server on port ${port}`));
