
import { useEffect, useState } from "react";
import Auth from "./Auth";
import "./App.css";

const API = "http://localhost:8080/api/complaints";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("collegeLoggedInUser") || "null"
      );
    } catch {
      return null;
    }
  });

  function handleLogin(loggedInUser) {
    localStorage.setItem(
      "collegeLoggedInUser",
      JSON.stringify(loggedInUser)
    );
    setUser(loggedInUser);
  }

  function handleLogout() {
    localStorage.removeItem("collegeLoggedInUser");
    setUser(null);
  }

  if (!user) return <Auth onLogin={handleLogin} />;

  return <Dashboard user={user} onLogout={handleLogout} />;
}

function Dashboard({ user, onLogout }) {
  const [complaints, setComplaints] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Facilities");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadComplaints() {
    try {
      const response = await fetch(
        `${API}/email?email=${encodeURIComponent(user.email)}`
      );

      if (!response.ok) {
        throw new Error("Could not load complaints.");
      }

      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      setNotice(
        "Cannot load complaints. Check that Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComplaints();
    // Load complaints when the logged-in email changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.email]);

  const myComplaints = complaints;

  const filteredComplaints = myComplaints.filter((c) => {
    const text = search.toLowerCase();

    const matchesSearch =
      (c.title || "").toLowerCase().includes(text) ||
      (c.department || "").toLowerCase().includes(text) ||
      (c.category || "").toLowerCase().includes(text);

    const status = (c.status || "Pending").replace("_", " ");
    const matchesStatus = filter === "All" || status === filter;

    return matchesSearch && matchesStatus;
  });

  async function submitComplaint(e) {
    e.preventDefault();
    setSaving(true);
    setNotice("");

    const payload = {
      studentName: user.name || "Student",
      email: user.email,
      title: title.trim(),
      category,
      department: department.trim(),
      description: description.trim(),
    };

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Complaint submission failed.");
      }

      await response.json();
      setTitle("");
      setCategory("Facilities");
      setDepartment("");
      setDescription("");
      setShowForm(false);
      setNotice("Complaint submitted and saved successfully.");
      await loadComplaints();
    } catch (error) {
      setNotice(error.message || "Could not submit complaint.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteComplaint(id) {
    if (!window.confirm("Are you sure you want to delete this complaint?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Could not delete complaint.");

      setComplaints((previous) =>
        previous.filter((c) => c.id !== id)
      );
      setNotice("Complaint deleted.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  const statusOf = (c) =>
    (c.status || "Pending").replace("_", " ");

  const pendingCount = myComplaints.filter(
    (c) => statusOf(c).toLowerCase() === "pending"
  ).length;

  const progressCount = myComplaints.filter(
    (c) => statusOf(c).toLowerCase() === "in progress"
  ).length;

  const resolvedCount = myComplaints.filter(
    (c) => statusOf(c).toLowerCase() === "resolved"
  ).length;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">CMS</div>
          <div>
            <h2>College</h2>
            <p>Management System</p>
          </div>
        </div>

        <nav className="navigation">
          <a href="#dashboard" className="nav-link active">
            <span>▦</span> Dashboard
          </a>
          <a href="#complaints" className="nav-link">
            <span>▤</span> My Complaints
          </a>
          <a href="#submit" className="nav-link"
             onClick={() => setShowForm(true)}>
            <span>＋</span> Submit Complaint
          </a>
        </nav>

        <div className="sidebar-bottom">
          <p>Student Portal</p>
          <small>College Complaint Management</small>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <h1>College Management System</h1>
            <p>Manage and track your college complaints.</p>
          </div>

          <div className="user-area">
            <div className="avatar">
              {(user.name || user.email || "S")
                .charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <strong>{user.name || "Student"}</strong>
              <small>{user.email}</small>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="welcome-section">
          <div>
            <h2>Welcome, {user.name || "Student"}! 👋</h2>
            <p>Here is an overview of your complaints.</p>
          </div>
          <button className="primary-btn"
            onClick={() => setShowForm(!showForm)}>
            + New Complaint
          </button>
        </section>

        {notice && <div className="notice" role="status">{notice}</div>}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">▤</div>
            <p>Total Complaints</p>
            <h2>{myComplaints.length}</h2>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange">◷</div>
            <p>Pending</p>
            <h2>{pendingCount}</h2>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple">↻</div>
            <p>In Progress</p>
            <h2>{progressCount}</h2>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <p>Resolved</p>
            <h2>{resolvedCount}</h2>
          </div>
        </section>

        {showForm && (
          <section className="panel" id="submit">
            <div className="section-heading">
              <div>
                <h2>Submit a Complaint</h2>
                <p>Describe the issue you want the college to address.</p>
              </div>
              <button type="button" className="close-btn"
                onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={submitComplaint} className="complaint-form">
              <div className="form-field">
                <label>Complaint Title *</label>
                <input value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a short title"
                  required maxLength={100} />
              </div>

              <div className="form-field">
                <label>Category *</label>
                <select value={category}
                  onChange={(e) => setCategory(e.target.value)}>
                  <option>Facilities</option>
                  <option>Academics</option>
                  <option>Internet</option>
                  <option>Library</option>
                  <option>Hostel</option>
                  <option>Transport</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-field full-width">
                <label>Department or Location *</label>
                <input value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. ECE Department or Library"
                  required maxLength={100} />
              </div>

              <div className="form-field full-width">
                <label>Description *</label>
                <textarea value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain your complaint..."
                  rows="4" required maxLength={2000} />
              </div>

              <div className="form-actions full-width">
                <button type="button" className="secondary-btn"
                  onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn"
                  disabled={saving}>
                  {saving ? "Submitting..." : "Submit Complaint"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="panel" id="complaints">
          <div className="section-heading">
            <div>
              <h2>My Complaints</h2>
              <p>Review and track your submitted issues.</p>
            </div>
            <button className="secondary-btn" onClick={loadComplaints}>
              Refresh
            </button>
          </div>

          <div className="toolbar">
            <input className="search-input" type="search"
              placeholder="Search complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)} />

            <select className="filter-select" value={filter}
              onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <p>Loading complaints...</p>
          ) : filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">▤</div>
              <h3>No complaints found</h3>
              <p>Submit a complaint or try changing your search.</p>
              <button className="primary-btn"
                onClick={() => setShowForm(true)}>
                + Submit Complaint
              </button>
            </div>
          ) : (
            <div className="complaint-list">
              {filteredComplaints.map((complaint) => {
                const status = statusOf(complaint);
                const normalized = status.toLowerCase();

                return (
                  <article className="complaint-card" key={complaint.id}>
                    <div className="complaint-main">
                      <div className="complaint-symbol">▤</div>
                      <div className="complaint-info">
                        <h3>{complaint.title}</h3>
                        <p>{complaint.description}</p>
                        <div className="complaint-meta">
                          <span>{complaint.category}</span>
                          <span>{complaint.department}</span>
                          <span>
                            {complaint.createdAt
                              ? new Date(complaint.createdAt)
                                  .toLocaleDateString()
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="complaint-controls">
                      <span className={`status-badge ${
                        normalized === "resolved"
                          ? "status-resolved"
                          : normalized === "in progress"
                          ? "status-progress"
                          : "status-pending"
                      }`}>
                        {status}
                      </span>
                      <button className="delete-btn"
                        onClick={() => deleteComplaint(complaint.id)}>
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className="footer">
          College Management System · Student Complaint Portal
        </footer>
      </main>
    </div>
  );
}

export default App;