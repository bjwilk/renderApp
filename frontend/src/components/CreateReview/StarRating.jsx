import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as emptyStar } from '@fortawesome/free-regular-svg-icons';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import './StarRating.css';

const StarRating = ({ stars, setStars }) => {
  const [hover, setHover] = useState(null);

  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <FontAwesomeIcon
            key={index}
            icon={ratingValue <= (hover || stars) ? solidStar : emptyStar}
            className="star"
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(null)}
            onClick={() => setStars(ratingValue)}
          />
        );
      })}
    </div>
  );
};

export default StarRating;
