import {expect} from "chai";
import {addTodo, deleteTodo, editTodo, toggleTodo, toggleAll, clearCompleted} from "./index";

const ID = 'asdkfj';
const setup = () => {
	let todo = {
		id: ID,
		title: 'todo1',
		completed: false
	}
	return {todos: [todo]}
}

describe('Actions', () => {
	it('given a text, addTodo() will add a new todo', () => {
		let state = setup();
		let newState = addTodo('todo 2')(state);
		expect(newState.todos).to.have.length(2);
		let newTodo = newState.todos.pop();
		expect(newTodo.title).to.be.equal('todo 2');
		expect(newTodo.completed).to.be.false;
	});

	it('given an id, deleteTodo() will delete the todo', () => {
		let state = setup();
		let newState = deleteTodo(ID)(state);
		expect(newState.todos).to.have.length(0);
	});

	it('given id and text, editTodo() will modify a existing todo', () => {
		let state = setup();
		let newState = editTodo(ID, 'new title')(state);
		expect(newState.todos).to.have.length(1);
		let todo = newState.todos.pop();
		expect(todo.title).to.be.equal('new title');
	});

	it('given id, toggleTodo() will toggle a todo complete state', () => {
		let state = setup();
		let todo = state.todos[0]
		expect(todo.completed).to.be.false;
		toggleTodo(ID)(state);
		expect(todo.completed).to.be.true;
		toggleTodo(ID)(state);
		expect(todo.completed).to.be.false;
	});

	it('toggleAll() will toggle all todos to a same complete state', () => {
		let state = setup();
		addTodo('todo 2')(state);
		expect(state.todos).to.have.length(2);
		let todo1 = state.todos[0];
		let todo2 = state.todos[1];
		expect(todo1.completed).to.be.false;
		expect(todo2.completed).to.be.false;
		toggleAll()(state);
		expect(todo1.completed).to.be.true;
		expect(todo2.completed).to.be.true;
		toggleAll()(state);
		expect(todo1.completed).to.be.false;
		expect(todo2.completed).to.be.false;
	});

	it('clearCompleted() will clear all todos which are completed', () => {
		let state = setup();
		addTodo('todo 2')(state);
		toggleTodo(ID)(state);
		expect(state.todos).to.have.length(2);
		let todo1 = state.todos[0];
		let todo2 = state.todos[1];
		expect(todo1.completed).to.be.true;
		expect(todo2.completed).to.be.false;
		state = clearCompleted()(state);
		expect(state.todos).to.have.length(1);
		expect(todo2.completed).to.be.false;
	});
})