import { csrfFetch } from "./csrf";

const LOAD_SPOTS = 'spots/loadSpots';
const CREATE_SPOT = 'spots/createSpot'; 
const USERS_SPOT = 'spots/userSpot'
const UPDATE_SPOT = 'spots/updateSpot'
const REMOVE_SPOT = 'spots/removeSpot';
const SPOT_DETAIL = 'spots/spotDetails'

const showDetails = (spot) => ({
    type: SPOT_DETAIL,
    payload: spot
})

const removeSpotAction = (spotId) => ({
    type: REMOVE_SPOT,
    spotId
});

const loadSpots = (payload) => ({
    type: LOAD_SPOTS,
    payload
})

const createSpot = (payload) => ({ 
    type: CREATE_SPOT,
    payload
})

const userSpot = (payload) => ({
    type: USERS_SPOT,
    payload
})

const updateSpot = (payload) => ({
    type: UPDATE_SPOT,
    payload
})

export const removeSpot = (spotId) => async (dispatch) => {
    try {
        const res = await csrfFetch(`/api/spots/${spotId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            dispatch(removeSpotAction(spotId));
        }
    } catch (err) {
        console.error("Error deleting spot", err);
    }
};

export const fetchUpdateSpot = (spot) => async (dispatch) => {
    try{
        const res = await csrfFetch(`/api/spots/${spot.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(spot)
        })
        if(res.ok){
            const data = await res.json()
            dispatch(updateSpot(data))
        }else {
            console.error("Failed to load spot")
        }
    } catch (err){
        console.error("Error loading spot", err)
    }
}

export const fetchSpotDetails = (spotId) => async (dispatch) => {
try{
const res = await csrfFetch(`/api/spots/${spotId}`)
if(res.ok){
    const data = await res.json();
    dispatch(showDetails(data))
}
}catch (err){
    console.error("Error fetching Details", err)
}
}

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

export const fetchUserSpots = () => async (dispatch) => {
    try {
        const res = await csrfFetch("/api/spots/current");
        if(res.ok){
            const data = await res.json()
            dispatch(userSpot(data))
        }
    } catch (err){
        console.error("Error loading spots", err)
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
        case SPOT_DETAIL: {
            const newState = { ...state};
           newState[action.payload.id] = action.payload
            return newState
        }
        case CREATE_SPOT: { 
            const newState = { ...state };
            const newSpot = action.payload;
            newState[newSpot.id] = newSpot;
            return newState;
        }
        case USERS_SPOT: {
            const newState = {};
            action.payload.Spots.forEach(spot => {
                newState[spot.id] = spot
            })
            return {  ...newState}
        }
        case UPDATE_SPOT: {
            return { ...state, [action.payload.id]: action.payload }
        }
        case REMOVE_SPOT: {
            const newState = { ...state };
            delete newState[action.spotId];
            return newState;
        }
        default:
            return state;
    }
}

export default spotReducer;
