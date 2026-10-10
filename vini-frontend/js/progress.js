// ---------- Dummy data (later this comes from the backend) ----------
const week = [
  { day: "Mon", done: 4, missed: 0 },
  { day: "Tue", done: 3, missed: 2 },
  { day: "Wed", done: 5, missed: 1 },
  { day: "Thu", done: 2, missed: 3 },
  { day: "Fri", done: 4, missed: 1 },
  { day: "Sat", done: 3, missed: 0 },
  { day: "Sun", done: 2, missed: 1 },
];

const skills = [
  { name: "JavaScript", before: 30, now: 45 },
  { name: "React",      before: 5,  now: 15 },
  { name: "SQL",        before: 15, now: 30 },
  { name: "Git",        before: 40, now: 50 },
  { name: "DSA",        before: 35, now: 40 },
];

const pipeline = [
  { stage: "Matched by agent", count: 8, level: "" },
  { stage: "Saved",            count: 5, level: "warning" },
  { stage: "Applied",          count: 3, level: "success" },
  { stage: "Interview",        count: 1, level: "success" },
];

// ---------- Numbers ----------
const totalDone = week.reduce((s, d) => s + d.done, 0);
const totalMissed = week.reduce((s, d) => s + d.missed, 0);
const rate = Math.round((totalDone / (totalDone + totalMissed)) * 100);
const improved = skills.filter(s => s.now > s.before).length;
const applied = pipeline.find(p => p.stage === "Applied").count;

document.getElementById("stats").innerHTML = `
  <div class="stat"><div class="num">${totalDone}</div><div class="label">Tasks completed</div></div>
  <div class="stat"><div class="num">${rate}%</div><div class="label">Completion rate</div></div>
  <div class="stat"><div class="num">${improved}</div><div class="label">Skills improved</div></div>
  <div class="stat"><div class="num">${applied}</div><div class="label">Applications sent</div></div>`;

// ---------- Bar chart ----------
const maxTasks = Math.max(...week.map(d => d.done + d.missed));
document.getElementById("chart").innerHTML = week.map(d => `
  <div class="col" title="${d.day}: ${d.done} done, ${d.missed} missed">
    <div class="stack">
      <div class="seg missed" style="height:${(d.missed / maxTasks) * 100}%"></div>
      <div class="seg done" style="height:${(d.done / maxTasks) * 100}%"></div>
    </div>
    <span>${d.day}</span>
  </div>`).join("");

// ---------- Skill growth ----------
document.getElementById("skills").innerHTML = skills.map(s => `
  <div class="skill-row">
    <div class="top">
      <span>${s.name}</span>
      <span class="muted">${s.before}% → ${s.now}% (+${s.now - s.before})</span>
    </div>
    <div class="bar">
      <div class="bar-fill" style="width:${s.now}%"></div>
      <div class="bar-target" style="left:${s.before}%"></div>
    </div>
  </div>`).join("");

// ---------- Pipeline ----------
document.getElementById("funnel").innerHTML = pipeline.map(p => `
  <li><span>${p.stage}</span><span class="tag ${p.level}">${p.count}</span></li>`).join("");

// ---------- Agent insights (worked out from the data) ----------
const bestDay = week.reduce((a, b) => (b.done > a.done ? b : a));
const worstDay = week.reduce((a, b) => (b.missed > a.missed ? b : a));
const topSkill = skills.reduce((a, b) => (b.now - b.before > a.now - a.before ? b : a));

const insights = [
  { text: `Most productive day: ${bestDay.day} (${bestDay.done} tasks done)`, tag: "Strength", level: "success" },
  { text: `Most missed tasks: ${worstDay.day} (${worstDay.missed} missed). Keep it lighter`, tag: "Watch", level: "warning" },
  { text: `Fastest growing skill: ${topSkill.name} (+${topSkill.now - topSkill.before}%)`, tag: "Growth", level: "success" },
  { text: rate >= 75 ? "Great consistency. Keep this pace" : "Completion is below 75%. The agent will lighten your plan", tag: rate >= 75 ? "On track" : "Re-plan", level: rate >= 75 ? "success" : "danger" },
];
document.getElementById("insights").innerHTML = insights.map(i => `
  <li><span>${i.text}</span><span class="tag ${i.level}">${i.tag}</span></li>`).join("");