import './ConfirmDeleteModal.css'; 

const ConfirmDeleteSpotModal = ({ onConfirm, onCancel }) => {
  return (
    <div className="modal-background">
      <div className="modal-content">
        <h1>Confirm Delete</h1>
        <h2>Are you sure you want to delete this spot?</h2>
        <div className="modal-buttons">
          <button onClick={onConfirm}>Yes (Delete Spot)</button>
          <button onClick={onCancel}>No (Keep Spot)</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteSpotModal;