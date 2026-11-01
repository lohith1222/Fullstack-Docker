import { useCallback, useEffect, useMemo, useState } from "react";
import { medicalCampApi } from "./api.js";

function formatDate(value) {
  if (!value) return "Not set";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
}

function CampForm({ camp, saving, onCancel, onSubmit }) {
  const [values, setValues] = useState({
    campName: camp?.campName || "",
    location: camp?.location || "",
    campDate: camp?.campDate || "",
    doctorCount: camp?.doctorCount ?? "",
  });
  const [formError, setFormError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    const doctorCount = Number(values.doctorCount);
    if (!values.campName.trim() || !values.location.trim()) {
      setFormError("Enter a camp name and location.");
      return;
    }
    if (!Number.isInteger(doctorCount) || doctorCount < 0) {
      setFormError("Enter a whole number of doctors, zero or greater.");
      return;
    }
    setFormError("");
    try {
      await onSubmit({
        campName: values.campName.trim(),
        location: values.location.trim(),
        campDate: values.campDate,
        doctorCount,
      });
    } catch (error) {
      setFormError(error.message);
    }
  }

  return (
    <form className="camp-form" onSubmit={submit}>
      <label>
        Camp name
        <input
          autoFocus
          name="campName"
          value={values.campName}
          onChange={updateField}
          placeholder="e.g. Community Wellness Day"
          required
        />
      </label>
      <label>
        Location
        <input
          name="location"
          value={values.location}
          onChange={updateField}
          placeholder="City, venue, or neighborhood"
          required
        />
      </label>
      <div className="form-row">
        <label>
          Camp date
          <input
            type="date"
            name="campDate"
            value={values.campDate}
            onChange={updateField}
            required
          />
        </label>
        <label>
          Doctors
          <input
            type="number"
            name="doctorCount"
            min="0"
            step="1"
            value={values.doctorCount}
            onChange={updateField}
            required
          />
        </label>
      </div>
      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}
      <div className="modal-actions">
        <button className="button button-muted" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="button button-primary" type="submit" disabled={saving}>
          {saving ? "Saving..." : camp ? "Save changes" : "Create camp"}
        </button>
      </div>
    </form>
  );
}

