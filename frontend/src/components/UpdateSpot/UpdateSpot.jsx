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

    const newErrors = {};
    if (!address) newErrors.address = "Address is required";
    if (!city) newErrors.city = "City is required";
    if (!state) newErrors.state = "State is required";
    if (!country) newErrors.country = "Country is required";
    if (!name) newErrors.name = "Name is required";
    if (!price) newErrors.price = "Price is required";
    if (description.length < 30)
      newErrors.description = "Description of 30 characters is required";

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

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
      <h1>{spot ? "Update Spot" : "Create New Spot"}</h1>
      <section className="form-container">
        <form onSubmit={handleSubmit}>
          <h2>Where's your place located?</h2>
          <p>
            Guests will only get your exact address once they book a reservation.
          </p>
          <input
            value={address}
            onChange={updateAddress}
            placeholder="Address"
            className="input-field"
          />
          {errors.address && <p className="error-message">{errors.address}</p>}
          <input value={city} onChange={updateCity} placeholder="City" className="input-field" />
          {errors.city && <p className="error-message">{errors.city}</p>}
          <input value={state} onChange={updateState} placeholder="State" className="input-field" />
          {errors.state && <p className="error-message">{errors.state}</p>}
          <input value={country} onChange={updateCountry} placeholder="Country" className="input-field" />
          {errors.country && <p className="error-message">{errors.country}</p>}
          <h2>Describe your place to guests</h2>
          <p>
            Mention the best features of your space, any special amenities like
            fast wifi or parking, and what you love about the neighborhood.
          </p>
          <textarea
            value={description}
            onChange={updateDescription}
            placeholder="Description"
            className="textarea-field"
          />
          {errors.description && <p className="error-message">{errors.description}</p>}
          <h2>Create a title for your spot</h2>
          <p>
            Catch guests' attention with a spot title that highlights what makes
            your place special.
          </p>
          <input value={name} onChange={updateName} placeholder="Name" className="input-field" />
          {errors.name && <p className="error-message">{errors.name}</p>}
          <h2>Set a base price for your spot</h2>
          <p>
            Competitive pricing can help your listing stand out and rank higher
            in search results.
          </p>
          <div className="price-section">
            <span>$</span>
            <input value={price} onChange={updatePrice} placeholder="Price" className="input-field" />
          </div>
          {errors.price && <p className="error-message">{errors.price}</p>}
          <br></br>
          <br></br>
          <div className="button-group">
            <button type="submit" className="form-button">
              {spot ? "Update Spot" : "Create new Spot"}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="form-button cancel-button">
              Cancel
            </button>
          </div>
        </form>
      </section>
    </>
  );
}

export default UpdateSpot;
