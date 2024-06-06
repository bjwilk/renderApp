import { csrfFetch } from "./csrf";

const LOAD_SPOTS = 'spots/loadSpots';
const CREATE_SPOT = 'spots/createSpot'; 
const USERS_SPOT = 'spots/userSpot'
const LOAD_SPOT = 'spots/loadSpot'

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

const loadSpot = (payload) => ({
    type: LOAD_SPOT,
    payload
})

export const updateSpot = (spotId) => async (dispatch) => {
    try{
        const res = await csrfFetch(`/api/spots/${spotId}`)
        if(res.ok){
            const data = await res.json()
            dispatch(loadSpot(data))
        }else {
            console.error("Failed to load spot")
        }
    } catch (err){
        console.error("Error loading spot", err)
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
        console.log("UserSpot", res)
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
        case USERS_SPOT: {
            const newState = {};
            action.payload.Spots.forEach(spot => {
                newState[spot.id] = spot
            })
            return { ...state, ...newState}
        }
        case LOAD_SPOT: {
            return { ...state, [action.payload.id]: action.payload }
        }
        default:
            return state;
    }
}

export default spotReducer;
