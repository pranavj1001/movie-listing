import { SIGN_IN_ACTION, SIGN_OUT_ACTION } from '../actions/action_constants';

const INITIAL_STATE = {
    isSignedIn: null
};

export default (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case SIGN_IN_ACTION:
            return { ...state, isSignedIn: true };
        case SIGN_OUT_ACTION:
            return { ...state, isSignedIn: false };
        default:
            return state;
    }
};