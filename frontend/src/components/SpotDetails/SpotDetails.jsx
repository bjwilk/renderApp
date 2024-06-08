import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchReviews,addNewReview } from '../../store/reviews';
import { useDispatch, useSelector } from 'react-redux';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import CreateReview from '../CreateReview/CreateReview';


function SpotDetails() {
  const { spotId } = useParams();
  const ulRef = useRef();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const reviews = useSelector(state => state.reviews);
  const user = useSelector(state => state.session.user)
  const spotReview = useSelector((state) => state.spots[spotId]);
  const [showMenu, setShowMenu] = useState(false);

  console.log(user)

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  useEffect(() => {
    dispatch(fetchReviews(spotId));
  }, [dispatch, spotId]);

  useEffect(() => {
    dispatch(addNewReview(spotId))
  },[dispatch, spotId])

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

  let spotOwner;
  if (user){

    if(user.id !== spot.ownerId){
      spotOwner = false
    }else{
      spotOwner = true
    }
  }





  return (
    <div className="spot-details">
      <h3>{spot.name}</h3>
      <div>{spot.previewImage}</div>
      <p>{spot.price}</p>
      <p>{spot.description}</p>

      <h4>Reviews</h4>
      {!spotOwner && user && (
        <div>
          <OpenModalButton 
          buttonText={"Post Your Review"}
          onButtonClick={closeMenu}
          modalComponent={<CreateReview spotReview={spotReview}/>}
          />
        </div>
      )}
      {reviews && Object.keys(reviews).length > 0 ? (
        Object.values(reviews).map(review => (
          <div key={review.id} className="review">
            <p><strong>{review.User.firstName} {review.User.lastName}</strong>: {review.review}</p>
            <p>Rating: {review.stars} stars</p>
            <p>{review.createdAt}</p>
          </div>
        ))
      ) : (
        <p>New</p>
      )}
    </div>
  );
}

export default SpotDetails;
