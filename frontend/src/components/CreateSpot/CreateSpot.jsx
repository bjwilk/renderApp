import { useSelector } from 'react-redux';

function CreateSpot() {
    const user = useSelector(state => state.session.user);

    if (!user) {
      return <p>Please Login</p>;
    }
  
    return (
      <>
        <div>Create Spot</div>
        <section className="new-form-holder centered middled">
          <form>
            <input placeholder="address" />
            <input placeholder="city" />
            <input placeholder="state" />
            <input placeholder="country" />
            <input placeholder="name" />
            <input placeholder="price" />
            <textarea placeholder="description" />
            <button type="submit">Create new Spot</button>
            <button type="button">Cancel</button>
          </form>
        </section>
      </>
    );
  }
  
  export default CreateSpot;
  
