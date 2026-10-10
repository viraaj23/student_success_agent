const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function freshTasks() {
  return [
    { id: 1,  title: "DSA assignment",        type: "academic", day: 0, status: "done" },
    { id: 2,  title: "Learn React (1 hr)",    type: "skill",    day: 0, status: "pending" },
    { id: 3,  title: "DBMS lab record",       type: "academic", day: 1, status: "pending" },
    { id: 4,  title: "Apply to 2 internships", type: "career",  day: 1, status: "pending" },
    { id: 5,  title: "Maths revision",        type: "academic", day: 2, status: "pending" },
    { id: 6,  title: "JavaScript practice",   type: "skill",    day: 2, status: "pending" },
    { id: 7,  title: "Update resume",         type: "career",   day: 3, status: "pending" },
    { id: 8,  title: "SQL basics (1 hr)",     type: "skill",    day: 3, status: "pending" },
    { id: 9,  title: "Mini project work",     type: "academic", day: 4, status: "pending" },
    { id: 10, title: "Git practice",          type: "skill",    day: 5, status: "pending" },
    { id: 11, title: "Weekly review",         type: "career",   day: 6, status: "pending" },
  ];
}

let tasks = freshTasks();
let today = 2; // Wednesday (change with the dropdown)
let logs = ["Agent ready. Press 'Run Agent & Re-plan' to start."];

const todaySelect = document.getElementById("today");
days.forEach((d, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = d;
  if (i === today) opt.selected = true;
  todaySelect.appendChild(opt);
});

function render() {
  // Stats
  const total = tasks.length;
  const done = tasks.filter(t => t.status === "done").length;
  const missed = tasks.filter(t => t.status === "missed").length;
  const pct = Math.round((done / total) * 100);
  document.getElementById("stats").innerHTML = `
    <div class="stat"><div class="num">${total}</div><div class="label">Total tasks</div></div>
    <div class="stat"><div class="num">${done}</div><div class="label">Completed</div></div>
    <div class="stat"><div class="num">${missed}</div><div class="label">Missed</div></div>
    <div class="stat"><div class="num">${pct}%</div><div class="label">Week progress</div></div>`;

  // Board
  const board = document.getElementById("board");
  board.innerHTML = "";
  days.forEach((d, i) => {
    const col = document.createElement("div");
    col.className = "day" + (i === today ? " today" : "") + (i < today ? " past" : "");
    const dayTasks = tasks.filter(t => t.day === i);
    col.innerHTML = `<h4><span>${d}</span><span>${i === today ? "Today" : dayTasks.length}</span></h4>`;
    dayTasks.forEach(t => {
      const el = document.createElement("div");
      el.className = `ptask ${t.type} ${t.status === "done" ? "done" : ""} ${t.status === "missed" ? "missed" : ""} ${t.moved ? "moved" : ""}`;
      el.dataset.id = t.id;
      el.innerHTML = `${t.title}${t.status === "missed" ? "<small>❌ Missed</small>" : t.moved ? "<small>↪ Re-planned</small>" : ""}`;
      col.appendChild(el);
    });
    board.appendChild(col);
  });

  // Log
  document.getElementById("log").innerHTML = logs
    .map(l => `<li><span>${l}</span></li>`)
    .join("");
}

// Click a task to tick / untick it
document.getElementById("board").addEventListener("click", e => {
  const el = e.target.closest(".ptask");
  if (!el) return;
  const t = tasks.find(x => x.id === Number(el.dataset.id));
  t.status = t.status === "done" ? "pending" : "done";
  t.moved = false;
  render();
});

// ---------- The agent: Observe -> Reason -> Act -> Evaluate ----------
function runAgent() {
  logs = [];

  // 1. OBSERVE: find pending tasks on days that already passed
  const overdue = tasks.filter(t => t.status !== "done" && t.day < today);
  logs.push(`👀 Observe: checked the week. ${overdue.length} task(s) missed before ${days[today]}.`);

  if (overdue.length === 0) {
    logs.push("✅ Evaluate: everything is on track. No re-planning needed.");
    render();
    return;
  }

  overdue.forEach(t => (t.status = "missed"));

  // 2. REASON: put academics first, then skills, then career
  const order = { academic: 0, skill: 1, career: 2 };
  overdue.sort((a, b) => order[a.type] - order[b.type]);
  logs.push("🧠 Reason: academic work first, then skills, then career tasks.");

  // 3. ACT: move each missed task to the lightest day from today onwards
  overdue.forEach(t => {
    let best = today;
    let bestLoad = Infinity;
    for (let d = today; d < 7; d++) {
      const load = tasks.filter(x => x.day === d && x.status !== "done").length;
      if (load < bestLoad) { bestLoad = load; best = d; }
    }
    const from = days[t.day];
    t.day = best;
    t.status = "pending";
    t.moved = true;
    logs.push(`🔧 Act: moved "${t.title}" from ${from} to ${days[best]}.`);
  });

  // 4. EVALUATE
  const left = tasks.filter(t => t.status !== "done").length;
  logs.push(`📊 Evaluate: ${left} task(s) left, spread over ${days[today]}–${days[6]}. Plan updated.`);
  render();
}

document.getElementById("runBtn").onclick = runAgent;

document.getElementById("resetBtn").onclick = () => {
  tasks = freshTasks();
  logs = ["Demo reset."];
  render();
};

todaySelect.onchange = () => {
  today = Number(todaySelect.value);
  logs = [`Today changed to ${days[today]}.`];
  render();
};

render();