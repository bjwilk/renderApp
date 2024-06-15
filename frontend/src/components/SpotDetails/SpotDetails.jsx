import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSpotDetails } from "../../store/spots";
import { fetchReviews, fetchRemoveReview } from "../../store/reviews";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import CreateReview from "../CreateReview/CreateReview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useModal } from "../../context/Modal";
import ConfirmDeleteModal from "../ConfirmDeleteModal/ConfirmDeleteModal";

import "./SpotDetails.css";

function SpotDetails() {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const ulRef = useRef();
  const { closeModal } = useModal();

  const spot = useSelector((state) => state.spots[spotId]);
  const user = useSelector((state) => state.session.user);
  const reviews = useSelector((state) => state.reviews);

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  const spotReviews = [];

  const reviewList = Object.values(reviews);
  Object.values(reviewList).map((item) => {
    if (item.spotId == spotId) {
      spotReviews.push(item);
    }
  });

  useEffect(() => {
    dispatch(fetchSpotDetails(spotId))
      .then(() => setLoading(false))
      .catch((err) => {
        console.error("Error fetching spot details:", err);
        setError(err);
        setLoading(false);
      });
    dispatch(fetchReviews(spotId));
  }, [dispatch, spotId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading spot details</p>;

  const spotOwner = user && user.id === spot.ownerId;

  const spotImages = Object.values(spot.SpotImages);

  const previewImage = spotImages.map((index) => {
    return index.url;
  });

  let hasReview;
  if (user && spotReviews.find((review) => review.User.id == user.id)) {
    hasReview = true;
  }

  const otherImages = [];

  spotImages.map((image) => {
    if (image.preview !== true) {
      otherImages.push(image.url);
    }
  });

  const starIcons = [];
  const fullStars = Math.floor(spot.avgStarRating);
  const hasHalfStar = spot.avgStarRating % 1 !== 0;

  // Push full stars
  for (let i = 0; i < fullStars; i++) {
    starIcons.push(<FontAwesomeIcon key={i} icon={solidStar} />);
  }

  // Push half star if needed
  if (hasHalfStar) {
    starIcons.push(
      <FontAwesomeIcon key="half" icon={regularStar} className="half-star" />
    );
  }

  const handleDeleteModal = (reviewId) => {
    setSelectedReviewId(reviewId);
    setShowModal(true);
  };


  const handleConfirmDelete = () => {
    dispatch(fetchRemoveReview(selectedReviewId))
      .then(() => {
        dispatch(fetchRemoveReview(selectedReviewId))
        setShowModal(false);
        setSelectedReviewId(null);
      })
      .catch((err) => {
        console.error("Error deleting review:", err);
      });
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setSelectedReviewId(null);
  };

  return (
    <>
      <div className="spot-details">
        <div className="spot-name">
          <h3>{spot.name}</h3>
          <h5>
            {spot.city}, {spot.state}, {spot.country}
          </h5>
        </div>
        <div className="images-container">
          <div className="preview-image">
            {previewImage ? (
              <img src={previewImage.toString()} alt={spot.name} />
            ) : (
              "No image"
            )}
          </div>
          <div className="image-box">
            {otherImages.length > 0
              ? otherImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${spot.name} ${index + 1}`}
                  />
                ))
              : "No additional images"}
          </div>
        </div>
      </div>
      <br></br>
      <div className="details-section">
        <div className="spot-info">
          <h2>
            Hosted by {spot.Owner.firstName} {spot.Owner.lastName}
          </h2>
          <p>{spot.description}</p>
        </div>
        <div className="spot-info-box">
          ${spot.price} night
          <br></br>
          <div>{starIcons}</div>
          {spot.avgStarRating.toFixed(2)}
          <br></br>
          {spot.numReviews ? (
            "Reviews"
          ) : (
            <>
              <FontAwesomeIcon icon={regularStar} /> New
            </>
          )}
          <button>Reserve</button>
        </div>
      </div>

      <div>
        <h4>
          {spot.numReviews ? (
            "Reviews"
          ) : (
            <>
              <FontAwesomeIcon icon={regularStar} /> New
            </>
          )}
          <br></br>
          {spot.avgStarRating.toFixed(2)}
          <div>{starIcons}</div>
        </h4>

        {!spotOwner && user && !hasReview && (
          <div>
            <OpenModalButton
              buttonText={"Post Your Review"}
              modalComponent={<CreateReview spotId={spotId} />}
            />
          </div>
        )}
        {spotReviews && Object.keys(spotReviews).length > 0 ? (
          Object.values(spotReviews)
            .reverse()
            .map((review) => (
              <div key={review.id}>
                <h3>{review.User?.firstName || "Anonymous"}</h3>
                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                <p>{review.review}</p>
                {review.userId == user.id && (
                  <>
                    <button onClick={() => handleDeleteModal(review.id)}>Delete</button>
                  </>
                )}
              </div>
            ))
        ) : (
          <p>No reviews yet. Be the first to leave a review!</p>
        )}
      </div>

      {showModal && (
        <div>
          <ConfirmDeleteModal
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        </div>
      )}
    </>
  );
}
export default SpotDetails;
