import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { createNewSpot } from '../../store/spots'

function CreateSpot() {
  const user = useSelector(state => state.session.user);
  const dispatch = useDispatch();
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");

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
      address,
      city,
      state,
      country,
      name,
      price,
      description
    };

   const newSpot = await dispatch(createNewSpot(payload));
   console.log(newSpot)
  };

  const handleCancel = () => {
    setAddress("");
    setCity("");
    setState("");
    setCountry("");
    setName("");
    setPrice(0);
    setDescription("");
  };

  if (!user) {
    return <p>Please Login</p>;
  }

  return (
    <>
      <div>Create Spot</div>
      <section className="new-form-holder centered middled">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="address"
            value={address}
            onChange={updateAddress}
            required
          />
          <input
            type="text"
            placeholder="city"
            value={city}
            onChange={updateCity}
            required
          />
          <input
            type="text"
            placeholder="state"
            value={state}
            onChange={updateState}
            required
          />
          <input
            type="text"
            placeholder="country"
            value={country}
            onChange={updateCountry}
            required
          />
          <input
            type="text"
            placeholder="name"
            value={name}
            onChange={updateName}
            required
          />
          <input
            type="number"
            placeholder="price"
            value={price}
            onChange={updatePrice}
            required
          />
          <textarea
            placeholder="description"
            value={description}
            onChange={updateDescription}
            required
          />
          <button type="submit">Create new Spot</button>
          <button type="button" onClick={handleCancel}>Cancel</button>
        </form>
      </section>
    </>
  );
}

export default CreateSpot;
