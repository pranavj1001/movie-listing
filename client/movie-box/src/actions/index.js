import { SIGN_IN_ACTION, SIGN_OUT_ACTION } from './action_constants';

export const signIn = (email) => {
    return {
        type: SIGN_IN_ACTION,
        payload: { email }
    };
};

export const signOut = () => {
    return {
        type: SIGN_OUT_ACTION
    };
};