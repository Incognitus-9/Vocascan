import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Route, HashRouter, Redirect } from "react-router-dom";

import AuthenticatedLayout from "./Components/Layout/AuthenticatedLayout/AuthenticatedLayout.jsx";
import Snackbar from "./Components/Snackbar/Snackbar.jsx";
import { SnackbarProvider } from "./context/SnackbarContext.jsx";
import AddVocab from "./screens/AddVocab/AddVocab.jsx";
import FirstStartup from "./screens/FirstStartup/FirstStartup.jsx";
import Login from "./screens/Login/Login.jsx";
import Register from "./screens/Register/Register.jsx";
import SelectionScreen from "./screens/SelectionScreen/SelectionScreen.jsx";
import Settings from "./screens/Settings/Settings.jsx";

import { signIn, signOut } from "./redux/Actions/login.js";
import { getProfile } from "./utils/api.js";

import Image from "./images/logo/color-round.svg";

import "./Components/sections.scss";
import "./index.scss";

const App = () => {
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state.login.isLoggedIn);
  const user = useSelector((state) => state.login.user);

  const shouldLogin = !!user.token && !isLoggedIn;

  // Try login if token is set
  useEffect(() => {
    if (shouldLogin) {
      getProfile()
        .then((res) => {
          dispatch(
            signIn({
              username: res.data.username,
              email: user.email,
              token: user.token,
            })
          );
        })
        .catch((err) => {
          console.log(err);
          dispatch(signOut());
        });
    }
  });

  if (!isLoggedIn) {
    return (
      <HashRouter>
        <Route path="/">
          <Redirect to="/plans" />
        </Route>
        <Route path="/plans" component={SelectionScreen} />
        <Route path="/login" component={() => <Login image={Image} />} />
        <Route path="/register" component={() => <Register image={Image} />} />
      </HashRouter>
    );
  } else {
    return (
      <HashRouter>
        <SnackbarProvider>
          <AuthenticatedLayout>
            <FirstStartup />
            <Route path="/addVocab" component={AddVocab} />
            <Route path="/settings" component={Settings} />
            <Snackbar />
          </AuthenticatedLayout>
        </SnackbarProvider>
      </HashRouter>
    );
  }
};

export default App;