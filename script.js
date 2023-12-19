let cloudCount = 0;
let input = document.getElementById("todo-input");
let taskTitle = input.value.trim();

function createConfettiParticle(position) {
  const confetti = document.createElement('div');
  confetti.className = 'confetti';

  // Set horizontal position based on the position argument
  switch (position) {
      case 'left':
          confetti.style.left = '20%'; // Left side
          break;
      case 'center':
          confetti.style.left = '50%'; // Center
          break;
      case 'right':
          confetti.style.left = '80%'; // Right side
          break;
      default:
          confetti.style.left = '50%'; // Default to center if no position is specified
  }

  confetti.style.bottom = '0px'; // Start from the bottom
  confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
  confetti.style.setProperty('--random', Math.random());

  // Randomize animation properties
  confetti.style.animationDuration = (Math.random() * 1 + 0.2) + 's'; // Duration between 2 to 5 seconds
  confetti.style.animationDelay = -(Math.random() * 2) + 's'; // Start at different times

  // Assign a random shape to each confetti piece
  const shapes = ['triangle', 'circle', '']; // Empty string for square
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
  if (randomShape) {
      confetti.classList.add(randomShape);
  }

  document.body.appendChild(confetti);
  setTimeout(() => confetti.remove(), 2000); // Remove after animation
}

function triggerConfettiEffect() {
  for (let i = 0; i < 200; i++) {
      createConfettiParticle('left'); // Left side explosion
      createConfettiParticle('center'); // Center explosion
      createConfettiParticle('right'); // Right side explosion
  }
}

function updateBackground() {
    const cloudContainer = document.body;
    const cloudImage = `url("cloud.svg")`; // Ensure this path is correct
    let clouds = [];
    let cloudSizes = [];  // Array to hold individual sizes for each cloud

    for (let i = 0; i < cloudCount; i++) {
        let xPos = Math.random() * 100; // Random horizontal position
        let yPos = Math.random() * 100; // Random vertical position
        clouds.push(`${cloudImage} ${xPos}% ${yPos}% no-repeat`);
        cloudSizes.push("100px 100px");  // Size for each cloud
    }

    const existingBackgroundImage = cloudContainer.classList.contains('dark-mode') 
                                    ? 'url("dark_bkg.svg")' 
                                    : 'url("light_bkg.svg")';

    cloudContainer.style.background = clouds.length > 0 
        ? `${clouds.join(", ")}, ${existingBackgroundImage}` 
        : existingBackgroundImage;

    cloudContainer.style.backgroundSize = clouds.length > 0 
        ? `${cloudSizes.join(", ")}, cover` 
        : "cover";
}




function renderTask(taskTitle, isCompleted) {
  
  let todoList = document.getElementById("todo-list");
  let li = document.createElement("li");
  li.textContent = `${todoList.children.length + 1}. ${taskTitle}`;

  if (isCompleted) {
    li.classList.add("completed");
    cloudCount++;
  }

  li.addEventListener("click", function () {
    const currentlyCompleted = this.classList.toggle("completed");
    if (currentlyCompleted) {
        cloudCount++;
        triggerConfettiEffect(); // Trigger the confetti effect
    } else {
        cloudCount--;
    }
    updateBackground();
    calculateAndUpdateChart(); 

    // Update task completion status in the database
    fetch(`/api/tasks/${encodeURIComponent(taskTitle)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ completed: currentlyCompleted }),
    })
      .then((response) => response.json())
      .catch((error) => console.error("Error:", error));
  });

  li.addEventListener("dblclick", function () {
    // Extract the task name from the <li> element's text content
    const taskName = this.textContent.split(". ")[1];

    console.log("Deleting task:", taskName);

    // Call API to delete task
    fetch(`/api/tasks/${encodeURIComponent(taskName)}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .catch((error) => console.error("Error:", error));

    this.remove();
    if (cloudCount > 0) cloudCount--;
    updateBackground();
    renumberTasks();
    calculateAndUpdateChart(); 
  });

  todoList.appendChild(li);
  updateBackground(); // Update background each time a task is rendered
  calculateAndUpdateChart(); //update chart each time a task is rendered
}

function renumberTasks() {
  let todoListItems = document.querySelectorAll("#todo-list li");
  todoListItems.forEach((item, index) => {
    item.textContent = `${index + 1}. ${item.textContent.split(". ")[1]}`;
  });
}

function addTodo() {
  let input = document.getElementById("todo-input");
  let taskTitle = input.value.trim();
  if (taskTitle !== "") {
    // Call API to add task
    fetch("/api/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: taskTitle }),
    })
      .then((response) => response.json())
      .then((data) => {
        renderTask(taskTitle);
      })
      .catch((error) => console.error("Error:", error));

    input.value = "";
  } else {
    alert("Please enter a task!");
  }
}

