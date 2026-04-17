import * as React from "react";
import { useState } from "react";
import { Link, NavLink, useRouteMatch } from "react-router-dom";
import { useStoreState } from "easy-peasy";
import { Cog, ExternalLink, Layers, LogOut, User } from "lucide-react";
import { ApplicationStore } from "@/state";
import { ServerContext } from "@/state/server";
import SearchContainer from "@/components/dashboard/search/SearchContainer";
import tw from "twin.macro";
import http from "@/api/http";
import routes from "@/routers/routes";
import Can from "@/components/elements/Can";
import { getElysiumData } from "@/components/elements/elysium/getElysiumData";
import Navigation from "@/components/elements/elysium/navigation/Navigation";
import NavigationBar from "@/components/elements/elysium/navigation/NavigationBar";
import LogoContainer from "@/components/elements/elysium/navigation/LogoContainer";
import CategoryContainer from "@/components/elements/elysium/navigation/CategoryContainer";
import NavigationButton from "@/components/elements/elysium/navigation/NavigationButton";

const iconProps = { size: 16 };

export default () => {
  const logo = JSON.parse(getElysiumData("--logo"));
  const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
  const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const match = useRouteMatch<{ id: string }>();

  const onTriggerLogout = () => {
    const confirmed = window.confirm("Yakin mau logout dari panel?");
    if (!confirmed) return;

    setIsLoggingOut(true);
    http.post("/auth/logout").finally(() => {
      // @ts-expect-error this is valid
      window.location = "/";
    });
  };

  const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);

  const to = (value: string, url = false) => {
    if (value === "/") return url ? match.url : match.path;

    return `${(url ? match.url : match.path).replace(/\/*$/, "")}/${value.replace(/^\/+/, "")}`;
  };

  return (
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
          <Layers {...iconProps} />
          <NavigationButton>Servers</NavigationButton>
        </NavLink>

        <CategoryContainer>
          <a>Server Control</a>
        </CategoryContainer>
        {routes.server
          .filter((route) => !!route.name)
          .map((route) => {
            const RouteIcon = route.icon;

            if (route.permission) {
              return (
                <Can key={route.path} action={route.permission} matchAny>
                  <NavLink to={to(route.path, true)} exact={route.exact}>
                    {RouteIcon && <RouteIcon {...iconProps} />}
                    <NavigationButton>{route.name}</NavigationButton>
                  </NavLink>
                </Can>
              );
            }

            return (
              <NavLink key={route.path} to={to(route.path, true)} exact={route.exact}>
                {RouteIcon && <RouteIcon {...iconProps} />}
                <NavigationButton>{route.name}</NavigationButton>
              </NavLink>
            );
          })}

        {rootAdmin && (
          // eslint-disable-next-line react/jsx-no-target-blank
          <a href={`/admin/servers/view/${serverId}`} target={"_blank"}>
            <ExternalLink {...iconProps} />
            <NavigationButton>Manage</NavigationButton>
          </a>
        )}

        <CategoryContainer>
          <a>Management</a>
        </CategoryContainer>
        <NavLink to={"/account"} exact>
          <User {...iconProps} />
          <NavigationButton>Account</NavigationButton>
        </NavLink>
        {rootAdmin && (
          <a href={"/admin"} rel={"noreferrer"} css={tw`text-yellow-400!`}>
            <Cog {...iconProps} />
            <NavigationButton>Admin</NavigationButton>
          </a>
        )}
        <a onClick={onTriggerLogout}>
          <LogOut {...iconProps} />
          <NavigationButton>{isLoggingOut ? "Signing Out..." : "Sign Out"}</NavigationButton>
        </a>
      </NavigationBar>
    </Navigation>
  );
};
