import { getAuth } from './firebase';
import { createUserDocument, findOrphanedUserByEmail } from './user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import auth from '@react-native-firebase/auth';

import { revenueCatService } from './revenueCat.service';

// Configure Google Sign-In
GoogleSignin.configure({
    webClientId: '409218471461-pp6c816pgr1d90q22i55ig5evd44grlg.apps.googleusercontent.com', // Get this from Firebase Console -> Authentication -> Sign-in method -> Google
});

export async function signInWithEmailPassword(email: string, password: string) {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
        throw new Error('EMAIL_PASSWORD_REQUIRED');
    }
    const res = await getAuth().signInWithEmailAndPassword(trimmedEmail, password);

    // Save user ID to AsyncStorage
    if (res.user) {
        await AsyncStorage.setItem('userId', res.user.uid);
        await AsyncStorage.setItem('userEmail', res.user.email || '');
        console.log('[Auth] User ID saved to AsyncStorage:', res.user.uid);

        // Identify user in RevenueCat
        await revenueCatService.login(res.user.uid);
    }

    return res.user;
}

export async function signUpWithEmailPassword(email: string, password: string, displayName?: string) {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
        throw new Error('EMAIL_PASSWORD_REQUIRED');
    }
    const cred = await getAuth().createUserWithEmailAndPassword(trimmedEmail, password);
    if (displayName) {
        await cred.user.updateProfile({ displayName });
    }

    // Create user document in Firestore
    await createUserDocument(cred.user.uid, trimmedEmail, displayName);

    // Save user ID to AsyncStorage
    await AsyncStorage.setItem('userId', cred.user.uid);
    await AsyncStorage.setItem('userEmail', cred.user.email || '');
    console.log('[Auth] User ID saved to AsyncStorage:', cred.user.uid);

    // Check for orphaned account to restore subscription
    let revenueCatUserId = cred.user.uid;
    try {
        // Pass cred.user.uid to exclude the currently created document
        const orphanedId = await findOrphanedUserByEmail(trimmedEmail, cred.user.uid);
        if (orphanedId) {
            console.log(`[Auth] Linked new account ${cred.user.uid} to orphaned ID ${orphanedId}`);
            revenueCatUserId = orphanedId;
        }
    } catch (e) {
        console.warn('[Auth] Failed to check for orphans:', e);
    }

    // Identify user in RevenueCat
    await revenueCatService.login(revenueCatUserId);

    return cred.user;
}

export async function signInWithGoogle() {
    try {
        // Check if your device supports Google Play
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        // Get the users ID token
        const response = await GoogleSignin.signIn();

        // Check if response has data (v16+)
        const idToken = response.data?.idToken;
        if (!idToken) {
            throw new Error('Google Sign-In failed - no id token returned');
        }

        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);

        // Sign-in the user with the credential
        const userCredential = await getAuth().signInWithCredential(googleCredential);

        // Create user document if it doesn't exist (or update it)
        // We might want to check if it exists first to avoid overwriting, but createUserDocument usually handles that or we can modify it.
        // For now, let's assume createUserDocument is safe or we just want to ensure it exists.
        // Google user usually has a display name and email.
        await createUserDocument(
            userCredential.user.uid,
            userCredential.user.email || '',
            userCredential.user.displayName || 'Google User'
        );

        // Save user ID to AsyncStorage
        await AsyncStorage.setItem('userId', userCredential.user.uid);
        await AsyncStorage.setItem('userEmail', userCredential.user.email || '');

        // Check for orphaned account if this is a new user (or just always check to be safe)
        let revenueCatUserId = userCredential.user.uid;
        if (userCredential.additionalUserInfo?.isNewUser || true) { // Always check to catch re-installs/re-logins
            try {
                const userEmail = userCredential.user.email || '';
                if (userEmail) {
                    const orphanedId = await findOrphanedUserByEmail(userEmail, userCredential.user.uid);
                    if (orphanedId) {
                        console.log(`[Auth] Linked Google account ${userCredential.user.uid} to orphaned ID ${orphanedId}`);
                        revenueCatUserId = orphanedId;
                    }
                }
            } catch (e) {
                console.warn('[Auth] Failed to check for orphans (Google):', e);
            }
        }

        // Identify user in RevenueCat
        await revenueCatService.login(revenueCatUserId);

        return userCredential.user;
    } catch (error) {
        console.error('Google Sign-In Error:', error);
        throw error;
    }
}

export async function signInWithApple() {
    try {
        // Start the sign-in request
        const appleAuthRequestResponse = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            // Note: User name is only returned on first sign in.
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });

        // Ensure Apple returned a user identityToken
        if (!appleAuthRequestResponse.identityToken) {
            throw new Error('Apple Sign-In failed - no identify token returned');
        }

        // Create a Firebase credential from the response
        const { identityToken, nonce } = appleAuthRequestResponse;
        const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

        // Sign the user in with the credential
        const userCredential = await getAuth().signInWithCredential(appleCredential);

        // Handle user document creation
        // Apple only returns name on the very first login.
        const { fullName } = appleAuthRequestResponse;
        const displayName = fullName ? `${fullName.givenName} ${fullName.familyName}` : undefined;

        // If we have a display name (first login), update the profile
        if (displayName) {
            await userCredential.user.updateProfile({ displayName });
        }

        await createUserDocument(
            userCredential.user.uid,
            userCredential.user.email || '',
            displayName || userCredential.user.displayName || 'Apple User'
        );

        // Save user ID to AsyncStorage
        await AsyncStorage.setItem('userId', userCredential.user.uid);
        await AsyncStorage.setItem('userEmail', userCredential.user.email || '');

        // Check for orphaned account
        let revenueCatUserId = userCredential.user.uid;
        try {
            const userEmail = userCredential.user.email || '';
            if (userEmail) {
                const orphanedId = await findOrphanedUserByEmail(userEmail);
                if (orphanedId) {
                    console.log(`[Auth] Linked Apple account ${userCredential.user.uid} to orphaned ID ${orphanedId}`);
                    revenueCatUserId = orphanedId;
                }
            }
        } catch (e) {
            console.warn('[Auth] Failed to check for orphans (Apple):', e);
        }

        // Identify user in RevenueCat
        await revenueCatService.login(revenueCatUserId);

        return userCredential.user;
    } catch (error) {
        console.error('Apple Sign-In Error:', error);
        throw error;
    }
}

export async function signOut() {
    try {
        try {
            await getAuth().signOut();
        } catch (error: any) {
            // Ignore error if no user is currently signed in
            if (error.code === 'auth/no-current-user' || error.message?.includes('no-current-user')) {
                console.log('[Auth] No user currently signed in, proceeding with local cleanup');
            } else {
                throw error;
            }
        }

        // Attempt to sign out from Google as well if they were signed in that way, 
        // but it's not strictly required for Firebase signout. 
        // However, it's good practice to clear the Google session so they can switch accounts.
        try {
            await GoogleSignin.signOut();
        } catch (e) {
            // Ignore error if not signed in with Google
        }

        // Logout from RevenueCat
        await revenueCatService.logout();

        // Clear user data from AsyncStorage
        await AsyncStorage.removeItem('userId');
        await AsyncStorage.removeItem('userEmail');
        console.log('[Auth] User data cleared from AsyncStorage');
    } catch (error) {
        console.error('Sign Out Error:', error);
        throw error;
    }
}

export async function deleteUserAccount() {
    try {
        const user = getAuth().currentUser;
        if (!user) {
            throw new Error('No user currently signed in.');
        }

        // Delete from Firebase Auth
        await user.delete();

        // Attempt to sign out from Google as well (clean up local session)
        try {
            await GoogleSignin.signOut();
        } catch (e) {
            // Ignore
        }

        // Logout from RevenueCat
        await revenueCatService.logout();

        // Clear user data from AsyncStorage
        await AsyncStorage.removeItem('userId');
        await AsyncStorage.removeItem('userEmail');
        console.log('[Auth] User account deleted and local data cleared');
    } catch (error) {
        console.error('Delete Account Error:', error);
        throw error;
    }
}

export function onAuthStateChanged(callback: (user: any) => void) {
    return getAuth().onAuthStateChanged(callback);
}


