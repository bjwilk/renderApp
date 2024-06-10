import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpotDetails } from '../../store/spots';
import { fetchReviews } from '../../store/reviews';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import CreateReview from '../CreateReview/CreateReview';

function SpotDetails() {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const spot = useSelector(state => state.spots[spotId]);
  const user = useSelector(state => state.session.user);
  const reviews = useSelector(state => state.reviews);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchSpotDetails(spotId))
      .then(() => setLoading(false))
      .catch((err) => {
        console.error('Error fetching spot details:', err);
        setError(err);
        setLoading(false);
      });
      dispatch(fetchReviews(spotId))
  }, [dispatch, spotId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading spot details</p>;

  const spotOwner = user && user.id === spot.ownerId;

  return (
    <div className="spot-details">
      <h3>{spot.name}</h3>
      <div>{spot.previewImage ? <img src={spot.previewImage} alt={spot.name} /> : 'No image available'}</div>
      <p>{spot.price}</p>
      <p>{spot.description}</p>

      <h4>Reviews</h4>
      {!spotOwner && user && (
        <div>
          <OpenModalButton 
            buttonText={"Post Your Review"}
            modalComponent={<CreateReview spotId={spotId} />}
          />
        </div>
      )}
      {reviews && Object.keys(reviews).length > 0 ? (
        Object.values(reviews).map(review => (
          <div key={review.id} className="review">
            {review.User ? (
              <p><strong>{review.User.firstName} {review.User.lastName}</strong>: {review.review}</p>
            ) : (
              <p>Anonymous: {review.review}</p>
            )}
            <p>Rating: {review.stars} stars</p>
            <p>{new Date(review.createdAt).toLocaleDateString()}</p>
          </div>
        ))
      ) : (
        <p>No reviews yet. Be the first to leave a review!</p>
      )}
    </div>
  );
}

export default SpotDetails;
