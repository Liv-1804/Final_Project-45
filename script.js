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

  //stores and retrieves data from the browser's local storage, so the data is perserved
  const LOCAL_STORAGE_KEY = 'task.lists';
  let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
  let selectedList = null;

  //save() - save the lists 
  //display() - controls what is displayed in the UI
  function saveAndDisplay() {
    save();
    display();
  }

  function save() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lists));
  }
  
  function display() {
    displayLists();
  
    if (selectedList) {
      listDisplay.style.display = '';
      llistTitle.innerText = selectedList.name;
      displayTaskCount();
      clearElement(tasksDisplay);
      displayTasks();
    } else {
      listDisplay.style.display = 'none';
    }
  }
  
  //populates the tasks for the selected list
  function displayTasks() {
    clearElement(tasksDisplay);
    selectedList.tasks.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.classList.add('task');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = task.id;
      checkbox.checked = task.complete;
      checkbox.addEventListener('change', () => {
        task.complete = checkbox.checked;
        saveAndDisplay();
      });
      const label = document.createElement('label');
      label.htmlFor = task.id;
      label.textContent = task.name;

      taskElement.appendChild(checkbox);
      taskElement.appendChild(label);
      tasksDisplay.appendChild(taskElement);
    });
  }
  
  //calculates and displays the number of remaining tasks for the selected list
  function displayTaskCount() {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = incompleteTaskCount === 1 ? "task" : "tasks";
    taskCounter.innerText = `${incompleteTaskCount} ${taskString} remaining`;
  }
  
  //displays the lists available to the user
  function displayLists() {
    clearElement(listsType);
    lists.forEach(list => {
      const listElement = document.createElement('li');
      listElement.dataset.listId = list.id;
      listElement.classList.add('list-name');
      listElement.textContent = list.name;

      // Add the "Delete List" button
      const deleteButton = document.createElement('button');
      deleteButton.classList.add('btn', 'delete-list');
      deleteButton.textContent = 'Delete';
      listElement.appendChild(deleteButton);

      if (list === selectedList) {
        listElement.classList.add('active-list');
      }
      listElement.addEventListener('click', () => {
        selectedList = list;
        saveAndDisplay();
      });
      listsType.appendChild(listElement);
    });
  }
  
  //clear the child elements of a given element
  function clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }
  
  listsType.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
      selectedList = lists.find(list => list.id === e.target.dataset.listId);
      saveAndDisplay();
    }
  });
  
  newList.addEventListener('submit', e => {
    e.preventDefault();
    const listName = newListInput.value.trim();
    if (listName) {
      lists.push({ id: Date.now().toString(), name: listName, tasks: [] });
      newListInput.value = '';
      saveAndDisplay();
    }
  });
  
  newTask.addEventListener('submit', e => {
    e.preventDefault();
    const taskName = newTaskInput.value.trim();
    if (taskName && selectedList) {
      selectedList.tasks.push({ id: Date.now().toString(), name: taskName, complete: false });
      newTaskInput.value = '';
      saveAndDisplay();
    }
  });
  
  clearCompleteTasksButton.addEventListener('click', e => {
    if (selectedList) {
      selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
      saveAndDisplay();
    }
  });

  // Listen for click events on the entire document
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-list')) {
      const listId = e.target.parentElement.dataset.listId;
      deleteList(listId);
    }
  });
  
  // Function to delete a list
  function deleteList(listId) {
    // Find the index of the list with the given ID in the 'lists' array
    const listIndex = lists.findIndex(list => list.id === listId);
    if (listIndex !== -1) {
      // Remove the list from the 'lists' array
      lists.splice(listIndex, 1);
      // Save the changes to local storage and update the display
      saveAndDisplay();
    }
  }

  //initializing the application's initial state
  display();
});
