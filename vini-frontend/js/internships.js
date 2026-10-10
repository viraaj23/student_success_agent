// ---------- Dummy data (later this comes from the backend) ----------
const mySkills = {
  HTML: 80, CSS: 70, JavaScript: 45, Python: 60,
  React: 15, Git: 50, SQL: 30, "Node.js": 10, DSA: 40,
};
const HAVE_LEVEL = 40; // a skill counts as "have" at this level or above

const internships = [
  { id: 1, role: "Frontend Intern",       company: "PixelWorks",   mode: "Remote",  location: "Remote",    stipend: "₹15,000/mo", skills: ["HTML", "CSS", "JavaScript", "React"] },
  { id: 2, role: "Web Developer Intern",  company: "CodeNest",     mode: "On-site", location: "Mangaluru", stipend: "₹10,000/mo", skills: ["HTML", "CSS", "JavaScript", "Git"] },
  { id: 3, role: "Python Developer Intern", company: "DataLeaf",   mode: "Remote",  location: "Remote",    stipend: "₹12,000/mo", skills: ["Python", "SQL", "Git"] },
  { id: 4, role: "Backend Intern",        company: "ServerSide",   mode: "On-site", location: "Bengaluru", stipend: "₹20,000/mo", skills: ["Node.js", "SQL", "Git", "DSA"] },
  { id: 5, role: "Data Analyst Intern",   company: "InsightLabs",  mode: "Remote",  location: "Remote",    stipend: "₹8,000/mo",  skills: ["Python", "SQL", "DSA"] },
  { id: 6, role: "UI Developer Intern",   company: "DesignStack",  mode: "On-site", location: "Mysuru",    stipend: "₹12,000/mo", skills: ["HTML", "CSS", "JavaScript"] },
];

const saved = {}; // id -> true

function calcMatch(item) {
  const matched = item.skills.filter(s => (mySkills[s] || 0) >= HAVE_LEVEL).length;
  return Math.round((matched / item.skills.length) * 100);
}

function render() {
  const q = document.getElementById("search").value.toLowerCase().trim();
  const mode = document.getElementById("mode").value;
  const minMatch = Number(document.getElementById("minMatch").value);
  const savedOnly = document.getElementById("savedOnly").checked;

  const list = internships
    .map(i => ({ ...i, match: calcMatch(i) }))
    .filter(i =>
      (i.role + " " + i.company).toLowerCase().includes(q) &&
      (mode === "All" || i.mode === mode) &&
      i.match >= minMatch &&
      (!savedOnly || saved[i.id])
    )
    .sort((a, b) => b.match - a.match);

  document.getElementById("count").textContent = `${list.length} internship(s) found`;

  const grid = document.getElementById("internships");
  grid.innerHTML = "";

  if (list.length === 0) {
    grid.innerHTML = `<p class="muted">No internships match your filters.</p>`;
    return;
  }

  list.forEach(i => {
    const level = i.match >= 75 ? "high" : i.match >= 50 ? "mid" : "low";
    const chips = i.skills.map(s => {
      const has = (mySkills[s] || 0) >= HAVE_LEVEL;
      return `<span class="chip ${has ? "have" : "miss"}">${has ? "✓" : "✗"} ${s}</span>`;
    }).join("");

    const card = document.createElement("div");
    card.className = "intern-card";
    card.innerHTML = `
      <div class="intern-head">
        <div>
          <h4>${i.role}</h4>
          <div class="company">${i.company}</div>
        </div>
        <span class="match ${level}">${i.match}% match</span>
      </div>
      <div class="meta">📍 ${i.location} · ${i.mode} · 💰 ${i.stipend}</div>
      <div class="chips">${chips}</div>
      <div class="card-actions">
        <button class="btn" data-apply="${i.id}">Apply</button>
        <button class="btn ghost ${saved[i.id] ? "saved" : ""}" data-save="${i.id}">
          ${saved[i.id] ? "★ Saved" : "☆ Save"}
        </button>
      </div>`;
    grid.appendChild(card);
  });
}

// Button clicks (Save / Apply)
document.getElementById("internships").addEventListener("click", e => {
  const saveId = e.target.dataset.save;
  const applyId = e.target.dataset.apply;
  if (saveId) {
    saved[saveId] = !saved[saveId];
    render();
  }
  if (applyId) {
    const item = internships.find(i => i.id === Number(applyId));
    alert(`Application link for ${item.role} at ${item.company} will open here once the backend is connected.`);
  }
});

["search", "mode", "minMatch", "savedOnly"].forEach(id => {
  document.getElementById(id).addEventListener("input", render);
});

render();