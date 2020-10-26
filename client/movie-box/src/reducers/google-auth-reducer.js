import { SIGN_IN_ACTION, SIGN_OUT_ACTION } from '../actions/action_constants';

const INITIAL_STATE = {
    isSignedIn: null,
    email: ''
};

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case SIGN_IN_ACTION:
            return { ...state, isSignedIn: true, email: action.payload.email };
        case SIGN_OUT_ACTION:
            return { ...state, isSignedIn: false, email: '' };
        default:
            return state;
    }
};