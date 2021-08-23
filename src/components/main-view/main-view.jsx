import React from 'react'
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom'
import PropTypes from 'prop-types'
import axios from 'axios'
import { connect } from 'react-redux'

import { login, setMovies, setLoggedIn } from '../../actions/actions'
import MoviesList from '../movies-list/movies-list'

import RegistrationView from '../registration-view/registration-view'
import LoginView from '../login-view/login-view'
import MovieView from '../movie-view/movie-view'
import GenreView from '../genre-view/genre-view'
import DirectorView from '../director-view/director-view'
import ProfileView from '../profile-view/profile-view'
import Loading from '../loading-view/loading-view'
import Navbar from '../navbar/navbar'
import Footer from '../footer/footer'

import './main-view.scss'
class MainView extends React.Component {
  constructor () {
    super()
    this.state = {
      selectedMovie: null,
      genre: [],
      directors: [],
      register: false,
      hasError: false
    }
  }

  componentDidMount () {
    const accessToken = localStorage.getItem('token')
    if (accessToken != null) {
      this.props.login(localStorage.getItem('user'))
      this.getMovies(accessToken)
    }
  }

  onLoggedIn (authData) {
    console.log(authData)
    this.props.login(authData.user.username)
    localStorage.setItem('token', authData.token)
    localStorage.setItem('user', authData.user.username)
    this.getMovies(authData.token)
  }

  onLoggedOut () {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    this.props.login('')
  }

  getMovies (token) {
    axios.get('https://cinema-barn.herokuapp.com/movies', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      this.props.setMovies(res.data)
    }).catch(function (error) {
      console.log(error)
    })
  }

  getMoviesByGenre (movies) {
    const accessToken = localStorage.getItem('token')
    axios.get(`https://cinema-barn.herokuapp.com/genre/${movies}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(res => {
      console.log(res.data)
      // assign the result to state
      this.setState({
        genre: res.data
      })
      // return res.data
    }).catch(function (error) {
      console.log(error)
    })
  }

  onRegister () {
    this.setState({
      register: true
    })
  }

  triggerUpdate (user) {
    window.location.reload()
  }

  render () {
    const { movies, genre, user, profile, isLoggedIn } = this.props
    console.log(user)
    return (
      <Router>
        <Navbar onLogOutClick={() => this.onLoggedOut()} user={profile} />
        <Route
          exact
          path='/'
          render={() => {
            if (!localStorage.getItem('token')) return <LoginView onLoggedIn={user => this.onLoggedIn(user)} />
            if (movies.length === 0) return <Loading />
            return <MoviesList movies={movies} />
          }}
        />
        <Route
          exact
          path='/register'
          render={() => {
            if (user) return <Redirect to='/' />
            return <RegistrationView onLoggedIn={user => this.onLoggedIn(user)} onRegisterClick={() => this.triggerUpdate()} />
          }}
        />
        <Route
          exact
          path='/movies/:movieId'
          render={({ match, history }) => {
            if (!isLoggedIn) return <Redirect to='/' />
            return <MovieView movie={movies.find(m => m._id === match.params.movieId)} onBackClick={() => history.goBack()} />
          }}
        />
        <Route
          exact
          path='/directors/:name'
          // match and history are objects we can use
          render={({ match, history }) => {
            console.log(match, history)
            if (!genre) return <Loading />
            if (!user) return <Redirect to='/' />
            return <DirectorView movies={movies} name={match.params.name} onBackClick={() => history.goBack()} />
          }}
        />
        <Route
          exact
          path='/genres/:genre'
          render={({ match, history }) => {
            if (!genre) return <Loading />
            if (!user) return <Redirect to='/' />
            return <GenreView movies={movies} genre={match.params.genre} onBackClick={() => history.goBack()} />
          }}
        />
        <Route
          exact
          path='/user/:name'
          render={({ match, history }) => {
            if (!localStorage.getItem('token')) return <Redirect to='/' />
            return <ProfileView handleUpdate={() => this.triggerUpdate()} user={profile} onLoggedIn={user => this.onLoggedIn(user)} getMovies={user => this.getMovies(user)} />
          }}
        />
        <Footer user={user} />
      </Router>
    )
  }
}
const mapStateToProps = state => {
  return { movies: state.movies, profile: state.profile, isLoggedIn: state.profile }
}
export default connect(mapStateToProps, { setMovies, login })(MainView)
MainView.propTypes = {
  movies: PropTypes.arrayOf(PropTypes.shape({
    Title: PropTypes.string.isRequired,
    Description: PropTypes.string.isRequired,
    ImagePath: PropTypes.string.isRequired,
    Featured: PropTypes.bool.isRequired,
    Genre: PropTypes.shape({
      Name: PropTypes.string.isRequired,
      Description: PropTypes.string.isRequired
    }).isRequired,
    Director: PropTypes.shape({
      Name: PropTypes.string.isRequired,
      Bio: PropTypes.string.isRequired,
      //TODO: update database with DOB values
      DOB: PropTypes.string.isRequired,
      YOD: PropTypes.string.isRequired
    }).isRequired
  })),
  selectedMovie: PropTypes.string,
  user: PropTypes.string,
  register: PropTypes.bool
}
