//DOMContentLoaded event listener ensures that the script runs after the HTML content is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  //Selecting various elements from the DOM
  const listsType = document.querySelector('[list-type]');
  const newList = document.querySelector('[new-list]');
  const newListInput = document.querySelector('[new-list-input]');
  const listDisplay = document.querySelector('[list-display]');
  const listTitle = document.querySelector('.list-title');
  const taskCounter = document.querySelector('[task-counter]');
  const tasksDisplay = document.querySelector('[tasks-display]');
  const newTask = document.querySelector('[new-task]');
  const newTaskInput = document.querySelector('[new-task-input]');
  const clearCompleteTasksButton = document.querySelector('[clear-complete-tasks-button]');

  //A key that stores and retrieves data from the browser's local storage, so the data is preserved
  const LOCAL_STORAGE_KEY = 'task.lists';
  let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
  let selectedList = null;

  // Variables to track the current edited task and current edited list
  let editedTaskId = null;
  let editedListId = null;

  // save() - save the lists 
  // display() - controls what is displayed in the UI
  function saveAndDisplay() {
    save();
    display();
  }

  //Saves lists to local storage
  function save() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(lists));
  }

  //Controls what is displayed in the UI
  function display() {
    displayLists();

    if (selectedList) {
      //Dispalying the selected list's information
      listDisplay.style.display = '';
      listTitle.innerText = selectedList.name;
      displayTaskCount();
      clearElement(tasksDisplay);
      displayTasks();
    } else {
      listDisplay.style.display = 'none';                       // Hiding list display if no list is selected
    }
  }
  

  //Displays the lists available to the user
  function displayLists() {
    clearElement(listsType);
    lists.forEach(list => {
      const listElement = document.createElement('li');
      listElement.dataset.listId = list.id;
      listElement.classList.add('list-name');
      listElement.textContent = list.name;

      //Handles list editing
      function editList(listId, listName) {
        document.getElementById('list-edit-modal').style.display = 'block';
        document.getElementById('edited-list-name').value = listName;
        editedListId = listId;
      }

      // Event listener for edit button click
      const editButton = document.createElement('button');
      editButton.classList.add('btn', 'edit-list-button');
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', function (event) {
        event.stopPropagation();
        editList(list.id, list.name);
      });
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

  //Event Listener for the delete list button
  document.addEventListener('click', (e) => {
    if (e.target.id === 'delete-list-button') {
      deleteSelectedList();
    }
  });

  //Deletes selected list
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

  // Event listener for opening the list edit modal
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-list-button')) {
      const listId = listElement.dataset.listId;
      const listName = listElement.textContent.trim();

      openListEditModal(listId, listName);
    }
  });

  //Handles opening the edit modal for list
  function openListEditModal(listId, listName) {
    const listEditModal = document.getElementById('list-edit-modal');
    listEditModal.style.display = 'block';
    document.getElementById('edited-list-name').value = listName;
    editedListId = listId;
  }


  // Event listener for closing the list edit modal
  document.querySelector('.close').addEventListener('click', onListCloseModal);

  //Handles closing the list edit modal
  function onListCloseModal() {
    const modal = document.getElementById('list-edit-modal');
    modal.style.display = 'none';
  }

  // Event listener for overlay click to close the modal
  document.getElementById('list-edit-modal').addEventListener('click', function (event) {
    if (event.target === this || event.target.classList.contains('close')) {
      onListCloseModal();
    }
  });

  // Event listener for save list changes button click
  document.getElementById('save-list-changes').addEventListener('click', function () {
    // Get the edited values from the modal
    const newListName = document.getElementById('edited-list-name').value;

    // Find the list with the editedListId
    const editedList = lists.find(list => list.id === editedListId);

    // Update the list details
    if (editedList) {
      editedList.name = newListName;
      onListCloseModal();
      saveAndDisplay();
    }
  });  

  //Displays the tasks for the selected list
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

      const taskColor = task.color || 'black'; 

      // Function to handle task editing
      function editTask(taskId, taskName, taskNote) {
        // Show the modal
        document.getElementById('task-edit-modal').style.display = 'block';

        // Set the values in the modal
        document.getElementById('edited-task-name').value = taskName;
        document.getElementById('edited-task-note').value = taskNote;
        document.getElementById('edited-task-color').value = taskColor;

        // Save the task ID for reference
        editedTaskId = taskId;
      }
      // color task element
      taskElement.style.color = taskColor;

      //Creating the edit task button
      const editButton = document.createElement('button');
      editButton.classList.add('btn', 'edit-task-button');
      editButton.textContent = 'Edit';

      //Event listener for edit button click
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

      // Inside displayTasks() function, after creating the taskElement
      const starButton = document.createElement('button');
      starButton.classList.add('star-button');
      starButton.innerHTML = '&#9733;'; // You can use an actual star icon here

      // Function to set the initial color based on the task's star status
      function setStarColor(task) {
        starButton.style.color = task.starred ? 'gold' : 'gray';
      }
      // Set initial color based on the task's star status
      setStarColor(task);

      // Event listener for star button click
      starButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevents the task item click event from triggering
        toggleStarred(task.id); // Call a function to handle the task starring
        starButton.style.color = 'gold';
      });
      taskElement.appendChild(starButton);            // Adds the star button to the task element

      taskElement.appendChild(checkbox);              // Adds the checkbox attribute  to the task element
      taskElement.appendChild(label);                 
      taskElement.appendChild(editButton);            // Adds the edit button to the task element
      taskElement.appendChild(noteElement);           // Adds the note attribute to the task element
      tasksDisplay.appendChild(taskElement);          // Adds the task element
    });
  }

  // calculates and displays the number of remaining tasks for the selected list
  function displayTaskCount() {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = incompleteTaskCount === 1 ? "task" : "tasks";
    taskCounter.innerText = `${incompleteTaskCount} ${taskString} remaining`;
  }

  // Event listener for closing the task edit modal
  document.querySelector('.close').addEventListener('click', onTaskCloseModal);

  //Handles closing the task edit modal
  function onTaskCloseModal() {
    const modal = document.getElementById('task-edit-modal');
    modal.style.display = 'none';
  }

  // Event listener for overlay click to close the modal
  document.getElementById('task-edit-modal').addEventListener('click', function (event) {
    if (event.target === this || event.target.classList.contains('close')) {
      onTaskCloseModal();
    }
  });

  // Event listener for save task changes button click
  document.getElementById('save-task-changes').addEventListener('click', function () {
    // Get the edited values from the modal
    const newTaskName = document.getElementById('edited-task-name').value;
    const newTaskNote = document.getElementById('edited-task-note').value;
    const newTaskColor = document.getElementById('edited-task-color').value;

    // Find the task with the editedTaskId
    const editedTask = selectedList.tasks.find(task => task.id === editedTaskId);

    // Update the task details
    editedTask.name = newTaskName;
    editedTask.note = newTaskNote;
    editedTask.color = newTaskColor;

    // Hide the modal
    onTaskCloseModal();

    // Save and display after updating the task
    saveAndDisplay();
  });

  //Toggles task's starred status
  function toggleStarred(taskId) {
    const taskIndex = selectedList.tasks.findIndex(task => task.id === taskId);
    const task = selectedList.tasks[taskIndex];
    
    if (task) {
      task.starred = !task.starred; // Toggle the 'starred' property
      const starButton = document.getElementById(task.id); 
      starButton.classList.toggle('starred', task.starred);
  
      if (task.starred) {
        // Move the task to the top of the list
        selectedList.tasks.splice(taskIndex, 1); // Remove the task from its current position
        selectedList.tasks.unshift(task); // Add the task to the top
      } else {

        // Remove the task from the top and place it based on its original completion status
        const completedTasks = selectedList.tasks.filter(task => task.complete);
        const uncompletedTasks = selectedList.tasks.filter(task => !task.complete);
        selectedList.tasks = [...completedTasks, ...uncompletedTasks];
      }
  
      saveAndDisplay(); // Save and update the display
    }
  }  

  //Clears the child elements of a given element
  function clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  //Event listener for clearing completed tasks
  clearCompleteTasksButton.addEventListener('click', e => {
    if (selectedList) {
      selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
      saveAndDisplay();
    }
  });

  //Event listener for selecting a list
  listsType.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
      selectedList = lists.find(list => list.id === e.target.dataset.listId);
      saveAndDisplay();
    }
  });

  //Event listener for adding a new list
  newList.addEventListener('submit', e => {
    e.preventDefault();
    const listName = newListInput.value.trim();
    if (listName) {
      lists.push({ id: Date.now().toString(), name: listName, tasks: [] });
      newListInput.value = '';
      saveAndDisplay();
    }
  });

  //Event listener for adding a new task
  newTask.addEventListener('submit', e => {
    e.preventDefault();
    const taskName = newTaskInput.value.trim();
    if (taskName && selectedList) {
      const taskColor= 'black';
      selectedList.tasks.push({ 
        id: Date.now().toString(), 
        name: taskName, 
        complete: false,
        color: taskColor,
       });
      newTaskInput.value = '';
      saveAndDisplay();
    }
  });

  //initializing the application's initial state
  display();
});
