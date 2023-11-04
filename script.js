document.addEventListener("DOMContentLoaded", function () {
    // Select elements
    const taskInput = document.querySelector(".new.task");
    const taskList = document.querySelector(".tasks");
    const taskCount = document.querySelector(".task-count");
    const clearCompletedButton = document.querySelector(".btn.delete");
  
    // Add a new task
    const addTask = (taskName) => {
      if (taskName.trim() === "") return;
  
      const taskItem = document.createElement("div");
      taskItem.className = "task";
      taskItem.innerHTML = `
        <input type="checkbox" />
        <label>${taskName}</label>
      `;
  
      taskList.appendChild(taskItem);
      taskInput.value = "";
  
      updateTaskCount();
    };
  
    // Update the task count
    const updateTaskCount = () => {
      const tasks = taskList.querySelectorAll(".task");
      const completedTasks = taskList.querySelectorAll("input:checked");
      const remainingTasks = tasks.length - completedTasks.length;
  
      taskCount.textContent = `${remainingTasks} task${remainingTasks !== 1 ? "s" : ""} remaining`;
    };
  
    // Clear completed tasks
    clearCompletedButton.addEventListener("click", () => {
      const completedTasks = taskList.querySelectorAll("input:checked");
      completedTasks.forEach((task) => {
        task.closest(".task").remove();
      });
  
      updateTaskCount();
    });
  
    // Create a new task when the "Add" button is clicked
    taskInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        addTask(taskInput.value);
      }
    });
  
    // Create a new task when the "+" button is clicked
    document.querySelector(".btn.task").addEventListener("click", () => {
      addTask(taskInput.value);
    });
  
    // Event delegation to handle checkbox click events
    taskList.addEventListener("change", (event) => {
      if (event.target.type === "checkbox") {
        updateTaskCount();
      }
    });
  });
  