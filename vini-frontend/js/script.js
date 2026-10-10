const data = {
  stats: [
    { num: "5",   label: "Tasks today" },
    { num: "3",   label: "Deadlines this week" },
    { num: "72%", label: "Weekly progress" },
    { num: "8",   label: "Internship matches" },
  ],
  tasks: [
    { text: "Finish DSA assignment",      tag: "Academics", done: true },
    { text: "Learn React basics (1 hr)",  tag: "SkillPath", done: false },
    { text: "Apply to 2 internships",     tag: "Career",    done: false },
  ],
  deadlines: [
    { text: "DBMS Lab Record",     tag: "Tomorrow", level: "danger" },
    { text: "Maths Internal Test", tag: "3 days",   level: "warning" },
    { text: "Mini Project Review", tag: "6 days",   level: "success" },
  ],
  agent: [
    { text: "Observed: you missed 2 tasks yesterday",                  tag: "Observe", level: "warning" },
    { text: "Re-planned your week: moved React practice to Friday",    tag: "Re-plan", level: "success" },
    { text: "Found 3 new internships matching your skills",            tag: "Act",     level: "success" },
  ],
};

function renderList(id, items) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map(i => `
    <li class="${i.done ? 'done' : ''}">
      <span>${i.text}</span>
      <span class="tag ${i.level || ''}">${i.tag}</span>
    </li>`).join("");
}

const statsEl = document.getElementById("stats");
if (statsEl) {
  statsEl.innerHTML = data.stats.map(s => `
    <div class="stat">
      <div class="num">${s.num}</div>
      <div class="label">${s.label}</div>
    </div>`).join("");
}

renderList("tasks", data.tasks);
renderList("deadlines", data.deadlines);
renderList("agent", data.agent);