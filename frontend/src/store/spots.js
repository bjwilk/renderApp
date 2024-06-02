import { csrfFetch } from "./csrf";

const LOAD_SPOTS = 'spots/loadSpots';

const loadSpots = (payload) => ({
    type: LOAD_SPOTS,
    payload
})

export const fetchSpots = () => async (dispatch) => {
    try {
        const res = await csrfFetch("/api/spots");
        
        if (res.ok) {
            const data = await res.json();
            dispatch(loadSpots(data));
        } else {
            console.error("Failed to fetch spots");
        }
    } catch (err) {
        console.error("Error fetching spots:", err);
    }
}

const initialState = {}

const spotReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_SPOTS: {
            const newState = {};
            action.payload.Spots.forEach(spot => {
                newState[spot.id] = spot;
            });
            return { ...state, ...newState };
        }
        default:
            return state;
    }
}

export default spotReducer;
