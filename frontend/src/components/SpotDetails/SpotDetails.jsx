import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function SpotDetails() {
  const { spotId } = useParams();
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Replace with your actual API endpoint
    fetch(`/api/spots/${spotId}`)
      .then(response => response.json())
      .then(data => {
        setSpot(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching spot data:', error);
        setError(error);
        setLoading(false);
      });
  }, [spotId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading spot details</p>;

  return (
    <div className="spot-details">
      <h3>{spot.name}</h3>
      <div>{spot.previewImage}</div>
      <p>{spot.price}</p>
      <p>{spot.description}</p>
    </div>
  );
}

export default SpotDetails;
