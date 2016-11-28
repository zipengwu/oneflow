import {uuid} from "../utils";

export const addTodo = (text) => ({todos}) => {
	todos.push({
		id: uuid(),
		title: text,
		completed: false
	})
	return {todos: todos}
}

export const deleteTodo = (id) => ({todos}) => {
	return {
		todos: todos.filter(todo => todo.id !== id)
	}
}

export const editTodo = (id, text) => ({todos}) => {
	let _todo = todos.find(todo => todo.id === id);
	if (_todo) {
		if (text && text.length) {
			_todo.title = text;
		}
		else {
			todos = todos.filter(todo => todo !== _todo)
		}
		return {todos: todos}
	}
}

export const toggleTodo = (id) => ({todos}) => {
	let todo = todos.find(todo => todo.id === id);
	todo.completed = !todo.completed;
	return {todos: todos}
}

export const toggleAll = () => ({todos}) => {
	if (todos.find(todo => !todo.completed)) {
		todos.forEach(todo => todo.completed = true)
	}
	else {
		todos.forEach(todo => todo.completed = false)
	}
	return {todos: todos}
}

export const clearCompleted = () => ({todos}) => {
	return {
		todos: todos.filter(todo => !todo.completed)
	}
}
