import React from 'react'
import ReactDOM from 'react-dom'
import MainView from './components/main-view/main-view'
import Footer from './components/footer/footer'

// Bootstrap
import Container from 'react-bootstrap/Container'
// styles
import './index.scss'
import ErrorBoundary from './components/ErrorBoundary'

class MyFlixApplication extends React.Component {
  render () {
    return (
      <ErrorBoundary>
        <Container>
          <MainView />
        </Container>
        <Footer />
      </ErrorBoundary>
    )
  }
}

// Finds the root of your app
const container = document.getElementsByClassName('app-container')[0]
// Tells React to render your app in the root DOM el
ReactDOM.render(React.createElement(MyFlixApplication), container)
