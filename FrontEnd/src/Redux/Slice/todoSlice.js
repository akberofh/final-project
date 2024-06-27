import { createSlice } from '@reduxjs/toolkit';

const todoSlice = createSlice({
  name: 'todo',
  initialState: {
    userTodos: [],
  },
  reducers: {
    setTodos: (state, action) => {
      state.userTodos = action.payload;
    },
    addTodo: (state, action) => {
      state.userTodos.push(action.payload);
    },
    removeTodo: (state, action) => {
      state.userTodos = state.userTodos.filter(todo => todo._id !== action.payload);
    },
  },
});

export const { setTodos, addTodo, removeTodo } = todoSlice.actions;

export default todoSlice.reducer;