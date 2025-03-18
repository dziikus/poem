// Wait for Firebase SDK to be loaded
window.addEventListener('DOMContentLoaded', () => {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAA9_DcZtkUom9fU5FD1Z-9UtjTI144TPI",
    authDomain: "poem-7dd6a.firebaseapp.com",
    projectId: "poem-7dd6a",
    storageBucket: "poem-7dd6a.firebaseapp.com",
    messagingSenderId: "831697884998",
    appId: "1:831697884998:web:8d31fa37f60ad60e03f747",
    measurementId: "G-2WS4ZKR5LR"
  };


  // Initialize Firebase
  try {
    console.log('Initializing Firebase...');
    // Check if Firebase is already initialized
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
      console.log('Firebase app initialized');
    }
    
    // Get Firebase services
    const auth = firebase.auth();
    const db = firebase.firestore();
    console.log('Firebase services obtained');

    // Initialize Analytics only if available
    if (firebase.analytics) {
      firebase.analytics();
    }

    // Make populateDatabase function globally accessible
    window.populateDatabase = async function() {
      console.log('Starting database population...');
      try {
        // Clear existing data first
        const dialoguesRef = db.collection('dialogues');
        const existingDocs = await dialoguesRef.get();
        const batch = db.batch();
        existingDocs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('Cleared existing data');

        // Add new dialogues
        for (const dialogue of sampleData.dialogues) {
          console.log(`Adding dialogue: ${dialogue.name}...`);
          await dialoguesRef.doc(dialogue.id).set({
            name: dialogue.name,
            sequence: dialogue.sequence
          });
        }
        
        console.log('Database populated successfully');
        return true;
      } catch (error) {
        console.error('Error populating database:', error);
        throw error;
      }
    };

    // Authentication function with better error handling
    async function authenticateUser() {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      try {
        // Attempt to sign in
        const result = await auth.signInWithPopup(provider);
        const email = result.user.email;
        
        // Check if user has access
        console.log('User authenticated successfully:', email);
        return true;
        
      } catch (error) {
        console.error('Authentication error:', error);
        throw error;
      }
    }

    // Check if user is logged in
    async function isUserLoggedIn() {
      return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe(); // Stop listening to changes
          if (user) {
            console.log('User is logged in:', user.email);
            resolve(true);
          } else {
            console.log('No user is logged in');
            resolve(false);
          }
        });
      });
    }

    // Sign out function
    async function signOut() {
      try {
        await auth.signOut();
        console.log('User signed out successfully');
      } catch (error) {
        console.error('Error signing out:', error);
        throw error;
      }
    }

    // Simplified data fetching functions
    async function fetchDialogues() {
      try {
        const snapshot = await db.collection('dialogues').get();
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error('Error fetching dialogues:', error);
        throw error;
      }
    }

    // Export functions
    window.firebaseHelper = {
      authenticateUser,
      isUserLoggedIn,
      signOut,
      fetchDialogues,
      populateDatabase
    };

    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    alert('Failed to initialize Firebase. Please check your internet connection and try again.');
  }
}); 