function Modal({ title, children, onClose }) {
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">MEDICAL CAMP</p>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function App() {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const loadCamps = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const result = await medicalCampApi.getAll();
      if (!Array.isArray(result)) {
        throw new Error("The API returned an unexpected list of medical camps.");
      }
      setCamps(result);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCamps();
  }, [loadCamps]);

  const filteredCamps = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return camps;
    return camps.filter((camp) =>
      [camp.campName, camp.location, camp.campDate]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [camps, search]);

  const doctorTotal = camps.reduce(
    (total, camp) => total + (Number(camp.doctorCount) || 0),
    0,
  );
  const locationTotal = new Set(
    camps.map((camp) => camp.location?.trim()).filter(Boolean),
  ).size;

  async function saveCamp(values) {
    setSaving(true);
    try {
      if (dialog.type === "edit") {
        const updated = await medicalCampApi.update(dialog.camp.id, values);
        setCamps((current) =>
          current.map((camp) => (camp.id === updated.id ? updated : camp)),
        );
        setMessage({ type: "success", text: "Medical camp updated." });
      } else {
        const created = await medicalCampApi.create(values);
        setCamps((current) => [...current, created]);
        setMessage({ type: "success", text: "Medical camp created." });
      }
      setDialog(null);
    } finally {
      setSaving(false);
    }
  }

  async function showDetails(id) {
    setDialog({ type: "loading-details" });
    try {
      const camp = await medicalCampApi.getById(id);
      setDialog({ type: "view", camp });
    } catch (error) {
      setDialog(null);
      setMessage({ type: "error", text: error.message });
    }
  }

  async function deleteCamp(camp) {
    if (!window.confirm(`Delete "${camp.campName}"? This cannot be undone.`)) {
      return;
    }
    setDeletingId(camp.id);
    try {
      await medicalCampApi.remove(camp.id);
      setCamps((current) => current.filter((item) => item.id !== camp.id));
      setMessage({ type: "success", text: "Medical camp deleted." });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setDeletingId(null);
    }
  }

  function openCreateForm() {
    setMessage(null);
    setDialog({ type: "create" });
  }

  const dialogTitle =
    dialog?.type === "create"
      ? "Create a medical camp"
      : dialog?.type === "edit"
        ? "Edit medical camp"
        : "Camp details";

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#dashboard" aria-label="CarePoint home">
          <span className="brand-mark" aria-hidden="true">
            +
          </span>
          <span>
            <strong>CarePoint</strong>
            <small>COMMUNITY HEALTH</small>
          </span>
        </a>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="active" href="#dashboard">
            Dashboard
          </a>
          <a href="#camps">Medical camps</a>
        </nav>
        <button className="button button-primary topbar-action" onClick={openCreateForm}>
          <span aria-hidden="true">+</span> New camp
        </button>
      </header>

      <main id="dashboard" className="page-content">
        <section className="welcome-row">
          <div>
            <p className="eyebrow">YOUR COMMUNITY, HEALTHIER</p>
            <h1>Medical camp dashboard</h1>
            <p className="welcome-copy">
              Organize care, connect communities, and make every camp count.
            </p>
          </div>
          <button className="button button-primary hero-action" onClick={openCreateForm}>
            <span aria-hidden="true">+</span> Create medical camp
          </button>
        </section>

        <section className="stats-grid" aria-label="Medical camp summary">
          <article className="stat-card">
            <div className="stat-icon stat-icon-green" aria-hidden="true">
              C
            </div>
            <div>
              <p>Total camps</p>
              <strong>{camps.length}</strong>
            </div>
            <span className="stat-caption">in your program</span>
          </article>
          <article className="stat-card">
            <div className="stat-icon stat-icon-blue" aria-hidden="true">
              +
            </div>
            <div>
              <p>Doctors involved</p>
              <strong>{doctorTotal}</strong>
            </div>
            <span className="stat-caption">across all camps</span>
          </article>
          <article className="stat-card">
            <div className="stat-icon stat-icon-amber" aria-hidden="true">
              L
            </div>
            <div>
              <p>Locations reached</p>
              <strong>{locationTotal}</strong>
            </div>
            <span className="stat-caption">communities served</span>
          </article>
        </section>

        <section id="camps" className="camps-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">OVERVIEW</p>
              <h2>All medical camps</h2>
              <p className="panel-subtitle">
                Review and manage your upcoming and past camps.
              </p>
            </div>
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                placeholder="Search camps..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search medical camps"
              />
            </label>
          </div>

          {message && (
            <div
              className={`notice notice-${message.type}`}
              role={message.type === "error" ? "alert" : "status"}
            >
              <span>{message.text}</span>
              <button
                type="button"
                className="notice-close"
                onClick={() => setMessage(null)}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          {loadError && (
            <div className="load-error" role="alert">
              <div>
                <strong>We couldn&apos;t load your camps.</strong>
                <p>{loadError}</p>
              </div>
              <button className="button button-muted" onClick={loadCamps}>
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-state" role="status">
              <span className="spinner" />
              <span>Loading medical camps...</span>
            </div>
          ) : !loadError && filteredCamps.length === 0 ? (
            <div className="empty-state">
              <div className="empty-mark" aria-hidden="true">
                +
              </div>
              <h3>{search ? "No camps match your search" : "Your first camp starts here"}</h3>
              <p>
                {search
                  ? "Try another name, location, or date."
                  : "Create a medical camp to start planning care for your community."}
              </p>
              {!search && (
                <button className="button button-primary" onClick={openCreateForm}>
                  Create medical camp
                </button>
              )}
            </div>
          ) : (
            !loadError && (
              <div className="camp-list">
                {filteredCamps.map((camp) => (
                  <article className="camp-row" key={camp.id}>
                    <div className="camp-avatar" aria-hidden="true">
                      {(camp.campName || "M").trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="camp-main">
                      <h3>{camp.campName}</h3>
                      <p>{camp.location}</p>
                    </div>
                    <div className="camp-meta">
                      <span className="meta-label">DATE</span>
                      <span>{formatDate(camp.campDate)}</span>
                    </div>
                    <div className="camp-meta doctors-meta">
                      <span className="meta-label">DOCTORS</span>
                      <span>{camp.doctorCount ?? 0}</span>
                    </div>
                    <div className="camp-actions" aria-label={`Actions for ${camp.campName}`}>
                      <button
                        type="button"
                        onClick={() => showDetails(camp.id)}
                        aria-label={`View ${camp.campName}`}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMessage(null);
                          setDialog({ type: "edit", camp });
                        }}
                        aria-label={`Edit ${camp.campName}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="delete-action"
                        onClick={() => deleteCamp(camp)}
                        disabled={deletingId === camp.id}
                        aria-label={`Delete ${camp.campName}`}
                      >
                        {deletingId === camp.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )
          )}
          {!loading && !loadError && filteredCamps.length > 0 && (
            <div className="list-footer">
              Showing {filteredCamps.length} of {camps.length}{" "}
              {camps.length === 1 ? "camp" : "camps"}
            </div>
          )}
        </section>
        <footer className="page-footer">
          <span>CarePoint</span> · Bringing community care closer.
        </footer>
      </main>

      {dialog?.type === "create" || dialog?.type === "edit" ? (
        <Modal title={dialogTitle} onClose={() => !saving && setDialog(null)}>
          <CampForm
            key={dialog.camp?.id ?? "new-camp"}
            camp={dialog.camp}
            saving={saving}
            onCancel={() => !saving && setDialog(null)}
            onSubmit={saveCamp}
          />
        </Modal>
      ) : dialog?.type === "view" ? (
        <Modal title={dialogTitle} onClose={() => setDialog(null)}>
          <div className="detail-list">
            <div>
              <span>Camp name</span>
              <strong>{dialog.camp.campName}</strong>
            </div>
            <div>
              <span>Location</span>
              <strong>{dialog.camp.location}</strong>
            </div>
            <div>
              <span>Camp date</span>
              <strong>{formatDate(dialog.camp.campDate)}</strong>
            </div>
            <div>
              <span>Doctors</span>
              <strong>{dialog.camp.doctorCount ?? 0}</strong>
            </div>
          </div>
          <div className="modal-actions">
            <button
              className="button button-muted"
              onClick={() => setDialog({ type: "edit", camp: dialog.camp })}
            >
              Edit camp
            </button>
            <button className="button button-primary" onClick={() => setDialog(null)}>
              Done
            </button>
          </div>
        </Modal>
      ) : dialog?.type === "loading-details" ? (
        <Modal title="Camp details" onClose={() => setDialog(null)}>
          <div className="loading-state detail-loading" role="status">
            <span className="spinner" />
            <span>Loading camp details...</span>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export default App;
