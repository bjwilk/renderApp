import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchReviews } from '../../store/reviews';
import { useDispatch, useSelector } from 'react-redux';

function SpotDetails() {
  const { spotId } = useParams();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const reviews = useSelector(state => state.reviews);

  useEffect(() => {
    dispatch(fetchReviews(spotId));
  }, [dispatch, spotId]);

  useEffect(() => {
    fetch(`/api/spots/${spotId}`)
      .then(response => response.json())
      .then(data => {
        setSpot(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching spot data:', error);
        setError(error);
        setLoading(false);
      });
  }, [spotId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading spot details</p>;

  return (
    <div className="spot-details">
      <h3>{spot.name}</h3>
      <div>{spot.previewImage}</div>
      <p>{spot.price}</p>
      <p>{spot.description}</p>

      <h4>Reviews</h4>
      {reviews && Object.keys(reviews).length > 0 ? (
        Object.values(reviews).map(review => (
          <div key={review.id} className="review">
            <p><strong>{review.User.firstName} {review.User.lastName}</strong>: {review.review}</p>
            <p>Rating: {review.stars} stars</p>
            <p>{review.createdAt}</p>
          </div>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
}

export default SpotDetails;
