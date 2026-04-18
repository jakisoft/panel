import React, { memo, useMemo } from "react";
import { ServerContext } from "@/state/server";
import Can from "@/components/elements/Can";
import ServerContentBlock from "@/components/elements/ServerContentBlock";
import isEqual from "react-fast-compare";
import Spinner from "@/components/elements/Spinner";
import Features from "@feature/Features";
import Console from "@/components/server/console/Console";
import StatGraphs from "@/components/server/console/StatGraphs";
import PowerButtons from "@/components/server/console/PowerButtons";
import ServerDetailsBlock from "@/components/server/console/ServerDetailsBlock";
import { Alert } from "@/components/elements/alert";
import TitledGreyBox from "@/components/elements/TitledGreyBox";
import tw from "twin.macro";
import ContentBox from "@/components/elements/ContentBox";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { getExpirationInfo } from "@/lib/serverExpiry";

export type PowerAction = "start" | "stop" | "restart" | "kill";

const ServerConsoleContainer = () => {
  const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
  const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
  const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
  const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);
  const expDate = ServerContext.useStoreState((state) => state.server.data?.expDate ?? null);

  const expInfo = useMemo(() => getExpirationInfo(expDate), [expDate]);

  return (
    <ServerContentBlock title={"Console"}>
      <div css={tw`my-4`}>
        {(isNodeUnderMaintenance || isInstalling || isTransferring || expInfo.expired) && (
          <Alert type={expInfo.expired ? "warning" : "warning"}>
            {expInfo.expired
              ? "Server ini sudah expired. Console dan kontrol power dinonaktifkan. Silakan perpanjang masa aktif atau hubungi admin."
              : isNodeUnderMaintenance
              ? "The node of this server is currently under maintenance and all actions are unavailable."
              : isInstalling
              ? "This server is currently running its installation process and most actions are unavailable."
              : "This server is currently being transferred to another node and all actions are unavailable."}
          </Alert>
        )}
      </div>
      <div css={tw`mb-5`}>
        <ContentBox>
          <div css={tw`w-full h-[600px] flex mb-5 relative`}>
            <div css={expInfo.expired ? tw`w-full pointer-events-none opacity-45` : tw`w-full`}>
              <Spinner.Suspense>
                <Console />
              </Spinner.Suspense>
            </div>

            {expInfo.expired && (
              <div css={tw`absolute inset-0 flex items-center justify-center bg-black/55 rounded-md backdrop-blur-sm`}>
                <div css={tw`text-center max-w-xl px-6`}>
                  <p css={tw`text-yellow-300 text-lg font-bold mb-2`}>Server Expired</p>
                  <p css={tw`text-neutral-100 text-sm`}>Console tidak dapat digunakan. Silakan perpanjang masa aktif server atau hubungi admin.</p>
                </div>
              </div>
            )}
          </div>
          <div css={tw`w-full justify-between items-center`}>
            <Can action={["control.start", "control.stop", "control.restart"]} matchAny>
              <PowerButtons className={"flex space-x-2"} />
            </Can>
          </div>
        </ContentBox>
      </div>
      <div>
        <ServerDetailsBlock />
      </div>
      <div css={tw`mt-5`}>
        <TitledGreyBox icon={faChartLine} title={"Stat Graphs"}>
          <div css={tw`grid grid-cols-1 gap-2 sm:gap-4 md:grid-cols-3`}>
            <Spinner.Suspense>
              <StatGraphs />
            </Spinner.Suspense>
          </div>
        </TitledGreyBox>
      </div>
      <Features enabled={eggFeatures} />
    </ServerContentBlock>
  );
};

export default memo(ServerConsoleContainer, isEqual);
