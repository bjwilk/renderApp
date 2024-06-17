import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { fetchUserSpots, removeSpot } from "../../store/spots";
import { useModal } from "../../context/Modal";
import ConfirmDeleteSpotModal from "../ConfirmDeleteModal/ConfirmDeleteSpotModal";

import SpotCard from "../SpotCard/SpotCard";
import './UserSpots.css'

function UserSpots() {
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const ulRef = useRef();

  const spots = useSelector((state) => state.spots);
  const user = useSelector(state => state.session.user)
  const [showModal, setShowModal] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState(null);

console.log(selectedSpotId)

  useEffect(() => {
    dispatch(fetchUserSpots());
  }, [dispatch]);

  useEffect(() => {
    if (!showModal) return;

    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowModal(false);
      }
    };

    document.addEventListener("click", closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showModal]);

  const handleDelete = (spotId) => {

    dispatch(removeSpot(spotId));
  };

  if (!spots) {
    return <div>Loading...</div>;
  }

  const handleDeleteModal = (spotId) => {
    setSelectedSpotId(spotId);
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    // console.log(selectedSpotId)
    dispatch(removeSpot(selectedSpotId))
      .then(() => {
        setShowModal(false);
        setSelectedSpotId(null);
      })
      .catch((err) => {
        console.error("Error deleting review:", err);
      });
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setSelectedSpotId(null);
  };

  return (
    <div className="user-container">
      <h1>Manage Spots for {user.firstName} {user.lastName}</h1>
      {Object.keys(spots).length === 0 && (
        <div><NavLink to={"/spots/new"} >Create a Spot</NavLink></div>
      )}
      <div className="spot-card">
        {Object.values(spots).map((spot) => (
          <div key={spot.id}>
            <SpotCard spot={spot} />
            <NavLink to={`/spots/${spot.id}/edit`}>
              <button>Update</button>
            </NavLink>
            <button onClick={() => handleDeleteModal(spot.id)}>Delete</button>
          </div>
        ))}
      </div>

      {showModal && (
        <ConfirmDeleteSpotModal
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default UserSpots;
