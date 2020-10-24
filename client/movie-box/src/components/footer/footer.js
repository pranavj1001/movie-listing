import React, { Component } from 'react';
import './footer.css';

class Footer extends Component {
    render() {
        return (
            <footer className="footer">
                Developed with <span className="footer--heart">❤</span> by <a className="footer--link" href="https://github.com/pranavj1001" rel="noopener noreferrer" target="_blank">Pranav Jain</a>.
            </footer>
        );
    }
}

export default Footer;