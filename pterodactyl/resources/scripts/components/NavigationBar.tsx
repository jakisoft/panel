import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCogs,
  faLayerGroup,
  faSignOutAlt,
  faBars,
  faUserCircle,
  faKey,
  faWrench,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { useStoreState } from "easy-peasy";
import { ApplicationStore } from "@/state";
import SearchContainer from "@/components/dashboard/search/SearchContainer";
import tw, { theme } from "twin.macro";
import styled from "styled-components/macro";
import http from "@/api/http";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import Avatar from "./Avatar";
import { useState, useEffect } from "react";
import { getElysiumData } from "@/components/elements/elysium/getElysiumData";
import Navigation from "@/components/elements/elysium/navigation/Navigation";
import NavigationBar from "@/components/elements/elysium/navigation/NavigationBar";
import LogoContainer from "@/components/elements/elysium/navigation/LogoContainer";
import CategoryContainer from "@/components/elements/elysium/navigation/CategoryContainer";
import NavigationButton from "@/components/elements/elysium/navigation/NavigationButton";

export default () => {
  const logo = JSON.parse(getElysiumData("--logo"));
  const name = useStoreState(
    (state: ApplicationStore) => state.settings.data!.name
  );
  const rootAdmin = useStoreState(
    (state: ApplicationStore) => state.user.data!.rootAdmin
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onTriggerLogout = () => {
    setIsLoggingOut(true);
    http.post("/auth/logout").finally(() => {
      // @ts-expect-error this is valid
      window.location = "/";
    });
  };

  return (
    <>
      <Navigation>
        <Link to={"/"}>
          <LogoContainer>
            <img src={logo} alt="Logo" />
            <a>{name}</a>
          </LogoContainer>
        </Link>
        <NavigationBar>
          <CategoryContainer>
            <a>Dashboard</a>
          </CategoryContainer>
          <SearchContainer />
          <NavLink to={"/"} exact>
            <FontAwesomeIcon icon={faLayerGroup} />
            <NavigationButton>Servers</NavigationButton>
          </NavLink>
          <CategoryContainer>
            <a>Management</a>
          </CategoryContainer>
          <NavLink to={"/account"} exact>
            <FontAwesomeIcon icon={faUserCircle} />
            <NavigationButton>Account</NavigationButton>
          </NavLink>
          <NavLink to={"/account/api"} exact>
            <FontAwesomeIcon icon={faKey} />
            <NavigationButton>Api Key</NavigationButton>
          </NavLink>
          <NavLink to={"/account/ssh"} exact>
            <FontAwesomeIcon icon={faWrench} />
            <NavigationButton>Ssh Key</NavigationButton>
          </NavLink>
          <NavLink to={"/account/activity"} exact>
            <FontAwesomeIcon icon={faEnvelope} />
            <NavigationButton>Activity</NavigationButton>
          </NavLink>
          {rootAdmin && (
            <a href={"/admin"} rel={"noreferrer"} css={tw`text-yellow-400!`}>
              <FontAwesomeIcon icon={faCogs} />
              <NavigationButton>Admin</NavigationButton>
            </a>
          )}
          <a onClick={onTriggerLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <NavigationButton>Sign Out</NavigationButton>
          </a>
        </NavigationBar>
      </Navigation>
    </>
  );
};
