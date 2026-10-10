// ---------- Timetable (dummy data) ----------
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const times = ["9:00", "10:00", "11:00", "12:00", "2:00", "3:00"];
const slots = {
  Mon: ["DSA", "Maths", "DBMS", "Free", "DBMS Lab", "DBMS Lab"],
  Tue: ["OS", "DSA", "Maths", "Free", "DSA Lab", "DSA Lab"],
  Wed: ["DBMS", "OS", "DSA", "Free", "Maths", "Free"],
  Thu: ["Maths", "DBMS", "OS", "Free", "OS Lab", "OS Lab"],
  Fri: ["DSA", "DBMS", "Maths", "Free", "Project", "Project"],
};

function renderTimetable() {
  let html = "<tr><th></th>" + days.map(d => `<th>${d}</th>`).join("") + "</tr>";
  times.forEach((t, i) => {
    html += `<tr><td class="time">${t}</td>`;
    days.forEach(d => {
      const s = slots[d][i];
      const cls = s === "Free" ? "free" : s.includes("Lab") || s === "Project" ? "lab" : "class";
      html += `<td class="${cls}">${s}</td>`;
    });
    html += "</tr>";
  });
  document.getElementById("timetable").innerHTML = html;
}

// ---------- Helpers ----------
function addDays(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}
function daysLeft(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(dateStr + "T00:00:00") - today) / 86400000);
}
function levelFor(n) {
  return n <= 1 ? "danger" : n <= 3 ? "warning" : "success";
}
function labelFor(n) {
  if (n < 0) return "Overdue";
  if (n === 0) return "Today";
  if (n === 1) return "Tomorrow";
  return n + " days";
}

// ---------- Assignments ----------
const assignments = [
  { text: "DBMS Lab Record", due: addDays(1), done: false },
  { text: "Maths Assignment 3", due: addDays(3), done: false },
  { text: "OS Mini Project Report", due: addDays(6), done: false },
];

function renderAssignments() {
  const ul = document.getElementById("assignments");
  ul.innerHTML = "";
  assignments.sort((a, b) => a.due.localeCompare(b.due));
  assignments.forEach(a => {
    const n = daysLeft(a.due);
    const li = document.createElement("li");
    li.className = "clickable" + (a.done ? " done" : "");
    const name = document.createElement("span");
    name.textContent = (a.done ? "✅ " : "⬜ ") + a.text;
    const tag = document.createElement("span");
    tag.className = "tag " + (a.done ? "success" : levelFor(n));
    tag.textContent = a.done ? "Done" : labelFor(n);
    li.append(name, tag);
    li.onclick = () => { a.done = !a.done; renderAssignments(); };
    ul.appendChild(li);
  });
}

document.getElementById("addBtn").onclick = () => {
  const text = document.getElementById("taskName").value.trim();
  const due = document.getElementById("taskDate").value;
  if (!text || !due) return alert("Enter a name and a date");
  assignments.push({ text, due, done: false });
  document.getElementById("taskName").value = "";
  document.getElementById("taskDate").value = "";
  renderAssignments();
};

// ---------- Exams ----------
const exams = [
  { text: "Maths Internal Test", due: addDays(3) },
  { text: "DSA Internal Test", due: addDays(9) },
  { text: "DBMS Internal Test", due: addDays(12) },
];
document.getElementById("exams").innerHTML = exams.map(e => {
  const n = daysLeft(e.due);
  return `<li><span>${e.text}</span><span class="tag ${levelFor(n)}">${labelFor(n)}</span></li>`;
}).join("");

renderTimetable();
renderAssignments();