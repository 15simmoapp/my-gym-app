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
    `;

    container.appendChild(div);
  });

  container.innerHTML += `
    <h3>Stance Guide</h3>
    <p>${workout.stanceGuide}</p>
  `;
}