function loadTasks() {
  fetch("/api/tasks")
    .then((response) => response.json())
    .then((tasks) => {
      const completedTasks = tasks.filter(task => task.completed).length;
      const completionPercentage = (completedTasks / tasks.length) * 100;
      tasks.forEach((task) => {
        renderTask(task.title, task.completed);
      });
      calculateAndUpdateChart();
    })
    .catch((error) => console.error("Error:", error));
}

// Initialize tasks from database when the page loads
window.onload = loadTasks;

document
  .getElementById("todo-input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent the default action
      addTodo();
    }
  });

let countdown;
let countdownDisplay = document.getElementById("countdown-display");
let ringtone = document.getElementById("ringtone");

let remainingTime = 0;
let endTime = 0;

function startTimer() {

   // Hide the start button
   document.getElementById("minutes").style.display = "none";
   document.getElementById("hours").style.display = "none";

   document.getElementById("start-button").style.display = "none";


   // Show countdown, pause, and stop buttons
   document.getElementById("countdown-display").style.display = "block";
   document.getElementById("pause-button").style.display = "inline";
   document.getElementById("stop-button").style.display = "inline";

  let hours = parseInt(document.getElementById("hours").value);
  let minutes = parseInt(document.getElementById("minutes").value);
  let totalTime = 
    (isNaN(hours) ? 0 : hours * 3600) + // Convert hours to seconds
    (isNaN(minutes) ? 0 : minutes * 60); // Convert minutes to seconds

  totalTime *= 1000; // Convert total time to milliseconds

  if (totalTime <= 0) {
    alert("Please enter a valid time.");
    return;
  }
  
  endTime = Date.now() + totalTime;


   // Calculate total time only if remainingTime is 0 (not paused)
   if (remainingTime === 0) {
    let hours = parseInt(document.getElementById("hours").value);
    let minutes = parseInt(document.getElementById("minutes").value);
    totalTime = 
        (isNaN(hours) ? 0 : hours * 3600) + // Convert hours to seconds
        (isNaN(minutes) ? 0 : minutes * 60); // Convert minutes to seconds
    totalTime *= 1000; // Convert total time to milliseconds
} else {
    totalTime = remainingTime; // Use the remaining time if paused
}

  clearInterval(countdown);
  endTime = Date.now() + totalTime;
  displayTimeLeft(totalTime);

  countdown = setInterval(() => {
    if (isPaused) return;

    const secondsLeft = Math.round((endTime - Date.now()) / 1000);
    if (secondsLeft < 0) {
        clearInterval(countdown);
        playRingtone();
        return;
    }
    displayTimeLeft(secondsLeft * 1000);
}, 1000);

}

let isPaused = false;

function pauseTimer() {
  if (isPaused) {
      // Resuming the timer
      startTimer(); // Restart the timer with the remaining time
  } else {
      // Pausing the timer
      clearInterval(countdown);
      remainingTime = endTime - Date.now(); // Calculate remaining time
  }
  isPaused = !isPaused;
  document.getElementById("pause-button").textContent = isPaused ? "Resume" : "Pause";
}


function stopTimer() {
  clearInterval(countdown);

  // Reset timer display and show inputs
  document.getElementById("countdown-display").style.display = "none";
  document.getElementById("hours").style.display = "inline";
  document.getElementById("minutes").style.display = "inline";

  // Hide pause and stop buttons
  document.getElementById("pause-button").style.display = "none";
  document.getElementById("stop-button").style.display = "none";

  // Reset the countdown display
  document.getElementById("countdown-display").innerHTML = "";
  document.getElementById("hours").value = "";
  document.getElementById("minutes").value = "";
  document.getElementById("start-button").style.display = "inline";
  remainingTime = 0; // Reset the remaining time
}

function playRingtone() {
  ringtone.currentTime = 0; // Reset to start
  ringtone.play();
  setTimeout(() => {
    ringtone.pause(); // Stop after 4 seconds
  }, 4000);
}

