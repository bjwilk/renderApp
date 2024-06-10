import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserReviews, fetchRemoveReview } from "../../store/reviews";

function UsersReviews() {
  const dispatch = useDispatch();
  const reviews = useSelector((state) => state.reviews);
  const user = useSelector((state) => state.session.user);

  useEffect(() => {
    dispatch(fetchUserReviews());
  }, [dispatch]);

  const handleDelete = (reviewId) => {
    dispatch(fetchRemoveReview(reviewId));
  };

  if (!reviews || Object.keys(reviews).length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h1>Manage Reviews</h1>
      <div>
        {Object.values(reviews).map((review) => (
          <div key={review.id}>
            <p>{review.review}</p>
            <button onClick={() => handleDelete(review.id)}>Delete</button>
            <button>Update</button>
          </div>
        ))}
      </div>
    </>
  );
}

export default UsersReviews;
