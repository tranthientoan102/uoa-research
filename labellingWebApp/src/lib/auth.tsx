import { Context, createContext, useContext, useEffect, useState } from 'react';
import { updateAuthUser } from '../utils/db';
import firebase from './firebase';


interface Auth {
    uid: string;
    email: string | null;
    name: string | null;
    photoUrl: string | null;
    token: string | null;
    level: number | 0;
    roles: string[]| null;

}
interface AuthContext {
    auth: Auth | null;
    loading: boolean | null;
    signinWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const authContext: Context<AuthContext> = createContext<AuthContext>({
    auth: null,
    loading: true,
    signinWithGoogle: async () => { },
    signOut: async () => { }
})

const formatAuthState = (user: firebase.User): Auth => ({
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    photoUrl: user.photoURL,
    token: '',
    level: 0,
    roles: ['visitor']
})

function UserProvideAuth() {
    const [auth, setAuth] = useState<Auth | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const handleAuthChange = async (authState: firebase.User | null) => {
        if (!authState) {
            setLoading(false);
            return;
        }
        let formattedAuth = formatAuthState(authState);
        formattedAuth.token = await authState.getIdToken();

        setLoading(false);
        formattedAuth = await updateAuthUser({ ...formattedAuth});
        setAuth(formattedAuth);
    };

    const signedIn = async (
        response: firebase.auth.UserCredential,
        provider: String = 'google'
    ) => {
        if (!response.user) {
            throw new Error('No user');
        }
        const authUser = formatAuthState(response.user);
        console.log(authUser.uid)
        // await addUser({ ...authUser, provider });
    };

    const clear = () => {
        setAuth(null);
        setLoading(true);
    }

    const signinWithGoogle = async () => {
        setLoading(true)
        return firebase.auth()
            .signInWithPopup(new firebase.auth.GoogleAuthProvider())
            .then(signedIn);
    }

    const signOut = async () => {
        return firebase.auth().signOut().then(clear);
    };

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged(handleAuthChange);
        return () => unsubscribe();
    }, [])

    return {
        auth,
        loading,
        signinWithGoogle,
        signOut,
    }
}

export function AuthProvider({ children }: any) {
    const auth = UserProvideAuth();
    return <authContext.Provider value={auth}>{children}</authContext.Provider>
}
export const useAuth = () => useContext(authContext);