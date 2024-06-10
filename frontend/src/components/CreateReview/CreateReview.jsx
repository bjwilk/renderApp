import { useState } from "react";
import { useDispatch , useSelector } from "react-redux";
import { useParams } from 'react-router-dom';
import * as reviewActions from "../../store/reviews";
import { useModal } from "../../context/Modal";
import "./CreateReview.css";

function CreateReview() {
    const { spotId } = useParams()
    const user = useSelector((state) => state.session.user);
  const dispatch = useDispatch();
  const { closeModal } = useModal();
  const [review, setReview] = useState("");
  const [stars, setStars] = useState(0);
  const [errors, setErrors] = useState({});

  console.log(user)

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
    .then(closeModal)
    .catch(async (res) => {
        const data = await res.json();
        if(data?.errors){
            setErrors(data.errors)
        }
    })
}

  return (
    <>
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
        <button type="submit">Create Review</button>
      </form>
    </>
  );
}

export default CreateReview;
