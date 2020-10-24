import React, { Component } from 'react';
import './header.css';

class Header extends Component {
    render() {
        return (
            <div className="container-fluid header--main-div">
                <h1 className="header--heading">MovieBox...</h1>
            </div>
        );
    }
}

export default Header;