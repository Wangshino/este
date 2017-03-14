import * as actions from '../todos';

it('addTodo creates todo', () => {
  const title = 'Hello';
  const deps = {
    getUid: () => 'uid',
    now: () => 1,
  };
  const action = actions.addTodo(title)(deps);
  expect(action).toEqual({
    type: 'este/todos/ADD',
    payload: {
      todo: {
        completed: false,
        createdAt: 1,
        id: 'uid',
        title: 'Hello',
      },
    },
  });
});
