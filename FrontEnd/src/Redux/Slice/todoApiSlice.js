import { apiSlice } from './apiSlice';

const TODOS_URL = '/api/todos';

export const todoApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTodos: builder.query({
      query: () => ({
        url: `${TODOS_URL}/`,
      }),
    }),
    addTodo: builder.mutation({
      query: (todo) => ({
        url: `${TODOS_URL}/`,
        method: 'POST',
        body: todo,
      }),
    }),
    deleteTodo: builder.mutation({
      query: (id) => ({
        url: `${TODOS_URL}/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const { useGetTodosQuery, useAddTodoMutation, useDeleteTodoMutation } = todoApiSlice;