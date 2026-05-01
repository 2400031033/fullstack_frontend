import React, { useState, useEffect } from "react";
import "./App.css";

const API = "https://fullstackbackend-production-1804.up.railway.app/api";

function App() {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const [login, setLogin] = useState({ email: "", pass: "" });

  const [book, setBook] = useState({
    title: "",
    author: "",
    cat: "Fiction",
    pdf: null
  });

  /*  LOADING DATA  */
  useEffect(() => {
    fetch(API + "/books")
      .then(res => res.json())
      .then(data => setBooks(data));

    fetch(API + "/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  /* LOGIN */
  async function loginUser() {
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(login)
    });

    const user = await res.json();

    if (!user || !user.email) {
      alert("Invalid Login");
      return;
    }

    setCurrentUser(user);
    setPage(3);
  }

  /* LOGOUT */
  function logout() {
    setCurrentUser(null);
    setPage(1);
  }

  /* DARK MODE */
  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
  }

  /* ADD BOOK */
  async function addBook() {
    if (!book.title || !book.author || !book.pdf) {
      alert("Fill all fields and upload PDF");
      return;
    }

    const newBook = {
      id: Date.now(),
      title: book.title,
      author: book.author,
      cat: book.cat,
      status: "Available",
      owner: null,
      pdfName: book.pdf.name
    };

    const res = await fetch(API + "/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newBook)
    });

    const savedBook = await res.json();

    setBooks([savedBook, ...books]);

    setBook({ title: "", author: "", cat: "Fiction", pdf: null });
    document.getElementById("pdfInput").value = "";
  }

  /* ISSUE */
  async function issueBook(id) {
    const b = books.find(x => x.id === id);

    const updated = {
      ...b,
      status: "Issued",
      owner: currentUser.email
    };

    await fetch(API + "/books", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });

    setBooks(books.map(x => (x.id === id ? updated : x)));
  }

  /* RETURN */
  async function returnBook(id) {
    const b = books.find(x => x.id === id);

    const updated = {
      ...b,
      status: "Available",
      owner: null
    };

    await fetch(API + "/books", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    });

    setBooks(books.map(x => (x.id === id ? updated : x)));
  }

  /* DELETE (ADMIN) */
  async function deleteBook(id) {
    if (!window.confirm("Delete this book?")) return;

    await fetch(API + "/books/" + id, {
      method: "DELETE"
    });

    setBooks(books.filter(b => b.id !== id));
  }

  /* OPEN (DEMO ONLY) */
  function openBook(title) {
    alert("❌ PDF Not Available for " + title);
  }

  return (
    <div className={darkMode ? "container dark" : "container"}>
      {page === 1 && (
        <div className="card center">
          <h1>📚 Library Management</h1>
          <input
            placeholder="Email"
            value={login.email}
            onChange={e => setLogin({ ...login, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={login.pass}
            onChange={e => setLogin({ ...login, pass: e.target.value })}
          />
          <button onClick={loginUser}>Login</button>
          <p className="hint">welcome</p>
        </div>
      )}

      {page === 3 && currentUser && (
        <>
          <div className="header">
            <h3>Welcome, {currentUser.name}</h3>
            <div>
              <button onClick={toggleTheme}>
                {darkMode ? "☀️ Light" : "🌙 Dark"}
              </button>
              <button onClick={logout}>Logout</button>
            </div>
          </div>

          <div className="card">
            <h2>Add Book</h2>
            <input
              placeholder="Title"
              value={book.title}
              onChange={e => setBook({ ...book, title: e.target.value })}
            />
            <input
              placeholder="Author"
              value={book.author}
              onChange={e => setBook({ ...book, author: e.target.value })}
            />
            <select
              value={book.cat}
              onChange={e => setBook({ ...book, cat: e.target.value })}
            >
              <option>Fiction</option>
              <option>Science</option>
              <option>Programming</option>
              <option>Education</option>
            </select>
            <input
              id="pdfInput"
              type="file"
              accept=".pdf"
              onChange={e => setBook({ ...book, pdf: e.target.files[0] })}
            />
            <button onClick={addBook}>Add</button>
          </div>

          <div className="card">
            <h2>Books</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Book</th>
                  <th>Category</th>
                  <th>PDF</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b, i) => (
                  <tr key={b.id}>
                    <td>{i + 1}</td>
                    <td><b>{b.title}</b><br />{b.author}</td>
                    <td>{b.cat}</td>
                    <td>{b.pdfName}</td>
                    <td>{b.status}</td>
                    <td>
                      {b.status === "Available" && (
                        <button onClick={() => issueBook(b.id)}>Issue</button>
                      )}
                      {b.status === "Issued" && (
                        <button className="open" onClick={() => openBook(b.title)}>
                          Open
                        </button>
                      )}
                      {b.owner === currentUser.email && (
                        <button className="return" onClick={() => returnBook(b.id)}>
                          Return
                        </button>
                      )}
                      {currentUser.email === "admin@gmail.com" && (
                        <button className="delete" onClick={() => deleteBook(b.id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default App;