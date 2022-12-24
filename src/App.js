import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

// Hooks to work easier with Firebase + React
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


// identify out project:
firebase.initializeApp({
  // firebase config...
  apiKey: "AIzaSyDRykH--rqBT87uLjZ6FbzBqnML4ighCGg",
  authDomain: "superchat-50025.firebaseapp.com",
  projectId: "superchat-50025",
  storageBucket: "superchat-50025.appspot.com",
  messagingSenderId: "42604651149",
  appId: "1:42604651149:web:48cf9d795c14728d58b8c4",
  measurementId: "G-P86WYT6TYG"
})

// auth and firestore SDK as global variables 
const auth = firebase.auth();
const firestore = firebase.firestore();


function App() {
  // signed in: user is an object | signed out: user is null
  const [user] = useAuthState(auth)


  return (
    <div className="App">
      <header>
        <h1>Chat App</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom/> : <SignIn/>}
      </section>
    </div>
  );
}

/** ------------------------------------------------------------------------------- */
function SignIn(){
  const signInWithGoogle = () =>{
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider) // trigger Popup window, when user clicks on button
  }
  return(
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

function SignOut(){
  return auth.currentUser &&(
    <button onClick={()=>{auth.signOut()}}>Sign Out</button>
  )
}

function ChatRoom(){
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  // listen to data with hook (returns a object, where each object is the text message)
  const [messages] = useCollectionData(query, {idField: "id"}); 
  // input value
  const [formValue, setFormValue] = useState("");

  const dummy = useRef()
  const sendMessage = async(e) =>{
    e.preventDefault();
    const { uid /*, photoURL*/ } = auth.currentUser;

    // create new document in firestore, it takes a javascript object as its argument (wichtig)!
    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      /*photoURL,*/
    });

    // after document is in database, we can reset the FormValue value
    setFormValue("")
    // after sending message, scroll down
    dummy.current.scrollIntoView({ behavior: 'smooth'}) 
  }
  
  return(
    <>      
      <main>
        {messages && messages.map((msg)=> 
          <ChatMessage key={msg.id} message={msg}/>
        )}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e)=>setFormValue(e.target.value)} placeholder="Schreibe etwas"/>
        <button type="submit" disabled={!formValue}>Senden</button>
      </form>
    </>
  )
}

function ChatMessage(props){
  const {text, uid} = props.message;
  // set the class of message for styling
  const messageClass = (uid === auth.currentUser.uid ? 'sent' : 'received'); 

  return (
    <div className={`message ${messageClass}`}>
      {/* <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'}*/} 
      <p>{text}</p>
    </div>
  )
}

export default App;
