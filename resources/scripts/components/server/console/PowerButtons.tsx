import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/elements/button/index";
import Can from "@/components/elements/Can";
import { ServerContext } from "@/state/server";
import { PowerAction } from "@/components/server/console/ServerConsoleContainer";
import { Dialog } from "@/components/elements/dialog";
import { getExpirationInfo } from "@/lib/serverExpiry";

interface PowerButtonProps {
  className?: string;
}

export default ({ className }: PowerButtonProps) => {
  const [open, setOpen] = useState(false);
  const status = ServerContext.useStoreState((state) => state.status.value);
  const expDate = ServerContext.useStoreState((state) => state.server.data?.expDate ?? null);
  const instance = ServerContext.useStoreState((state) => state.socket.instance);

  const expInfo = useMemo(() => getExpirationInfo(expDate), [expDate]);
  const isExpired = expInfo.expired;

  const killable = status === "stopping";
  const onButtonClick = (
    action: PowerAction | "kill-confirmed",
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    e.preventDefault();

    if (isExpired) return;

    if (action === "kill") {
      return setOpen(true);
    }

    if (instance) {
      setOpen(false);
      instance.send("set state", action === "kill-confirmed" ? "kill" : action);
    }
  };

  useEffect(() => {
    if (status === "offline") {
      setOpen(false);
    }
  }, [status]);

  useEffect(() => {
    if (!isExpired || !instance || status !== "running") return;

    instance.send("set state", "stop");
  }, [isExpired, instance, status]);

  return (
    <div className={className}>
      {isExpired && (
        <div className={"basis-full w-full rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-200"}>
          Notice: server ini sudah expired. Aksi Start, Restart, dan Stop dinonaktifkan. Silakan perpanjang masa aktif atau hubungi admin.
        </div>
      )}
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
