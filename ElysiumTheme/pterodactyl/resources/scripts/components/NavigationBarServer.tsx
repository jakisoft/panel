import * as React from "react";
import { useState } from "react";
import { Link, NavLink, useRouteMatch } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCogs,
  faLayerGroup,
  faSignOutAlt,
  faExternalLinkAlt,
  faUserCircle,
  faKey,
  faWrench,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { useStoreState } from "easy-peasy";
import { ApplicationStore } from "@/state";
import { ServerContext } from "@/state/server";
import SearchContainer from "@/components/dashboard/search/SearchContainer";
import tw, { theme } from "twin.macro";
import styled from "styled-components/macro";
import http from "@/api/http";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import Avatar from "./Avatar";
import routes from "@/routers/routes";
import Can from "@/components/elements/Can";
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
  const match = useRouteMatch<{ id: string }>();

  const onTriggerLogout = () => {
    setIsLoggingOut(true);
    http.post("/auth/logout").finally(() => {
      // @ts-expect-error this is valid
      window.location = "/";
    });
  };

  const serverId = ServerContext.useStoreState(
    (state) => state.server.data?.internalId
  );

  const to = (value: string, url = false) => {
    if (value === "/") {
      return url ? match.url : match.path;
    }
    return `${(url ? match.url : match.path).replace(
      /\/*$/,
      ""
    )}/${value.replace(/^\/+/, "")}`;
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
            <a>Server Control</a>
          </CategoryContainer>
          {routes.server
            .filter((route) => !!route.name)
            .map((route) =>
              route.permission ? (
                <Can key={route.path} action={route.permission} matchAny>
                  <NavLink to={to(route.path, true)} exact={route.exact}>
                    <FontAwesomeIcon icon={route.icon} />
                    <NavigationButton>{route.name}</NavigationButton>
                  </NavLink>
                </Can>
              ) : (
                <NavLink
                  key={route.path}
                  to={to(route.path, true)}
                  exact={route.exact}
                >
                  <FontAwesomeIcon icon={route.icon} />
                  <NavigationButton>{route.name}</NavigationButton>
                </NavLink>
              )
            )}
          {rootAdmin && (
            // eslint-disable-next-line react/jsx-no-target-blank
            <a href={`/admin/servers/view/${serverId}`} target={"_blank"}>
              <FontAwesomeIcon icon={faExternalLinkAlt} />
              <NavigationButton>Manage</NavigationButton>
            </a>
          )}
          <CategoryContainer>
            <a>Management</a>
          </CategoryContainer>
          <NavLink to={"/account"} exact>
            <FontAwesomeIcon icon={faUserCircle} />
            <NavigationButton>Account</NavigationButton>
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
