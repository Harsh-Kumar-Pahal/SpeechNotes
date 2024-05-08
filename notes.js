import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js';
import { getFirestore, doc, collection, addDoc, deleteDoc, query, onSnapshot, getDocs } from 'https://www.gstatic.com/firebasejs/9.6.6/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDB_ylrW7hartjCjSAqjjZjUoNSrSX7Et4",
    authDomain: "blogs-a7325.firebaseapp.com",
    databaseURL: "https://blogs-a7325-default-rtdb.firebaseio.com",
    projectId: "blogs-a7325",
    storageBucket: "blogs-a7325.appspot.com",
    messagingSenderId: "868013133674",
    appId: "1:868013133674:web:8ceaa7dfa63ee0d2a0df13",
    measurementId: "G-RJX09FKMMY"
};

// let notebook = document.getElementById('notebook').innerText;
// let notebook = document.getElementById('NotebookName').innerText;
const notebook = localStorage.getItem('notebook');
console.log('Notebook:', notebook); // Add this line



const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const notebookRef = doc(db, 'Notebooks', notebook); // Reference to the notebook document
const notesCollection = collection(notebookRef, 'Notes'); // Reference to the "Notes" subcollection within the notebook document


// Function to delete a note by its ID
async function deleteNoteById(noteId) {
    await deleteDoc(doc(notesCollection, noteId));
}

// Function to delete all notes
async function deleteAllNotes() {
    const snapshot = await getDocs(notesCollection);
    snapshot.forEach(async (doc) => {
        await deleteNoteById(doc.id);
    });
}


// Function to display a note element with a delete button
function displayNoteElement(noteId, noteText) {
    const noteElement = document.createElement("div");
    noteElement.classList.add("note"); // Add a default class name "note"
    noteElement.innerHTML = noteText;

    // Create a delete button
    const deleteButton = document.createElement("span");
    deleteButton.textContent = "x";
    // deleteButton.style.backgroundColor = "#c3c3c3";
    deleteButton.style.padding = "4px";
    deleteButton.style.float = "right";
    deleteButton.style.borderRadius = "6px";
    deleteButton.style.translateY = "400%";
    deleteButton.style.marginTop="-5px";
    deleteButton.style.cursor = "pointer";
    deleteButton.style.display = "inline-block";
    deleteButton.style.transform = "translateY(10%)";
    deleteButton.style.marginLeft = "20px";
    deleteButton.classList.add("delete-btn");
    deleteButton.addEventListener("click", async function () {
        await deleteNoteById(noteId);
        noteElement.remove(); // Remove the note element from the DOM
        deleteButton.remove(); // Remove the delete button from the DOM
    });
    noteElement.appendChild(deleteButton);

    document.getElementById("output-container").appendChild(noteElement);
}

// Initialize SpeechRecognition

// Initialize SpeechRecognition
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
let noteCounter = 1;

recognition.onstart = function () {
    createNewNoteElement();
};

recognition.onresult = function (event) {
    let finalTranscript = "";

    for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
        }
    }

    if (finalTranscript.trim() !== "") {
        appendToCurrentNoteElement(`<p> ${finalTranscript}</p>`);
        saveTextToDatabase(finalTranscript.trim());
    }
};

function createNewNoteElement() {
    const noteElement = document.createElement("div");
    noteElement.classList.add("note"); // Add a default class name "note"

    // Create a delete button
    const deleteButton = document.createElement("span");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-btn");
    deleteButton.addEventListener("click", async function () {
        await deleteNoteById(`notebook-${noteCounter}`);
        noteElement.remove(); // Remove the note element from the DOM
        deleteButton.remove(); // Remove the delete button from the DOM
    });
    noteElement.appendChild(deleteButton);

    document.getElementById("output-container").appendChild(noteElement);
    noteCounter++;
}

function appendToCurrentNoteElement(content) {
    const currentNoteElement = document.querySelector(".note:last-child");
    if (currentNoteElement) {
        currentNoteElement.innerHTML += content;
    }
}


async function saveTextToDatabase(text) {
    try {
        await addDoc(notesCollection, { text: text });
        console.log("Note added successfully!");
    } catch (error) {
        console.error("Error adding note: ", error);
    }
}

// Call function to display notes when the page is loaded
onSnapshot(notesCollection, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            displayNoteElement(change.doc.id, change.doc.data().text);
        }
    });
});

window.addEventListener("beforeunload", function () {
    recognition.stop();
});

document.getElementById("start-btn").addEventListener("click", function () {
    recognition.start();
});

document.getElementById("stop-btn").addEventListener("click", function () {
    recognition.stop();
    setTimeout(() => {
        window.location.reload();
    }, 800); // Reload after 2 seconds (2000 milliseconds)
});


document.getElementById("del").addEventListener("click", function () {
    deleteAllNotes();
});


