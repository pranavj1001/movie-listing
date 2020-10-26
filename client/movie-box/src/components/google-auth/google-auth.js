import React, { Component } from 'react';
import { connect } from 'react-redux';

import { signIn, signOut } from '../../actions';

import './google-auth.css';

class GoogleAuth extends Component {

    componentDidMount() {
        window.gapi.load('client:auth2', () => {
            window.gapi.client.init({
                clientId: '885575434437-t5b336u3rjm000i5kovrgim5ckfqias9.apps.googleusercontent.com',
                scope: 'email'
            }).then(() => {
                this.auth = window.gapi.auth2.getAuthInstance();
                this.onAuthStatusChange(this.auth.isSignedIn.get());
                this.auth.isSignedIn.listen(this.onAuthStatusChange);
            });
        });
    }

    onAuthStatusChange = (isSignedIn) => {
        if (isSignedIn) {
            this.props.signIn(this.auth.currentUser.get().getBasicProfile().getEmail());
        } else {
            this.props.signOut();
        }
    };

    signIn = () => {
        this.auth.signIn();
    }

    signOut = () => {
        this.auth.signOut();
    }

    renderSignInButton() {
        if (this.props.isSignedIn === null) {
            return null;
        } else if (this.props.isSignedIn) {
            return <button className="btn btn-primary" onClick={this.signOut}>Sign Out</button>;
        } else {
            return <button className="btn btn-primary" onClick={this.signIn}>Sign In</button>;
        }
    }

    render() {
        return <div className="google-auth--div">{this.renderSignInButton()}</div>;
    }
}

const mapStateToProps = (state) => {
    return { isSignedIn: state.auth.isSignedIn };
};

export default connect(mapStateToProps, { signIn, signOut })(GoogleAuth);