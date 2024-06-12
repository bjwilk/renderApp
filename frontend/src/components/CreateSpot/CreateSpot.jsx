import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createNewSpot,
  fetchUpdateSpot,
  addNewImages,
} from "../../store/spots";
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
  const [urls, setUrls] = useState(["", "", "", "", ""]);
  const [errors, setErrors] = useState({});

  const updateAddress = (e) => setAddress(e.target.value);
  const updateCity = (e) => setCity(e.target.value);
  const updateState = (e) => setState(e.target.value);
  const updateCountry = (e) => setCountry(e.target.value);
  const updateName = (e) => setName(e.target.value);
  const updatePrice = (e) => setPrice(e.target.value);
  const updateDescription = (e) => setDescription(e.target.value);
  const updateUrl = (index) => (e) => {
    const newUrls = [...urls];
    newUrls[index] = e.target.value;
    setUrls(newUrls);
  };

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
    try {
      if (spot) {
        payload.id = spot.id;
        newSpot = await dispatch(fetchUpdateSpot(payload));
      } else {
        newSpot = await dispatch(createNewSpot(payload));
      }

      if (newSpot) {
        const imagePayloads = urls
          .filter((url) => url)
          .map((url, index) => ({
            spotId: newSpot.id,
            url,
            preview: index === 0, // Set preview to true for the first image, false for the rest
          }));

        await dispatch(addNewImages(newSpot.id, imagePayloads));
        navigate(`/spots/${newSpot.id}`);
      }
    } catch (err) {
      const data = await err.json();
      if (data?.errors) {
        setErrors(data.errors);
      }
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
          <div className="image-section">
            <h3>Liven up your spot with photos</h3>
            <p>Submit a link to at least one photo to publish your spot</p>
            {urls.map((url, index) => (
              <input
                key={index}
                value={url}
                onChange={updateUrl(index)}
                placeholder={
                  index === 0 ? "Preview Image URL" : `Image URL ${index + 1}`
                }
              />
            ))}
          </div>
          <br></br>
          <button type="submit">
            {spot ? "Update Spot" : "Create new Spot"}
          </button>
          <button type="button" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </form>
      </section>
    </>
  );
}

export default CreateSpot;
