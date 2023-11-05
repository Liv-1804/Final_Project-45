document.addEventListener("DOMContentLoaded", function () {
  const listsType = document.querySelector('[list-type]');
  const newList = document.querySelector('[new-list]');
  const newListInput = document.querySelector('[new-list-input]');
  const listDisplay = document.querySelector('[list-display]');
  const llistTitle = document.querySelector('[list-title]');
  const taskCounter = document.querySelector('[task-counter]');
  const tasksDisplay = document.querySelector('[tasks-display]');
  const newTask = document.querySelector('[new-task]');
  const newTaskInput = document.querySelector('[new-task-input]');
  const clearCompleteTasksButton = document.querySelector('[clear-complete-tasks-button]');

  const LOCAL_STORAGE_KEY = 'task.lists';
  let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
  let selectedList = null;

  function saveAndRender() {
    save();
    render();
  }
  
  function save() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lists));
  }
  
  function render() {
    renderLists();
  
    if (selectedList) {
      listDisplay.style.display = '';
      llistTitle.innerText = selectedList.name;
      renderTaskCount();
      clearElement(tasksDisplay);
      renderTasks();
    } else {
      listDisplay.style.display = 'none';
    }
  }
  
  function renderTasks() {
    selectedList.tasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.classList.add('task');
      const checkbox = taskElement.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = task.id;
      checkbox.checked = task.complete;
      checkbox.addEventListener('change', () => {
        task.complete = checkbox.checked;
        saveAndRender();
      });
      const label = taskElement.createElement('label');
      label.htmlFor = task.id;
      label.textContent = task.name;
      taskElement.appendChild(checkbox);
      taskElement.appendChild(label);
      tasksDisplay.appendChild(taskElement);
    });
  }
  
  function renderTaskCount() {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = incompleteTaskCount === 1 ? "task" : "tasks";
    taskCounter.innerText = `${incompleteTaskCount} ${taskString} remaining`;
  }
  
  function renderLists() {
    clearElement(listsType);
    lists.forEach(list => {
      const listElement = document.createElement('li');
      listElement.dataset.listId = list.id;
      listElement.classList.add('list-name');
      listElement.textContent = list.name;
      if (list === selectedList) {
        listElement.classList.add('active-list');
      }
      listElement.addEventListener('click', () => {
        selectedList = list;
        saveAndRender();
      });
      listsType.appendChild(listElement);
    });
  }
  
  function clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
  
  listsType.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
      selectedList = lists.find(list => list.id === e.target.dataset.listId);
      saveAndRender();
    }
  });
  
  newList.addEventListener('submit', e => {
    e.preventDefault();
    const listName = newListInput.value.trim();
    if (listName) {
      lists.push({ id: Date.now().toString(), name: listName, tasks: [] });
      newListInput.value = '';
      saveAndRender();
    }
  });
  
  newTask.addEventListener('submit', e => {
    e.preventDefault();
    const taskName = newTaskInput.value.trim();
    if (taskName && selectedList) {
      selectedList.tasks.push({ id: Date.now().toString(), name: taskName, complete: false });
      newTaskInput.value = '';
      saveAndRender();
    }
  });
  
  clearCompleteTasksButton.addEventListener('click', e => {
    if (selectedList) {
      selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
      saveAndRender();
    }
  });

  render();
});
