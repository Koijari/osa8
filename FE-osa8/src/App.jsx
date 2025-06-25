import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes, Route, Link, useNavigate
} from 'react-router-dom'
import { useApolloClient, useSubscription } from '@apollo/client';
import { BOOK_ADDED } from './components/queries';
import LoginForm from './components/LoginForm';
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Notify from './components/Notify';

const App = () => {
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const client = useApolloClient()

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const bookAdded = data.data.bookAdded;
      console.log('New book added:', bookAdded);
      alert(`New book added: ${bookAdded.title} by ${bookAdded.author.name}`);
    }
  });

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('library-user-token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [])

  const link = {
    padding: 10, margin: 5, color: 'white', backgroundColor: 'blue',
    textDecoration: 'none', borderRadius: 5
  }

  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <div style={{ padding: 20 }}>
        <Link style={link} to="/">authors</Link>
        <Link style={link} to="/books">books</Link>
        {token && <Link style={link} to="/add">add book</Link>}
        {!token
          ? <Link style={{ ...link, backgroundColor: 'green' }} to="/login">login</Link>
          : <button style={{ ...link, backgroundColor: 'red' }} onClick={logout}>logout</button>
        }
      </div>

      <Notify errorMessage={errorMessage} />

      <Routes>
        <Route path="/" element={<Authors show={true} token={token}/>} />
        <Route path="/books" element={<Books show={true} />} />
        <Route path="/login" element={<LoginForm setToken={setToken} setError={notify} />} />
        {token && <Route path="/add" element={<NewBook show={true} />} />}
      </Routes>
    </Router>
  )
}

export default App
