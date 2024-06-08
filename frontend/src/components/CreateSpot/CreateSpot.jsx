import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewSpot, fetchUpdateSpot } from '../../store/spots'; 
import { useNavigate } from "react-router-dom";

function CreateSpot({ spot }) {
  const navigate = useNavigate();
  const user = useSelector((state) => state.session.user);
  const dispatch = useDispatch();

  const [address, setAddress] = useState(spot ? spot.address : "");
  const [city, setCity] = useState(spot ? spot.city : "");
  const [state, setState] = useState(spot ? spot.state : "");
  const [country, setCountry] = useState(spot ? spot.country : "");
  const [name, setName] = useState(spot ? spot.name : "");
  const [price, setPrice] = useState(spot ? spot.price : 0);
  const [description, setDescription] = useState(spot ? spot.description : "");

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
      description
    };

    let newSpot;
    if (spot) {
      payload.id = spot.id;
      newSpot = await dispatch(fetchUpdateSpot(payload));
    } else {
      newSpot = await dispatch(createNewSpot(payload));
    }

    if (newSpot) {
      navigate(`/spots/${newSpot.id}`); 
    }
  };

  if (!user) {
    return <p>Please Login</p>;
  }

  return (
    <>
      <div>{spot ? "Update Spot" : "Create Spot"}</div>
      <section className="new-form-holder">
        <form onSubmit={handleSubmit}>
          <input value={address} onChange={updateAddress} placeholder="address" />
          <input value={city} onChange={updateCity} placeholder="city" />
          <input value={state} onChange={updateState} placeholder="state" />
          <input value={country} onChange={updateCountry} placeholder="country" />
          <input value={name} onChange={updateName} placeholder="name" />
          <input value={price} onChange={updatePrice} placeholder="price" />
          <textarea value={description} onChange={updateDescription} placeholder="description" />
          <button type="submit">{spot ? "Update Spot" : "Create new Spot"}</button>
          <button type="button">Cancel</button>
        </form>
      </section>
    </>
  );
}

export default CreateSpot;
