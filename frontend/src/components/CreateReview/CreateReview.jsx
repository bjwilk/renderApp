import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from 'react-router-dom';
import * as reviewActions from "../../store/reviews";
import * as spotActions from "../../store/spots";
import { useModal } from "../../context/Modal";
import StarRating from "./StarRating";
import "./CreateReview.css";

function CreateReview() {
  const { spotId } = useParams();
  const user = useSelector((state) => state.session.user);
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [review, setReview] = useState("");
  const [stars, setStars] = useState(0);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();

    return dispatch(
      reviewActions.addNewReview(spotId, {
        spotId,
        userId: user.id,
        review,
        stars
      })
    )
    .then(() => {
      dispatch(spotActions.fetchSpotDetails(spotId)); // Fetch updated spot details
      closeModal();
    })
    .catch(async (res) => {
      const data = await res.json();
      if (data?.errors) {
        setErrors(data.errors);
      }
    });
  }

  const isButtonDisabled = review.length < 10 || !stars;

  return (
    <>
      <form onSubmit={handleSubmit}>
        <h2>How was your stay?</h2>
        <label>
          Review
          <input
            type="text"
            value={review}
            placeholder="Leave your review here"
            onChange={(e) => setReview(e.target.value)}
          />
        </label>
        {errors.review && <p>{errors.review}</p>}
        <StarRating stars={stars} setStars={setStars}/>
        <button disabled={isButtonDisabled} type="submit">Submit Your Review</button>
      </form>
    </>
  );
}

export default CreateReview;
