import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchUpdateSpot } from "../../store/spots";

import CreateSpot from "../CreateSpot/CreateSpot";

function UpdateSpot() {
  const { spotId } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const spot = useSelector((state) => state.spots[spotId]);

  useEffect(() => {
    dispatch(fetchUpdateSpot(spotId));
  }, [dispatch, spotId]);


  if (!spot) return <p>Loading...</p>;

  return (
    <>
      <CreateSpot user={user} spot={spot} />
    </>
  );
}

export default UpdateSpot;
