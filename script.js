// -------------------------------
// JSON LOADERS
// -------------------------------

async function loadExercises() {
  const res = await fetch('data/exercises.json');
  return await res.json();
}

async function loadWorkouts() {
  const res = await fetch('data/workouts.json');
  return await res.json();
}

async function loadBlocks() {
  const res = await fetch('data/blocks.json');
  return await res.json();
}

// -------------------------------
// APP START
// -------------------------------

async function startApp() {
  const exercises = await loadExercises();
  const workouts = await loadWorkouts();
  const blocks = await loadBlocks();

  console.log("Exercises loaded:", exercises);
  console.log("Workouts loaded:", workouts);
  console.log("Blocks loaded:", blocks);

  showBlockSelector(blocks);
}

// -------------------------------
// BLOCK SELECTOR
// -------------------------------

function showBlockSelector(blocks) {
  const container = document.getElementById("blockSelector");
  container.innerHTML = "<h2>Select a 12-Week Block</h2>";

  Object.keys(blocks.blocks).forEach(blockName => {
    const btn = document.createElement("button");
    btn.textContent = blocks.blocks[blockName].focus;
    btn.onclick = () => selectBlock(blockName, blocks);
    container.appendChild(btn);
  });
}

function selectBlock(blockName, blocks) {
  localStorage.setItem("currentBlock", blockName);
  localStorage.setItem("currentWeek", 1);

  document.getElementById("blockSelector").innerHTML =
    `<h3>Block Selected: ${blocks.blocks[blockName].focus}</h3>`;

  showWorkoutSelector();
}

// -------------------------------
// WORKOUT SELECTOR
// -------------------------------

async function showWorkoutSelector() {
  const workouts = await loadWorkouts();
  const container = document.getElementById("workoutSelector");

  container.innerHTML = "<h2>Select Workout</h2>";

  Object.keys(workouts.workouts).forEach(day => {
    const btn = document.createElement("button");
    btn.textContent = day.toUpperCase();
    btn.onclick = () => loadWorkout(day);
    container.appendChild(btn);
  });
}

// -------------------------------
// LOAD WORKOUT (FULL STEP 4 + 5 VERSION)
// -------------------------------

async function loadWorkout(day) {
  const workouts = await loadWorkouts();
  const exercisesData = await loadExercises();
  const blocks = await loadBlocks();

  const workout = workouts.workouts[day];
  const currentBlock = localStorage.getItem("currentBlock");
  const currentWeek = localStorage.getItem("currentWeek");

  const blockWeekData = blocks.blocks[currentBlock].weeks[currentWeek - 1];

  const container = document.getElementById("sessionDisplay");
  container.innerHTML = `
    <h2>${day.toUpperCase()} Workout</h2>
    <p><strong>Week ${currentWeek} Rep Scheme:</strong> ${blockWeekData.repScheme || "Deload"}</p>
    <p><strong>Progression:</strong> ${blockWeekData.progression || "Take it easy"}</p>

    <h3>Warm-Up</h3>
    <ul>${workout.warmup.map(w => `<li>${w}</li>`).join("")}</ul>

    <h3>Exercises</h3>
  `;

  workout.order.forEach(exName => {
    const ex = exercisesData.exercises.find(e => e.name === exName);

    const div = document.createElement("div");
    div.className = "exerciseCard";

    div.innerHTML = `
      <h4>${ex.name}</h4>
      <p><strong>Muscles:</strong> ${ex.muscles.join(", ")}</p>
      <p><strong>Cues:</strong> ${ex.cues.join(", ")}</p>
      <p><strong>Progression:</strong> ${ex.progression}</p>
      ${ex.gif ? `<img src="${ex.gif}" class="exerciseGif">` : ""}

      <div class="logArea">
        <input type="number" id="w_${ex.name}" placeholder="Weight (kg)">
        <input type="number" id="r_${ex.name}" placeholder="Reps">
        <input type="number" id="p_${ex.name}" placeholder="RPE">
        <button onclick="logSet('${ex.name}')">Log Set</button>
      </div>

      <div id="last_${ex.name}" class="lastSet"></div>
    `;

    container.appendChild(div);
    showLastSet(exName);
  });

  container.innerHTML += `
    <h3>Stance Guide</h3>
    <p>${workout.stanceGuide}</p>

    <button onclick="markWorkoutComplete('${day}')">Mark Workout Complete</button>
  `;
}

// -------------------------------
// LOGGING SETS
// -------------------------------

function logSet(exName) {
  const weight = document.getElementById(`w_${exName}`).value;
  const reps = document.getElementById(`r_${exName}`).value;
  const rpe = document.getElementById(`p_${exName}`).value;

  if (!weight || !reps || !rpe) return alert("Enter weight, reps, and RPE");

  const history = JSON.parse(localStorage.getItem("trainingHistory")) || {};

  history[exName] = {
    weight: Number(weight),
    reps: Number(reps),
    rpe: Number(rpe),
    date: new Date().toISOString()
  };

  localStorage.setItem("trainingHistory", JSON.stringify(history));

  updatePB(exName, Number(weight), Number(reps));
  showLastSet(exName);
}

// -------------------------------
// SHOW LAST SET
// -------------------------------

function showLastSet(exName) {
  const history = JSON.parse(localStorage.getItem("trainingHistory")) || {};
  const last = history[exName];

  const container = document.getElementById(`last_${exName}`);

  if (!last) {
    container.innerHTML = "<em>No previous set logged.</em>";
    return;
  }

  container.innerHTML = `
    <strong>Last Set:</strong> ${last.weight}kg × ${last.reps} (RPE ${last.rpe})
  `;
}

// -------------------------------
// PB TRACKING
// -------------------------------

function updatePB(exName, weight, reps) {
  const pbData = JSON.parse(localStorage.getItem("pbData")) || {};

  const volume = weight * reps;

  if (!pbData[exName] || volume > pbData[exName].volume) {
    pbData[exName] = { weight, reps, volume };
    localStorage.setItem("pbData", JSON.stringify(pbData));
  }
}

// -------------------------------
// WEEKLY COMPLETION
// -------------------------------

function markWorkoutComplete(day) {
  const week = localStorage.getItem("currentWeek");
  const block = localStorage.getItem("currentBlock");

  const key = "weeklyCompletion";
  const data = JSON.parse(localStorage.getItem(key)) || {};

  if (!data[block]) data[block] = {};
  if (!data[block][week]) data[block][week] = [];

  if (!data[block][week].includes(day)) {
    data[block][week].push(day);
  }

  localStorage.setItem(key, JSON.stringify(data));

  alert(`${day.toUpperCase()} marked complete for Week ${week}`);
}

// -------------------------------
// START APP
// -------------------------------

startApp();
