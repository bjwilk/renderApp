import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';
import { useNavigate } from 'react-router-dom';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();
  const navigate = useNavigate();

  const isButtonDisabled = credential.length < 4 || password.length < 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await dispatch(sessionActions.login({ credential, password }));
      closeModal();
      navigate("/");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setErrors(err.response.data.errors);
      } else {
        console.error("Failed to log in:", err);
        setErrors({ password: "Failed to log in. Please try again." });
      }
    }
  };

  const handleDemoLogin = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await dispatch(sessionActions.login({ credential: 'FakerUser1', password: 'password' }));
      closeModal();
      navigate("/");
    } catch (err) {
      console.error("Failed to log in as demo user:", err);
      setErrors({ demo: "Failed to log in as demo user. Please try again." });
    }
  };

  return (
    <>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.credential && errors.password && (
          <>
            <p className='errors'>Wrong Username or Email: {errors.credential}</p>
            <p className='errors'>Wrong Password: {errors.password}</p>
          </>
        )}
        {errors.credential && !errors.password && (
          <p className='errors'>Wrong Username or Email: {errors.credential}</p>
        )}
        {!errors.credential && errors.password && (
          <p className='errors'>The provided credentials were invalid: {errors.password}</p>
        )}
     <br></br>
        <button disabled={isButtonDisabled} type="submit">Log In</button>
        <br></br>
        <button onClick={handleDemoLogin} className="demo-button">Demo User</button>
      </form>
    </>
  );
}

export default LoginFormModal;
