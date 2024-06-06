import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserSpots } from "../../store/spots";
import SpotCard from "../SpotCard/SpotCard";

function UserSpots() {
const dispatch = useDispatch()
const spots = useSelector(state => state.spots)
console.log('Spots', spots)

useEffect(() => {
    dispatch(fetchUserSpots())
},[dispatch])

if (!spots || Object.keys(spots).length === 0) {
    return <div>Loading...</div>;
  }

    return ( 
        <div>
            <h1>Manage Spots</h1>
            <div className="spot-card">{Object.values(spots).map(spot => (
                <SpotCard key={spot.id} spot={spot}/>
            ))}</div>
        </div>
     );
}

export default UserSpots;