import * as React from "react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useStoreState } from "easy-peasy";
import { AlertTriangle, Cog, Key, Layers, LogOut, Mail, User, Wrench } from "lucide-react";
import { ApplicationStore } from "@/state";
import SearchContainer from "@/components/dashboard/search/SearchContainer";
import tw from "twin.macro";
import http from "@/api/http";
import Navigation from "@/components/elements/elysium/navigation/Navigation";
import NavigationBar from "@/components/elements/elysium/navigation/NavigationBar";
import LogoContainer from "@/components/elements/elysium/navigation/LogoContainer";
import CategoryContainer from "@/components/elements/elysium/navigation/CategoryContainer";
import NavigationButton from "@/components/elements/elysium/navigation/NavigationButton";
import { getElysiumData } from "@/components/elements/elysium/getElysiumData";
import { Dialog } from "@/components/elements/dialog";

const iconProps = { size: 16 };

export default () => {
  const logo = JSON.parse(getElysiumData("--logo"));
  const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
  const rootAdmin = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const onConfirmLogout = () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);

    http.post("/auth/logout").finally(() => {
      // @ts-expect-error this is valid
      window.location = "/";
    });
  };

  const onTriggerLogout = () => setShowLogoutConfirm(true);

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
          <a>Management</a>
        </CategoryContainer>
        <NavLink to={"/account"} exact>
          <User {...iconProps} />
          <NavigationButton>Account</NavigationButton>
        </NavLink>
        <NavLink to={"/account/api"} exact>
          <Key {...iconProps} />
          <NavigationButton>Api Key</NavigationButton>
        </NavLink>
        <NavLink to={"/account/ssh"} exact>
          <Wrench {...iconProps} />
          <NavigationButton>Ssh Key</NavigationButton>
        </NavLink>
        <NavLink to={"/account/activity"} exact>
          <Mail {...iconProps} />
          <NavigationButton>Activity</NavigationButton>
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

      <Dialog.Confirm
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirmed={onConfirmLogout}
        title={"Logout Confirmation"}
        confirm={"Logout"}
      >
        <div css={tw`space-y-3 text-center`}>
          <div css={tw`w-12 h-12 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400`}>
            <AlertTriangle size={20} />
          </div>
          <p css={tw`text-sm text-neutral-300`}>Yakin mau logout dari panel ini?</p>
        </div>
      </Dialog.Confirm>
    </Navigation>
  );
};
