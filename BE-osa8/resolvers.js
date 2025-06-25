const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Book = require('./models/books')
const Author = require('./models/authors')
const User = require('./models/users')
const { PubSub } = require('graphql-subscriptions')

const pubsub = new PubSub()

const resolvers = {
  Query: {
    bookCount: async () => {
      return await Book.countDocuments({})
    },
    authorCount: async () => {
      return await Author.countDocuments({})
    },
    allBooks: async (root, args) => {
      let filter = {}
      if (args.genre) {
        filter.genres = { $in: [args.genre] }
      }
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (!author) {
          return []
        }
        filter.author = author._id
      }
      return await Book.find(filter).populate('author')
    },
    allAuthors: async () => {
      const authors = await Author.find({})
      const books = await Book.find({}).populate('author')
      return authors.map(author => {
        const authorBooks = books.filter(b => b.author.id === author.id)
        return {
          name: author.name,
          id: author.id,
          born: author.born,
          bookCount: authorBooks.length,
          authorbooks: authorBooks.map(b => ({
            title: b.title,
            published: b.published,
            genres: b.genres,
            id: b.id
          }))
        }
      })
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      let author = await Author.findOne({ name: args.author })
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }
      if (!author) {
        author = new Author({ name: args.author })
        try {
          await author.save()
          currentUser.favoriteGenre = args.genres[0]
          await currentUser.save()
        } catch (error) {
          throw new GraphQLError('Saving author failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
              error
            }
          })
        }
      }
      
      const book = new Book({
        title: args.title,
        published: args.published,
        genres: args.genres,
        author: author._id
      })
      try {
        await book.save()
        return await book.populate('author')
      } catch (error) {
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error
          }
        })
      }
      finally {
        pubsub.publish('BOOK_ADDED', { bookAdded: book })
        return book
      }
    }, 
    editAuthor: async (root, args, context) => {
      let author = await Author.findOne({ name: args.name })
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new GraphQLError('Not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        })
      }
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      try {
        await author.save()
      } catch (error) {
        throw new GraphQLError('Updating author failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.name,
            error
          }
        })
      }
      return author
    },
    createUser: async (root, args) => {
      const user = new User({ 
        username: args.username,
        favoriteGenre: args.favoriteGenre
      })

      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.username,
              error
            }
          })
        })
    },
    login: async (root, args) => {
    try {
        const user = await User.findOne({ username: args.username })
        console.log('Login attempt for', args.username)

        if (!user || args.password !==  process.env.JWT_SECRET) {
        throw new GraphQLError('wrong credentials', {
            extensions: { code: 'BAD_USER_INPUT' }
        })
        }

        const userForToken = {
        username: user.username,
        id: user._id,
        }

        return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }

    } catch (error) {
        console.error('Login error:', error)
        throw new GraphQLError('Login failed', {
            extensions: { code: 'INTERNAL_SERVER_ERROR' }
        })
        }
    }},
    Subscription: {
      bookAdded: {
        subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
      },
    }
}

module.exports = resolvers
