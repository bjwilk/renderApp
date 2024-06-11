import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useModal } from "../../context/Modal";
import { fetchUserReviews, fetchRemoveReview, fetchUpdateReview } from "../../store/reviews";

function UsersReviews() {
  const dispatch = useDispatch();
  const ulRef = useRef();
  const { closeModal } = useModal();

  const reviews = useSelector((state) => state.reviews);
  const user = useSelector((state) => state.session.user);


  const [showModal, setShowModal] = useState(false);
  const [id, setId] = useState(null)
  const [review, setReview] = useState("");
  const [stars, setStars] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchUserReviews());
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

  const handleDelete = (reviewId) => {
    dispatch(fetchRemoveReview(reviewId));
  };

  const handleUpdate = (review) => {
    setId(review.id)
    setReview(review.review);
    setStars(review.stars);
    setShowModal(true);
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    return dispatch(
      fetchUpdateReview(id, {
        reviewId: review.reviewId,
        userId: user.id,
        review,
        stars
      })
    )
      .then(() => {
        closeModal();
        setShowModal(false);
        window.location.reload();
      })
      .catch(async (res) => {
        console.log(res)
        const data = await res.json();
        if (data?.errors) {
          setErrors(data.errors);
        }
      });
    
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
            <button onClick={() => handleUpdate(review)}>Update</button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal">
          <form onSubmit={handleSubmit}>
            <label>
              Review
              <input
                type="text"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </label>
            {errors.review && <p>{errors.review}</p>}
            <label>
              Stars
              <input
                type="number"
                value={stars}
                onChange={(e) => setStars(e.target.value)}
              />
            </label>
            {errors.stars && <p>{errors.stars}</p>}
            <button type="submit">Update Review</button>
          </form>
        </div>
      )}
    </>
  );
}

export default UsersReviews;
