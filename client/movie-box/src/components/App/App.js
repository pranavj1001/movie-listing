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

function App() {
  return (
    <div className="wrapper">
      <Header />

      <div className="content-div">
      <Router>
        <Switch>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
