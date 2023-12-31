let isDarkMode = true;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('taskForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('modeToggle').addEventListener('click', toggleDarkMode);
    updateGanttChart();
});

document.addEventListener("keydown", function (e) {
    if (e.code === "Enter") {
        updateGanttChart();
    }
});

function handleFormSubmit(event) {
    event.preventDefault();
    const task = getTaskFromForm();
    if (task) {
        addTaskToChart(task);
    }
}

function getTaskFromForm() {
    const section = document.getElementById('sectionName').value.trim();
    const taskName = document.getElementById('taskName').value.trim();
    const duration = document.getElementById('duration').value.trim();
    const startDate = document.getElementById('startDate').value.trim();
    const dependency = document.getElementById('dependency').value.trim();

    if (!section || !taskName || !duration) {
        alert('Please fill in all required fields: section, task name, and duration.');
        return null;
    }

    return { section, taskName, duration, startDate, dependency };
}

function addTaskToChart(task) {
    const ganttInput = document.getElementById('ganttInput');
    const newTaskLine = formatTaskLine(task);
    ganttInput.value += newTaskLine;
    updateGanttChart();
}

function formatTaskLine(task) {
    let newTaskLine = `\n${task.section}\n    ${task.taskName}`;
    if (task.dependency) {
        newTaskLine += ` :after ${task.dependency}`;
    } else if (task.startDate) {
        newTaskLine += ` : ${task.startDate}`;
    }
    newTaskLine += `, ${task.duration}`;
    return newTaskLine;
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    updateGanttChart();
}

function updateGanttChart() {
    const theme = !isDarkMode ? 'dark' : 'default';
    const input = document.getElementById('ganttInput').value;
    cacheGantt(input);
    const ganttContainer = document.getElementById('ganttContainer');

    clearGanttContainer(ganttContainer);
    const newGanttDiv = createGanttDiv(input);
    ganttContainer.appendChild(newGanttDiv);

    initializeMermaid(theme);
    mermaid.init(undefined, document.querySelectorAll('.mermaid'));
}

function clearGanttContainer(ganttContainer) {
    ganttContainer.innerHTML = '';
}

function createGanttDiv(input) {
    const newGanttDiv = document.createElement('div');
    newGanttDiv.className = 'mermaid';
    newGanttDiv.innerHTML = input;
    return newGanttDiv;
}

function initializeMermaid(theme) {
    mermaid.initialize({ 
        startOnLoad: true,
        theme: theme
    });
}
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('mermaid_tool/service-worker.js').then(function(registration) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
  
  function cacheGantt(text) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_GANTT',
        text: text
      });
    }
  }

function loadGantt() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = function(event) {
        document.getElementById('ganttText').value = event.data;
      };
      navigator.serviceWorker.controller.postMessage({
        type: 'GET_GANTT'
      }, [messageChannel.port2]);
    }
  }
  
  // Call loadGantt when the page loads
  window.addEventListener('load', loadGantt);