import React, { Component } from 'react';
import './header.css';
import GoogleAuth from '../google-auth/google-auth';

class Header extends Component {
    render() {
        return (
            <div className="container-fluid header--main-div">
                <h1 className="header--heading">MovieBox...</h1>
                <GoogleAuth />
            </div>
        );
    }
}

export default Header;