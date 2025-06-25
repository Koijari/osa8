import React, { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from './queries'

const Books = (props) => {
  if (!props.show) {
    return null
  }

  const [selectedGenre, setSelectedGenre] = useState(null)

  const result = useQuery(ALL_BOOKS)

  if (result.loading) {
    return <p>Loading...</p>;
  }
  if (result.error) {
    return <p>Error: {result.error.message}</p>;
  }

  const books = result.data.allBooks

  if (!books || books.length === 0) {
    return <p>No books found</p>
  }

  const genreSet = new Set()
  books.forEach(book => {
    book.genres.forEach(genre => genreSet.add(genre))
  })
  const genres = Array.from(genreSet)

  const filteredBooks = selectedGenre
    ? books.filter(book => book.genres.includes(selectedGenre))
    : books

  return (
    <div>
      <h2>books</h2>

      <table>
        <thead style={{ backgroundColor: 'lightgray' }}>
          <tr>
            <th style={{width: '70%'}}>title</th>
            <th style={{width: '20%'}}>author</th>
            <th style={{width: '10%'}}>published</th>
          </tr>
        </thead>
        <tbody>
          {filteredBooks.map((book) => (
            <tr key={book.id}>
              <td style={{width: '70%'}}>{book.title}</td>
              <td style={{width: '20%'}}>{book.author.name}</td>
              <td style={{width: '10%'}}>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      
      <div style={{ marginBottom: '1rem' }}>
        <strong>filter by genre:</strong>{' '}
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            style={{
              margin: '0.3rem',
              backgroundColor: selectedGenre === genre ? 'blue' : 'lightgray',
              color: selectedGenre === genre ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              padding: '0.3rem 0.6rem',
              cursor: 'pointer'
            }}
          >
            {genre}
          </button>
        ))}
        <button
          onClick={() => setSelectedGenre(null)}
          style={{
            margin: '0.3rem',
            backgroundColor: 'gray',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '0.3rem 0.6rem',
            cursor: 'pointer'
          }}
        >
          all genres
        </button>
      </div>
    </div>
  )
}

export default Books