function displayTimeLeft(millisecondsLeft) {
  const hours = Math.floor(millisecondsLeft / 3600000); // 3600000 milliseconds in an hour
  const minutes = Math.floor((millisecondsLeft % 3600000) / 60000); // 60000 milliseconds in a minute
  const seconds = Math.floor((millisecondsLeft % 60000) / 1000); // 1000 milliseconds in a second

  const timeString = `${hours < 10 ? "0" : ""}${hours}:${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  countdownDisplay.innerHTML = `Time Left: <span id='duration'>${timeString}</span>`;

  const durationElement = document.getElementById("duration");
  //if millisecondsLeft is 0 --> duration turns red, else, if body is in dark mode --> duration turns white, else duration remains in initial color
  durationElement.style.color = millisecondsLeft === 0 ?
  "red" : (document.body.classList.contains('dark-mode') ? "white" : initial);
}


function toggleDarkMode() {
  const body = document.body;
  const icon = document.getElementById('mode-icon');
  const modeText = document.getElementById('mode-text');

  if (body.classList.contains('dark-mode')) {
      icon.src = 'sun.svg'; // Change to sun icon
      modeText.textContent = 'Change Mode';
  } else {
      icon.src = 'moon.svg'; // Change to moon icon
      modeText.textContent = 'Change Mode';
  }

  body.classList.toggle('dark-mode');
  updateBackground();
}



document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);

function typeWriter(text, i, fnCallback) {
  if (i < (text.length)) {
    // Typing effect with cursor
    document.getElementById("animated-text").innerHTML = text.substring(0, i + 1) + '<span aria-hidden="true"></span>';

    setTimeout(function() {
      typeWriter(text, i + 1, fnCallback)
    }, 50); // Reduced time for faster typing
  } else if (typeof fnCallback == 'function') {
    setTimeout(function() {
      // Remove cursor after typing is done
      document.getElementById("animated-text").innerHTML = text;
      fnCallback();
    }, 4);
  }
}


// Trigger the typing effect
document.addEventListener("DOMContentLoaded", function(event) {
  typeWriter("A cloud is added with every completed task!", 0);
});


// Initialize Dragula for the todo-list with options
dragula([document.getElementById("todo-list")], { removeOnSpill: false })
  .on("drag", function(el) {
    el.className = el.className.replace("ex-moved", "");
    
  })
  .on("drop", function(el) {
    el.className += " ex-moved";
    renumberTasks();

  })
  .on("over", function(el, container) {
    container.className += " ex-over";
  })
  .on("out", function(el, container) {
    container.className = container.className.replace("ex-over", "");
    renumberTasks();

  });


  document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('clear-tasks').addEventListener('click', function() {
        const todoList = document.getElementById('todo-list');
        while (todoList.firstChild) {
            todoList.removeChild(todoList.firstChild);
          }

        fetch(`/api/tasks/deleteAll`, { method: "DELETE" })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(() => {
            // Clear the tasks from the front end
            const todoList = document.getElementById('todo-list');
            todoList.innerHTML = '';
            cloudCount = 0;
            updateBackground();
            calculateAndUpdateChart(); // Update the chart
        })
        .catch(error => console.error("Error:", error));
    });
});



// Define window.myChart globally so it can be accessed by other functions to update the chart
window.myChart = null;

// This function initializes or updates the donut chart with the provided percentage
function updateDonutChart(percentage) {
  var ctx = document.getElementById('myChart').getContext('2d');
  
  // Update the percentage text
  document.getElementById('percentageText').innerText = percentage.toFixed(1) + '%';

  // Check if the chart instance already exists
  if (window.myChart) {
    // If the chart instance exists, update the data
    window.myChart.data.datasets[0].data = [percentage, 100 - percentage];
    window.myChart.update();
  } else {
    // If the chart instance does not exist, create it
    window.myChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [percentage, 100 - percentage],
          backgroundColor: [
            'rgba(0, 255, 0, 0.2)',
            'rgba(255, 99, 132, 0.2)'
          ],
          borderColor: [
            'rgba(51, 204, 51, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        cutout: 40 // Set the cutout percentage here
      }
    });
  }
}

function calculateAndUpdateChart() {
  // Grab all list items
  const todoListItems = document.querySelectorAll("#todo-list li");
  // Calculate completed tasks based on the 'completed' class
  const completedTasksCount = Array.from(todoListItems).filter(item => item.classList.contains('completed')).length;
  const totalTasksCount = todoListItems.length;
  const completionPercentage = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;
  updateDonutChart(completionPercentage); // Update the chart with the new percentage
}



