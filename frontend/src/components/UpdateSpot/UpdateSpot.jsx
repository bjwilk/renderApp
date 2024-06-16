import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchUpdateSpot } from "../../store/spots";
import { useNavigate } from "react-router-dom";

function UpdateSpot() {
  const { spotId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.session.user);
  const spot = useSelector((state) => state.spots[spotId]);
  const dispatch = useDispatch();
  const [address, setAddress] = useState(spot ? spot.address : "");
  const [city, setCity] = useState(spot ? spot.city : "");
  const [state, setState] = useState(spot ? spot.state : "");
  const [country, setCountry] = useState(spot ? spot.country : "");
  const [name, setName] = useState(spot ? spot.name : "");
  const [price, setPrice] = useState(spot ? spot.price : 0);
  const [description, setDescription] = useState(spot ? spot.description : "");
  const [errors, setErrors] = useState({});

  const updateAddress = (e) => setAddress(e.target.value);
  const updateCity = (e) => setCity(e.target.value);
  const updateState = (e) => setState(e.target.value);
  const updateCountry = (e) => setCountry(e.target.value);
  const updateName = (e) => setName(e.target.value);
  const updatePrice = (e) => setPrice(e.target.value);
  const updateDescription = (e) => setDescription(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ownerId: user.id,
      address,
      city,
      state,
      country,
      name,
      price,
      description,
    };

    let newSpot;

    if (spot) {
      payload.id = spot.id;
      newSpot = await dispatch(fetchUpdateSpot(payload));
    }
    navigate(`/spots/${spotId}`);
  };

  if (!user) {
    return <p>Please Login</p>;
  }

  return (
    <>
      <div>Create Spot</div>
      <section className="new-form-holder">
        <form onSubmit={handleSubmit}>
          <input
            value={address}
            onChange={updateAddress}
            placeholder="Address"
          />
          <input value={city} onChange={updateCity} placeholder="City" />
          <input value={state} onChange={updateState} placeholder="State" />
          <input
            value={country}
            onChange={updateCountry}
            placeholder="Country"
          />
          <input value={name} onChange={updateName} placeholder="Name" />
          <input value={price} onChange={updatePrice} placeholder="Price" />
          <textarea
            value={description}
            onChange={updateDescription}
            placeholder="Description"
          />
          <br></br>

          <br></br>
          <button type="submit">Update Spot</button>
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </form>
      </section>
    </>
  );
}

export default UpdateSpot;
