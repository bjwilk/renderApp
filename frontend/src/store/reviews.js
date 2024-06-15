import { csrfFetch } from "./csrf";

const LOAD_REVIEWS = "reviews/loadReviews";
const CREATE_REVIEW = "reviews/createReview";
const USER_REVIEWS = "reviews/userReviews";
const REMOVE_REVIEW = "reviews/removeReview";
const UPDATE_REVIEW = "reviews/updateReview";

const updateReview = (review) => ({
  type: UPDATE_REVIEW,
  review
})

const removeReview = (reviewId) => ({
  type: REMOVE_REVIEW,
  reviewId,
});

const loadUserReviews = (payload) => ({
  type: USER_REVIEWS,
  payload,
});

const createReview = (payload) => (
  {
  type: CREATE_REVIEW,
  payload,
});

const loadReviews = (payload) => ({
  type: LOAD_REVIEWS,
  payload,
});

export const fetchUpdateReview = (reviewId, reviewData) => async (dispatch) => {
  try{
    const res = await csrfFetch(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reviewData)
    })
    if(res.ok){
      const data = await res.json();
      dispatch(updateReview(data))
      return data
    }else{
      console.error("Failed to load review")
    }
  }catch (err){
    console.error("Error updating review", err)
  }
}

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
      console.log(spotId)
      console.log(data)
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
      console.log(newReview)
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
    case UPDATE_REVIEW: {
      return { ...state, [action.payload.id]: action.payload}
    }
    default:
      return state;
  }
};

export default reviewReducer;