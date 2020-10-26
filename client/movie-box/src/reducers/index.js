import { combineReducers } from 'redux';
import GoogleAuthReducer from './google-auth-reducer';

export default combineReducers({
    auth: GoogleAuthReducer
});