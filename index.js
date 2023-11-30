const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

const app = express();
app.use(bodyParser.json());
app.use(cors());
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  todos: [
    {
      title: String,
      desc: String,
    },
  ],
});

const User = mongoose.model('User', UserSchema);

app.post('/addTodo', async (req, res) => {
  try {
    const token = req.body.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.user_id;
    const { title, desc } = req.body;
    const user = await User.findById(userId);
    user.todos.push({ title, desc });
    await user.save();
    res.status(201).json({ message: 'Todo added successfully' });
  } catch (error) {
    console.error("error here : ", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/todos', async (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.user_id;

    const user = await User.findById(userId).populate('todos');
    const todos = user.todos;

    res.status(200).json({ todos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Registration route
app.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const newUser = new User({ email, password, todos: [] });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', redirectTo: '/login' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const secretKey = JWT_SECRET;
    const token = jwt.sign({ user_id: user._id, email: user.email }, secretKey, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token, username: user.email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/firebaseLogin', async (req, res) => {
  try {
    const email = req.body.email;
    const existingUser = await User.findOne({ email });
    const secretKey = JWT_SECRET;
    let finalToken = null;
    if (existingUser) {
      console.log("User already exists in the database");
      const token = jwt.sign({ user_id: existingUser._id, email: email }, secretKey, { expiresIn: '1h' });
      finalToken = token;
    } else {
      const newUser = new User({ email, password: "" });
      await newUser.save();
      console.log("New user created in the database");
      const token = jwt.sign({ user_id: newUser._id, email: email }, secretKey, { expiresIn: '1h' });
      finalToken = token;
    }
    res.status(200).json({ message: 'Login successful', finalToken, username: email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get('/login', async (req, res) => {
  const token = req.query.token;
  const secretKey = JWT_SECRET;
  //Decode Token
  try {
    const decoded = jwt.verify(token, secretKey);
    const username = decoded.email;
    res.status(200).json({ username });
  } catch (error) {
    console.error('Error decoding token:', error.message);
  }
})

app.delete('/deleteTodo', async (req, res) => {
  try {
    const token = req.query.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.user_id;

    const title = req.query.title;
    const user = await User.findById(userId);
    user.todos = user.todos.filter(todo => todo.title !== title);
    await user.save();

    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
