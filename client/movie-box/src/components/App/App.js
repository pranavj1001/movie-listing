import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import './App.css';

import Header from '../header/header';
import Footer from '../footer/footer';
import Home from '../home/home';
import MovieDetails from '../movie-details/movie-details';

function App() {
  return (
    <div className="wrapper">
      <Header />

      <div className="content-div">
      <Router>
        <Switch>
          <Route path="/movie/:movieId" component={MovieDetails} />
          <Route path="/" component={Home} />
        </Switch>
      </Router>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
