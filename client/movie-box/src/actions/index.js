import { SIGN_IN_ACTION, SIGN_OUT_ACTION } from './action_constants';

export const signIn = () => {
    return {
        type: SIGN_IN_ACTION
    };
};

export const signOut = () => {
    return {
        type: SIGN_OUT_ACTION
    };
};