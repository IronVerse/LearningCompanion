import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddSubjectModal = ({ onClose, onAddSubject, userSubjects }) => {
  const [newSubjectName, setNewSubjectName] = useState('');
  const [error, setError] = useState('');

  const handleAddClick = () => {
    if (!newSubjectName.trim()) {
      setError('Subject name cannot be empty.');
      return;
    }
    if (userSubjects.some(sub => sub.toLowerCase() === newSubjectName.trim().toLowerCase())) {
      setError('This subject already exists.');
      return;
    }
    onAddSubject(newSubjectName.trim());
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Add New Subject</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>
        <p className="modal-description">Enter the name of the subject you'd like to add to your profile.</p>
        <input
          type="text"
          value={newSubjectName}
          onChange={(e) => {
            setNewSubjectName(e.target.value);
            setError('');
          }}
          placeholder="e.g., Advanced Calculus"
          className="modal-input"
        />
        {error && <p className="error-message">{error}</p>}
        <div className="modal-actions">
          <button
            onClick={onClose}
            className="modal-cancel-btn"
          >
            Cancel
          </button>
          <button
            onClick={handleAddClick}
            className="modal-add-btn"
          >
            Add Subject
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubjectModal;
