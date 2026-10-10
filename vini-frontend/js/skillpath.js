// ---------- Dummy data (later this comes from the backend) ----------
const mySkills = {
  HTML: 80, CSS: 70, JavaScript: 45, Python: 60,
  React: 15, Git: 50, SQL: 30, "Node.js": 10, DSA: 40,
};

const roles = {
  "Frontend Developer": { HTML: 90, CSS: 85, JavaScript: 80, React: 70, Git: 60 },
  "Backend Developer":  { Python: 75, "Node.js": 70, SQL: 70, Git: 60, DSA: 60 },
  "Data Analyst":       { Python: 80, SQL: 80, DSA: 50, Git: 40 },
};

const done = {}; // remembers ticked roadmap steps: "Role|Skill" -> true

const roleSelect = document.getElementById("role");
Object.keys(roles).forEach(r => {
  const opt = document.createElement("option");
  opt.value = r;
  opt.textContent = r;
  roleSelect.appendChild(opt);
});

function render() {
  const role = roleSelect.value;
  const required = roles[role];

  // Skills vs required
  document.getElementById("skills").innerHTML = Object.entries(required).map(([skill, need]) => {
    const have = mySkills[skill] || 0;
    return `
      <div class="skill-row">
        <div class="top"><span>${skill}</span><span class="muted">${have}% / ${need}%</span></div>
        <div class="bar">
          <div class="bar-fill ${have >= need ? "ok" : ""}" style="width:${have}%"></div>
          <div class="bar-target" style="left:${need}%"></div>
        </div>
      </div>`;
  }).join("");

  // Gaps (biggest first)
  const gaps = Object.entries(required)
    .map(([skill, need]) => ({ skill, have: mySkills[skill] || 0, need, gap: need - (mySkills[skill] || 0) }))
    .filter(g => g.gap > 0)
    .sort((a, b) => b.gap - a.gap);

  document.getElementById("gaps").innerHTML = gaps.length
    ? gaps.map(g => {
        const level = g.gap >= 40 ? "danger" : g.gap >= 20 ? "warning" : "success";
        return `<li><span>${g.skill}</span><span class="tag ${level}">-${g.gap}%</span></li>`;
      }).join("")
    : `<li><span>No gaps. You're ready for this role! 🎉</span></li>`;

  // Roadmap
  const ul = document.getElementById("roadmap");
  ul.innerHTML = "";
  gaps.forEach(g => {
    const key = role + "|" + g.skill;
    const weeks = Math.ceil(g.gap / 15);
    const li = document.createElement("li");
    li.className = "clickable" + (done[key] ? " done" : "");
    li.innerHTML = `
      <span>${done[key] ? "✅" : "⬜"} Learn ${g.skill}: ${g.have}% → ${g.need}%</span>
      <span class="tag">~${weeks} wk</span>`;
    li.onclick = () => { done[key] = !done[key]; render(); };
    ul.appendChild(li);
  });

  const total = gaps.length;
  const finished = gaps.filter(g => done[role + "|" + g.skill]).length;
  const pct = total ? Math.round((finished / total) * 100) : 100;
  document.getElementById("roadmapBar").style.width = pct + "%";
  document.getElementById("roadmapText").textContent = `${finished}/${total} steps done`;
}

roleSelect.onchange = render;
render();