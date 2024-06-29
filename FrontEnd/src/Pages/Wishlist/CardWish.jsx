import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { removeTodo, setTodos } from '../../Redux/Slice/todoSlice';
import { useGetTodosQuery, useDeleteTodoMutation } from '../../Redux/Slice/todoApiSlice';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CardWish = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data, error, isLoading } = useGetTodosQuery();
  const [deleteTodo] = useDeleteTodoMutation();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
    if (data) {
      dispatch(setTodos(data));
    }
  }, [navigate, userInfo, data, dispatch]);

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id).unwrap();
      dispatch(removeTodo(id));
      toast.success('Todo deleted successfully!');
    } catch (err) {
      console.error('Failed to delete the todo:', err);
      toast.error('Failed to delete the todo.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate('/')} className={styles.profileButton}>Home</button>
        <button onClick={() => navigate('/admin')} className={styles.addButton}>Admin</button>
      </div>
      <div className={styles.todoList}>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error loading todos</p>}
        {data && data.map(item => (
          <div key={item._id} className={styles.todoItem}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p>{item.price}</p>
            {item.photo && <img src={item.photo} alt="Todo Photo" className={styles.todoPhoto} />}
            <button onClick={() => handleDelete(item._id)} className={styles.deleteButton}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardWish;
