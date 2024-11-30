import React, { useState, useEffect } from 'react';
import '../TodoList.css';

const TodoList = () => {
  const [tareas, setTareas] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
 const [editando, setEditando] = useState(null); // Guarda el ID de la tarea que está siendo editada
  const [descripcionEdit, setDescripcionEdit] = useState('');
  const [fechaLimiteEdit, setFechaLimiteEdit] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/tareas`)
      .then(response => response.json())
      .then(data => setTareas(data))
      .catch(error => console.error('Error fetching tareas:', error));
  }, []);

  const handleSubmit = event => {
    event.preventDefault();

    const nuevaTarea = {
      descripcion,
      fechaLimite,
      estado: 'pendiente',
      prioridad: 'media'
    };

    fetch(`${process.env.REACT_APP_API_URL}/tareas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nuevaTarea),
    })
      .then(response => response.json())
      .then(data => {
        setTareas([...tareas, data]);
        setDescripcion('');
        setFechaLimite('');
         setMostrarFormulario(false);
      })
      .catch(error => console.error('Error creating tarea:', error));
  };

 const toggleFormulario = () => setMostrarFormulario(!mostrarFormulario);

  const toggleEstado = id => {
    const tarea = tareas.find(t => t.id === id);
    const estadoNuevo = tarea.estado === 'pendiente' ? 'completada' : 'pendiente';

    fetch(`${process.env.REACT_APP_API_URL}/tareas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...tarea, estado: estadoNuevo }),
    })
      .then(response => response.json())
      .then(data => {
        setTareas(tareas.map(t => (t.id === id ? data : t)));
      })
      .catch(error => console.error('Error updating tarea:', error));
  };

const eliminarTarea = id => {
  fetch(`${process.env.REACT_APP_API_URL}/tareas/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(() => {
      setTareas(tareas.filter(t => t.id !== id));
    })
    .catch(error => console.error('Error deleting tarea:', error));
};

 const iniciarEdicion = (id, descripcion, fechaLimite) => {
    setEditando(id);
    setDescripcionEdit(descripcion);
    setFechaLimiteEdit(fechaLimite);
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setDescripcionEdit('');
    setFechaLimiteEdit('');
  };

  const actualizarTarea = id => {
    const tareaActualizada = {
      descripcion: descripcionEdit,
      fechaLimite: fechaLimiteEdit,
    };

    fetch(`${process.env.REACT_APP_API_URL}/tareas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...tareaActualizada, estado: tareas.find(t => t.id === id).estado }),
    })
      .then(response => response.json())
      .then(data => {
        setTareas(tareas.map(t => (t.id === id ? data : t)));
        cancelarEdicion();
      })
      .catch(error => console.error('Error updating tarea:', error));
  };

  return (
     <div>
       <h1>Lista de Tareas</h1>
       <button onClick={toggleFormulario} className="boton-toggle-formulario">
               <i className="fas fa-plus"></i> {/* Icono de + */}
             </button>
             {mostrarFormulario && (
               <form onSubmit={handleSubmit}>
                 <input
                   type="text"
                   value={descripcion}
                   onChange={e => setDescripcion(e.target.value)}
                   placeholder="Descripción"
                   required
                 />
                 <input
                   type="date"
                   value={fechaLimite}
                   onChange={e => setFechaLimite(e.target.value)}
                   required
                 />
                 <button type="submit">Crear Tarea</button>
               </form>
             )}
       <ul>
         {tareas.map(tarea => (
           <li key={tarea.id}>
             {editando === tarea.id ? (
               <span>
                 <input
                   type="text"
                   value={descripcionEdit}
                   onChange={e => setDescripcionEdit(e.target.value)}
                   required
                 />
                 <input
                   type="date"
                   value={fechaLimiteEdit}
                   onChange={e => setFechaLimiteEdit(e.target.value)}
                   required
                 />
                 <button onClick={() => actualizarTarea(tarea.id)}><i className="fas fa-save" /></button>
                 <button onClick={cancelarEdicion}>  <i className="fas fa-times" /></button>
               </span>
             ) : (
               <span>
                 {tarea.descripcion} - {tarea.estado}
                 <button onClick={() => iniciarEdicion(tarea.id, tarea.descripcion, tarea.fechaLimite)}><i className="fas fa-edit" /></button>
                 <button onClick={() => toggleEstado(tarea.id)}>
                   <i className={tarea.estado === 'pendiente' ? 'fas fa-check' : 'fas fa-undo'} />
                 </button>
                 <button onClick={() => eliminarTarea(tarea.id)}>
                  <i className="fas fa-trash" /></button>
               </span>
             )}
           </li>
         ))}
       </ul>
     </div>
   );
 };

 export default TodoList;