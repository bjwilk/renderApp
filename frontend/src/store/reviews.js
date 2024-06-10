import { csrfFetch } from "./csrf";

const LOAD_REVIEWS = "reviews/loadReviews";
const CREATE_REVIEW = "reviews/createReview";
const USER_REVIEWS = "reviews/userReviews";
const REMOVE_REVIEW = "reviews/removeReview";

const removeReview = (reviewId) => ({
  type: REMOVE_REVIEW,
  reviewId,
});

const loadUserReviews = (payload) => ({
  type: USER_REVIEWS,
  payload,
});

const createReview = (spotId, payload) => ({
  type: CREATE_REVIEW,
  spotId,
  payload,
});

const loadReviews = (payload) => ({
  type: LOAD_REVIEWS,
  payload,
});

export const fetchRemoveReview = (reviewId) => async (dispatch) => {
  try {
    const res = await csrfFetch(`/api/reviews/${reviewId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      dispatch(removeReview(reviewId));
    }
  } catch (err) {
    console.error("Error removing review", err);
  }
};

export const fetchUserReviews = () => async (dispatch) => {
  try {
    const res = await csrfFetch(`/api/reviews/current`);
    if (res.ok) {
      const data = await res.json();
      dispatch(loadUserReviews(data));
    }
  } catch (err) {
    console.error("Error loading reviews", err);
  }
};

export const addNewReview = (spotId, review) => async (dispatch) => {
  try {
    const res = await csrfFetch(`/api/spots/${spotId}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(review),
    });
    if (res.ok) {
      const data = await res.json();
      dispatch(createReview(data));
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
      return { ...state, ...newState };
    }
    case CREATE_REVIEW: {
      const newReview = action.payload;
      return { ...state, [newReview.id]: newReview };
    }
    case USER_REVIEWS: {
      const newState = {};
      action.payload.Reviews.forEach((review) => {
        newState[review.id] = review;
      });
      return { ...newState };
    }
    case REMOVE_REVIEW: {
      const newState = { ...state };
      delete newState[action.reviewId];
      return newState;
    }
    default:
      return state;
  }
};

export default reviewReducer;