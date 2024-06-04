import { csrfFetch } from "./csrf";

const LOAD_REVIEWS = 'reviews/loadReviews';

const loadReviews = (payload) => ({
    type: LOAD_REVIEWS,
    payload
})

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
}

const initialState = {};

const reviewReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_REVIEWS: {
            const newState = {};

            action.payload.Reviews.forEach(review => {
                newState[review.id] = review;
            });
            return { ...state, ...newState };
        }
        default:
            return state;
    }
}

export default reviewReducer;
