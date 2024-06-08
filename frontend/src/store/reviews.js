import { csrfFetch } from "./csrf";

const LOAD_REVIEWS = "reviews/loadReviews";
const CREATE_REVIEW = "reviews/createReview";

const createReview = (spotId, payload) => ({
  type: CREATE_REVIEW,
  spotId,
  payload
});

const loadReviews = (payload) => ({
  type: LOAD_REVIEWS,
  payload,
});

export const addNewReview = (spotId, review) => async (dispatch) => {
  try {
    const res = await csrfFetch(`/api/spots/${spotId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(review),
    });
    console.log(res)
    if (res.ok) {
      const data = await res.json();
      dispatch(createReview(spotId, data));
      return data;
    }
  } catch (err) {
    console.error("Could not create review", err);
  }
};

export const fetchReviews = (spotId) => async (dispatch) => {
  try {
    const res = await csrfFetch(`/api/spots/${spotId}/reviews`);

    if (res.ok) {
      const data = await res.json();
      dispatch(loadReviews(data));
    } else {
      console.error("Failed to fetch reviews");
    }
  } catch (err) {
    console.error("Error fetching reviews:", err);
  }
};

const initialState = {};

const reviewReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_REVIEWS: {
      const newState = {};

      action.payload.Reviews.forEach((review) => {
        newState[review.id] = review;
      });
      return { ...newState };
    }
    case CREATE_REVIEW: {
      const newState = { ...state }
      const newReview = action.payload;
      console.log('New Review', newReview)
      newState[newReview.id] = newReview
      return newState;
    }
    default:
      return state;
  }
};

export default reviewReducer;
