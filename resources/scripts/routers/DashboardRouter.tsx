import React from "react";
import { NavLink, Route, Switch } from "react-router-dom";
import NavigationBar from "@/components/NavigationBar";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import PricingContainer from "@/components/dashboard/PricingContainer";
import { NotFound } from "@/components/elements/ScreenBlock";
import TransitionRouter from "@/TransitionRouter";
import SubNavigation from "@/components/elements/SubNavigation";
import { useLocation } from "react-router";
import Spinner from "@/components/elements/Spinner";
import routes from "@/routers/routes";
import tw from "twin.macro";
import Announcement from "@/components/elements/elysium/announcement/Announcement";

export default () => {
  const location = useLocation();

  return (
    <>
      <NavigationBar />
      <div css={tw`container mx-auto w-4/5`}>
        <Announcement />
        <TransitionRouter>
          <React.Suspense fallback={<Spinner centered />}>
            <Switch location={location}>
              <Route path={"/"} exact>
                <DashboardContainer />
              </Route>
              <Route path={"/pricing"} exact>
                <PricingContainer />
              </Route>
              {routes.account.map(({ path, component: Component }) => (
                <Route
                  key={path}
                  path={`/account/${path}`.replace("//", "/")}
                  exact
                >
                  <Component />
                </Route>
              ))}
              <Route path={"*"}>
                <NotFound />
              </Route>
            </Switch>
          </React.Suspense>
        </TransitionRouter>
      </div>
    </>
  );
};
