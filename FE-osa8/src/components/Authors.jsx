import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, UPDATE_AUTHOR } from './queries'

const Authors = (props) => {
  if (!props.show) {
    return null
  }

  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [updateAuthor] = useMutation(UPDATE_AUTHOR, {
    onError: (error) => {
      console.error('Error updating author:', error)
    },
    onCompleted: () => {
      console.log(name, born, ' updated successfully')
    },
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  const result = useQuery(ALL_AUTHORS)
  if (result.loading) {
    return <p>Loading...</p>
  }
  if (result.error) {
    return <p>Error: {result.error.message}</p>
  }

  const authors = result.data.allAuthors
  if (!authors || authors.length === 0) {
    return <p>No authors found</p>
  }

  const submit = async (event) => {
    event.preventDefault()

    await updateAuthor({
      variables: {
        name,
        born: parseInt(born, 10)
      }
    })
    setName('')
    setBorn('')
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {props.token && (
        <>
          <h3>Set birthyear</h3>
          <form onSubmit={submit}>
            <div>
              name
              <select value={name} onChange={({ target }) => setName(target.value)}>
                <option value="" disabled>Select author</option>
                {authors.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              born
              <input
                type="number"
                value={born}
                onChange={({ target }) => setBorn(target.value)}
              />
            </div>
            <button type="submit">update author</button>
          </form>
        </>
      )}
    </div>
  )
}

export default Authors
