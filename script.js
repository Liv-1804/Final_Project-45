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

  // stores and retrieves data from the browser's local storage, so the data is preserved
  const LOCAL_STORAGE_KEY = 'task.lists';
  let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
  let selectedList = null;

  // Variables to track the current edited task
  let editedTaskId = null;

  // save() - save the lists 
  // display() - controls what is displayed in the UI
  function saveAndDisplay() {
    save();
    display();
  }

  // Event listener for closing the task edit modal
  document.querySelector('.close').addEventListener('click', onCloseModal);

  function onCloseModal() {
    const modal = document.getElementById('task-edit-modal');
    modal.style.display = 'none';
  }

  // Event listener for overlay click to close the modal
  document.getElementById('task-edit-modal').addEventListener('click', function (event) {
    if (event.target === this) {
      onCloseModal();
    }
  });

  // Event listener for save task changes button click
  document.getElementById('save-task-changes').addEventListener('click', function () {
    // Get the edited values from the modal
    const newTaskName = document.getElementById('edited-task-name').value;
    const newTaskNote = document.getElementById('edited-task-note').value;

    // Find the task with the editedTaskId
    const editedTask = selectedList.tasks.find(task => task.id === editedTaskId);

    // Update the task details
    editedTask.name = newTaskName;
    editedTask.note = newTaskNote;

    // Hide the modal
    onCloseModal();

    // Save and display after updating the task
    saveAndDisplay();
  });

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

  // populates the tasks for the selected list
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

      // Function to handle task editing
      function editTask(taskId, taskName, taskNote) {
        // Show the modal
        document.getElementById('task-edit-modal').style.display = 'block';

        // Set the values in the modal
        document.getElementById('edited-task-name').value = taskName;
        document.getElementById('edited-task-note').value = taskNote;

        // Save the task ID for reference
        editedTaskId = taskId;
      }

      // Event listener for edit button click
      const editButton = document.createElement('button');
      editButton.classList.add('btn', 'edit-task-button');
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', function (event) {
        event.stopPropagation();
        editTask(task.id, task.name, task.note);
      });

      // add notes feature
      const noteElement = document.createElement('div'); // Add a div for the note
      noteElement.classList.add('task-note');
      noteElement.textContent = task.note || ''; // Display the note if it exists

      // add event listener for hovering to show the note
      taskElement.addEventListener('mouseover', () => {
        noteElement.style.display = 'block';
      });

      // add event listener for mouseout to hide the note
      taskElement.addEventListener('mouseout', () => {
        noteElement.style.display = '';
      });

      taskElement.appendChild(checkbox);
      taskElement.appendChild(label);
      taskElement.appendChild(editButton); // Add the edit button to the task element
      taskElement.appendChild(noteElement);
      tasksDisplay.appendChild(taskElement);
    });
  }

  // calculates and displays the number of remaining tasks for the selected list
  function displayTaskCount() {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = incompleteTaskCount === 1 ? "task" : "tasks";
    taskCounter.innerText = `${incompleteTaskCount} ${taskString} remaining`;
  }

  // displays the lists available to the user
  function displayLists() {
    clearElement(listsType);
    lists.forEach(list => {
      const listElement = document.createElement('li');
      listElement.dataset.listId = list.id;
      listElement.classList.add('list-name');
      listElement.textContent = list.name;

      const editButton = document.createElement('button');
      editButton.classList.add('btn', 'edit-list');
      editButton.textContent = 'Edit';
      listElement.appendChild(editButton);

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

  // clear the child elements of a given element
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

  document.addEventListener('click', (e) => {
    if (e.target.id === 'delete-list-button') {
      deleteSelectedList();
    }
  });

  function deleteSelectedList() {
    if (selectedList) {
      const listId = selectedList.id;
      const listIndex = lists.findIndex(list => list.id === listId);
      if (listIndex !== -1) {
        lists.splice(listIndex, 1); // Remove the selected list
        selectedList = null; // Deselect the list
        saveAndDisplay();
      }
    }
  }
  
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-list')) {
        const listElement = e.target.parentElement; // Get the list item
        const listId = listElement.dataset.listId;
        const listName = listElement.textContent.trim();

        const newName = prompt('Edit list name:', listName);
        if (newName !== null) {
            editList(listId, newName);
        }
    }
  });

  function editList(listId, newName) {
    const list = lists.find(list => list.id === listId);
    if (list) {
        list.name = newName;
        saveAndDisplay();
    }
  }

   // Event listener for opening the task edit modal
   tasksDisplay.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-task-button')) {
      const taskId = e.target.parentElement.dataset.taskId;
      const task = selectedList.tasks.find(task => task.id === taskId);

      if (task) {
        openTaskEditModal(task);
      }
    }
  });

  //initializing the application's initial state
  display();
});
