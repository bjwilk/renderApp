import { csrfFetch } from "./csrf";

const LOAD_SPOTS = 'spots/loadSpots';
const CREATE_SPOT = 'spots/createSpot'; 

const loadSpots = (payload) => ({
    type: LOAD_SPOTS,
    payload
})

const createSpot = (payload) => ({ 
    type: CREATE_SPOT,
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

export const createNewSpot = (spot) => async (dispatch) => { 
    try {
        const res = await csrfFetch("/api/spots", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(spot)
        })

        console.log('Result', res)

        if (res.ok) {
            const newSpot = await res.json();
            dispatch(createSpot(newSpot));
            return newSpot
        }
    } catch (err) {
        console.error("Error creating spot", err);
    }
}

const initialState = {};

const spotReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_SPOTS: {
            const newState = {};
            action.payload.Spots.forEach(spot => {
                newState[spot.id] = spot;
            });
            return { ...state, ...newState };
        }
        case CREATE_SPOT: { 
            const newState = {};
            const newSpot = action.payload;
            newState[newSpot.id] = newSpot;
            console.log('newState', newState)
            return { ...state, ...newState};
        }
        default:
            return state;
    }
}

export default spotReducer;
