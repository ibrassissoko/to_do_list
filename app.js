const taskForm = document.querySelector(".task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector(".task-list");
const taskCount = document.querySelector(".task-toolbar__count");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearButton = document.querySelector(".clear-btn");

const STORAGE_KEY = "todo-list.tasks";

let tasks = loadTasks();
let activeFilter = "all";

const render = () => {
  taskList.innerHTML = "";

  const filteredTasks = tasks.filter((task) => {
    if (activeFilter === "active") return !task.done;
    if (activeFilter === "done") return task.done;
    return true;
  });

  if (filteredTasks.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.textContent = "Aucune tâche à afficher pour ce filtre.";
    taskList.appendChild(emptyState);
  } else {
    filteredTasks.forEach((task) => taskList.appendChild(createTaskElement(task)));
  }

  updateCount();
};

const createTaskElement = (task) => {
  const item = document.createElement("li");
  item.className = "task-item";
  if (task.done) item.classList.add("is-done");

  const label = document.createElement("label");
  label.className = "task-item__label";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.done;
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const textWrapper = document.createElement("div");
  const text = document.createElement("p");
  text.className = "task-item__text";
  text.textContent = task.title;

  const meta = document.createElement("span");
  meta.className = "task-item__meta";
  meta.textContent = task.done ? "Terminée" : "En cours";

  textWrapper.append(text, meta);

  label.append(checkbox, textWrapper);

  const deleteButton = document.createElement("button");
  deleteButton.className = "task-item__delete";
  deleteButton.type = "button";
  deleteButton.textContent = "Supprimer";
  deleteButton.addEventListener("click", () => removeTask(task.id));

  item.append(label, deleteButton);

  return item;
};

const updateCount = () => {
  const remaining = tasks.filter((task) => !task.done).length;
  const total = tasks.length;
  const taskLabel = total > 1 ? "tâches" : "tâche";
  taskCount.textContent = `${total} ${taskLabel} · ${remaining} active${remaining > 1 ? "s" : ""}`;
};

const addTask = (title) => {
  const newTask = {
    id: crypto.randomUUID(),
    title,
    done: false,
  };
  tasks = [newTask, ...tasks];
  saveTasks();
  render();
};

const toggleTask = (id) => {
  tasks = tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          done: !task.done,
        }
      : task
  );
  saveTasks();
  render();
};

const removeTask = (id) => {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
};

const clearTasks = () => {
  tasks = [];
  saveTasks();
  render();
};

const saveTasks = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const loadTasks = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [
      {
        id: crypto.randomUUID(),
        title: "Préparer la présentation",
        done: false,
      },
      {
        id: crypto.randomUUID(),
        title: "Envoyer l'email de suivi",
        done: true,
      },
    ];
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const setFilter = (filter) => {
  activeFilter = filter;
  filterButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === filter);
  });
  render();
};

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  addTask(title);
  taskInput.value = "";
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => setFilter(button.dataset.filter));
});

clearButton.addEventListener("click", clearTasks);

render();
