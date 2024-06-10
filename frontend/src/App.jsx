import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation/Navigation';
import * as sessionActions from './store/session';
import HomePage from './components/HomePage/HomePage';
import SpotDetails from './components/SpotDetails/SpotDetails';
import { Modal } from "./context/Modal";
import CreateSpot from './components/CreateSpot/CreateSpot';
import UserSpots from './components/UserSpots/UserSpots';
import UpdateSpot from './components/UpdateSpot/UpdateSpot';
import UsersReviews from './components/UsersReviews/UsersReviews';


function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
      <Modal />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />
      },
      {
        path: '/spots/:spotId',
        element: <SpotDetails />
      },
      {
        path: '/spots/new',
        element: <CreateSpot />
      },
      {
        path: '/spots/current',
        element: <UserSpots />
      },
      {
        path: '/spots/:spotId/edit',
        element: <UpdateSpot />
      },
      {
        path: '/reviews/current',
        element: <UsersReviews />
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;