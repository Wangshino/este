// @flow
import type { Action, Deps, Todo, TodosState } from '../types';
import { assocPath, dissocPath, filter, range } from 'ramda';

const ADD = 'este/todos/ADD';
const ADD_HUNDRED = 'este/todos/ADD_HUNDRED';
const DELETE = 'este/todos/DELETE';
const CLEAR_ALL = 'este/todos/CLEAR_ALL';
const CLEAR_COMPLETED = 'este/todos/CLEAR_COMPLETED';
const TOGGLE_COMPLETED = 'este/todos/TOGGLE_COMPLETED';

const initialState = {
  all: {},
};

export const addHundredTodos = () =>
  ({ getUid, now }: Deps): Action => {
    const todos = range(0, 100).map(() => {
      const id = getUid();
      // Note how we can enforce shape with type annotation. This is a special
      // case because flowtype doesn't know Ramda. Nobody wrotes typedefs yet.
      // Atom editor can show flow uncovered code on click.
      const todo: Todo = {
        completed: false,
        createdAt: now(),
        id,
        title: `Item #${id}`,
      };
      return todo;
    });
    return {
      type: ADD_HUNDRED,
      payload: { todos },
    };
  };

export const addTodo = (title: string) =>
  ({ getUid, now }: Deps): Action => ({
    type: ADD,
    payload: {
      todo: {
        completed: false,
        createdAt: now(),
        id: getUid(),
        title: title.trim(),
      },
    },
  });

export const clearAllCompletedTodos = (): Action => ({
  type: CLEAR_COMPLETED,
});

export const clearAllTodos = (): Action => ({
  type: CLEAR_ALL,
});

export const deleteTodo = (id: string): Action => ({
  type: DELETE,
  payload: { id },
});

export const toggleTodoCompleted = (todo: Todo): Action => ({
  type: TOGGLE_COMPLETED,
  payload: { todo },
});

const reducer = (
  state: TodosState = initialState,
  action: Action,
): TodosState => {
  switch (action.type) {
    case ADD_HUNDRED: {
      return action.payload.todos.reduce(
        (state, todo) => assocPath(['all', todo.id], todo, state),
        state,
      );
    }

    case ADD: {
      const { todo } = action.payload;
      return assocPath(['all', todo.id], todo, state);
    }

    case CLEAR_COMPLETED: {
      return { ...state, all: filter(todo => !todo.completed, state.all) };
    }

    case CLEAR_ALL: {
      return { ...state, all: {} };
    }

    case DELETE: {
      return dissocPath(['all', action.payload.id], state);
    }

    case TOGGLE_COMPLETED: {
      const { id, completed } = action.payload.todo;
      return assocPath(['all', id, 'completed'], !completed, state);
    }

    default:
      return state;

  }
};

export default reducer;
