import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAddTodoMutation } from '../../Redux/Slice/todoApiSlice';
import styles from './AddNewTodo.module.css';

const AddNewTodo = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [addTodo] = useAddTodoMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newTodo = await addTodo({
        title,
        body
      }).unwrap();
      setTimeout(() => {
        dispatch({ type: 'todo/addTodo', payload: newTodo });
      }, 1000);
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to add the todo:', err);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Add New TODO</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="body">Body:</label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className={styles.textarea}
          ></textarea>
        </div>
        <div className={styles.buttons}>
          <button type="submit" className={styles.submitButton}>Add TODO</button>
          <button type="button" onClick={() => navigate('/dashboard')} className={styles.cancelButton}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddNewTodo;