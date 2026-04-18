import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/elements/button/index";
import Can from "@/components/elements/Can";
import { ServerContext } from "@/state/server";
import { PowerAction } from "@/components/server/console/ServerConsoleContainer";
import { Dialog } from "@/components/elements/dialog";
import { getExpirationInfo } from "@/lib/serverExpiry";
import http from "@/api/http";
import useFlash from "@/plugins/useFlash";

interface PowerButtonProps {
  className?: string;
}

export default ({ className }: PowerButtonProps) => {
  const [open, setOpen] = useState(false);
  const status = ServerContext.useStoreState((state) => state.status.value);
  const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid ?? "");
  const expDate = ServerContext.useStoreState((state) => state.server.data?.expDate ?? null);

  const { clearFlashes, clearAndAddHttpError } = useFlash();

  const expInfo = useMemo(() => getExpirationInfo(expDate), [expDate]);
  const isExpired = expInfo.expired;

  const killable = status === "stopping";

  const sendPowerSignal = (signal: PowerAction) => {
    if (!uuid) return;

    clearFlashes("server:power");

    http.post(`/api/client/servers/${uuid}/power`, { signal }).catch((error) => {
      clearAndAddHttpError({ key: "server:power", error });
    });
  };

  const onButtonClick = (
    action: PowerAction | "kill-confirmed",
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault();

    if (isExpired) return;

    if (action === "kill") {
      return setOpen(true);
    }

    setOpen(false);
    sendPowerSignal(action === "kill-confirmed" ? "kill" : action);
  };

  useEffect(() => {
    if (status === "offline") {
      setOpen(false);
    }
  }, [status]);

  useEffect(() => {
    if (!isExpired || status !== "running") return;

    sendPowerSignal("stop");
  }, [isExpired, status]);

  return (
    <div className={className}>
      <Dialog.Confirm
        open={open}
        hideCloseIcon
        onClose={() => setOpen(false)}
        title={"Forcibly Stop Process"}
        confirm={"Continue"}
        onConfirmed={onButtonClick.bind(this, "kill-confirmed")}
      >
        Forcibly stopping a server can lead to data corruption.
      </Dialog.Confirm>
      <Can action={"control.start"}>
        <Button
          className={"flex-1"}
          disabled={isExpired || status !== "offline"}
          onClick={onButtonClick.bind(this, "start")}
        >
          Start
        </Button>
      </Can>
      <Can action={"control.restart"}>
        <Button.Text
          className={"flex-1"}
          disabled={isExpired || !status}
          onClick={onButtonClick.bind(this, "restart")}
        >
          Restart
        </Button.Text>
      </Can>
      <Can action={"control.stop"}>
        <Button.Danger
          className={"flex-1"}
          disabled={isExpired || status === "offline"}
          onClick={onButtonClick.bind(this, killable ? "kill" : "stop")}
        >
          {killable ? "Kill" : "Stop"}
        </Button.Danger>
      </Can>
    </div>
  );
};
