import './ConfirmDeleteModal.css'; 

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="modal-background">
      <div className="modal-content">
        <h1>Confirm Delete</h1>
        <h2>Are you sure you want to delete this review?</h2>
        <div className="modal-buttons">
          <button onClick={onConfirm}>Yes (Delete Review)</button>
          <button onClick={onCancel}>No (Keep Review)</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
