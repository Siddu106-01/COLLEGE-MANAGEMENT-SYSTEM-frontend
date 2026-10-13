
import { useState } from "react";
import "./App.css";

export default function Auth({ onLogin }) {
  const [page, setPage] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function switchPage(nextPage) {
    setPage(nextPage);
    setName("");
    setEmail("");
    setPassword("");
    setMessage("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    let users = [];

    try {
      users = JSON.parse(
        localStorage.getItem("collegeUsers") || "[]"
      );
    } catch {
      users = [];
    }

    const cleanEmail = email.trim().toLowerCase();

    if (page === "register") {
      if (!name.trim()) {
        setMessage("Please enter your full name.");
        return;
      }

      if (password.length < 6) {
        setMessage("Password must contain at least 6 characters.");
        return;
      }

      const exists = users.some(
        (user) => user.email.toLowerCase() === cleanEmail
      );

      if (exists) {
        setMessage("This email is already registered. Please log in.");
        return;
      }

      const newUser = {
        name: name.trim(),
        email: cleanEmail,
        password,
      };

      users.push(newUser);
      localStorage.setItem("collegeUsers", JSON.stringify(users));

      onLogin({
        name: newUser.name,
        email: newUser.email,
      });

      return;
    }

    const existingUser = users.find(
      (user) =>
        user.email.toLowerCase() === cleanEmail &&
        user.password === password
    );

    if (!existingUser) {
      setMessage("Incorrect email or password.");
      return;
    }

    onLogin({
      name: existingUser.name,
      email: existingUser.email,
    });
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">CMS</div>

        <h1>College Management System</h1>

        <p className="auth-subtitle">
          {page === "login"
            ? "Welcome back! Log in to continue."
            : "Create your student account."}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={page === "login" ? "active" : ""}
            onClick={() => switchPage("login")}
          >
            Login
          </button>

          <button
            type="button"
            className={page === "register" ? "active" : ""}
            onClick={() => switchPage("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {page === "register" && (
            <div className="auth-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>

          {message && (
            <p className="auth-message" role="alert">
              {message}
            </p>
          )}

          <button className="auth-submit" type="submit">
            {page === "login" ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          {page === "login"
            ? "Don't have an account? "
            : "Already have an account? "}

          <button
            type="button"
            onClick={() =>
              switchPage(page === "login" ? "register" : "login")
            }
          >
            {page === "login" ? "Register" : "Login"}
          </button>
        </p>

        <p className="auth-note">
          Student demonstration portal
        </p>
      </div>
    </div>
  );
}