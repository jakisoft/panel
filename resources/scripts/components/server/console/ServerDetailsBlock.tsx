import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Box,
  CheckCircle2,
  CircleOff,
  CloudDownload,
  CloudUpload,
  Cpu,
  Fingerprint,
  HardDrive,
  Lightbulb,
  MapPin,
  Globe,
  Server,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { bytesToString, ip, mbToBytes } from "@/lib/formatters";
import { ServerContext } from "@/state/server";
import { SocketEvent, SocketRequest } from "@/components/server/events";
import UptimeDuration from "@/components/server/UptimeDuration";
import useWebsocketEvent from "@/plugins/useWebsocketEvent";
import tw from "twin.macro";
import CopyOnClick from "@/components/elements/CopyOnClick";
import { capitalize } from "@/lib/strings";
import TitledGreyBox from "@/components/elements/TitledGreyBox";

type Stats = Record<"memory" | "cpu" | "disk" | "uptime" | "rx" | "tx", number>;

const iconSize = 15;

const formatExpDate = (expDate: string | null) => {
  if (!expDate) {
    return { label: "Unlimited", expired: false };
  }

  const parsed = new Date(expDate);
  if (Number.isNaN(parsed.getTime())) {
    return { label: expDate, expired: false };
  }

  return {
    label: parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    expired: parsed.getTime() < Date.now(),
  };
};

const ServerDetailsBlock = () => {
  const [stats, setStats] = useState<Stats>({
    memory: 0,
    cpu: 0,
    disk: 0,
    uptime: 0,
    tx: 0,
    rx: 0,
  });

  const powerStatus = ServerContext.useStoreState((state) => state.status.value);
  const connected = ServerContext.useStoreState((state) => state.socket.connected);
  const instance = ServerContext.useStoreState((state) => state.socket.instance);
  const serverData = ServerContext.useStoreState((state) => state.server.data!);

  const diskLimit = serverData.limits.disk !== 0 ? bytesToString(mbToBytes(serverData.limits.disk)) : "Unlimited";
  const memoryLimit = serverData.limits.memory !== 0 ? bytesToString(mbToBytes(serverData.limits.memory)) : "Unlimited";
  const cpuLimit = serverData.limits.cpu !== 0 ? `${serverData.limits.cpu}%` : "Unlimited";

  const allocation = useMemo(() => {
    const match = serverData.allocations.find((item) => item.isDefault);
    return !match ? "n/a" : `${match.alias || ip(match.ip)}:${match.port}`;
  }, [serverData.allocations]);

  const resolvedStatus = useMemo(() => {
    if (serverData.status === "suspended") return "suspended";
    if (serverData.status === "installing") return "installing";
    if (serverData.status === "restoring_backup") return "restoring_backup";
    if (serverData.status === "install_failed" || serverData.status === "reinstall_failed") return "install_failed";

    return powerStatus ?? "offline";
  }, [powerStatus, serverData.status]);

  const statusLabel = useMemo(() => {
    switch (resolvedStatus) {
      case "running":
        return "Running";
      case "starting":
        return "Starting";
      case "stopping":
        return "Stopping";
      case "suspended":
        return "Suspended";
      case "installing":
        return "Installing";
      case "restoring_backup":
        return "Restoring Backup";
      case "install_failed":
        return "Install Failed";
      default:
        return "Offline";
    }
  }, [resolvedStatus]);

  const expInfo = formatExpDate(serverData.expDate);

  useEffect(() => {
    if (!connected || !instance) return;
    instance.send(SocketRequest.SEND_STATS);
  }, [instance, connected]);

  useWebsocketEvent(SocketEvent.STATS, (data) => {
    let parsed: any = {};
    try {
      parsed = JSON.parse(data);
    } catch {
      return;
    }

    setStats({
      memory: parsed.memory_bytes,
      cpu: parsed.cpu_absolute,
      disk: parsed.disk_bytes,
      tx: parsed.network.tx_bytes,
      rx: parsed.network.rx_bytes,
      uptime: parsed.uptime || 0,
    });
  });

  return (
    <div css={tw`w-full md:flex gap-6`}>
      <div css={tw`w-full md:flex-1 md:mb-0 mb-5`}>
        <TitledGreyBox icon={<Server size={18} />} title={"Server Info"}>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <Fingerprint size={iconSize} />
              <span css={tw`ml-2 uppercase font-semibold`}>NAME</span>
            </div>
            <p css={tw`mb-4`}>{serverData.name}</p>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <Lightbulb size={iconSize} />
              <span css={tw`ml-2 uppercase font-semibold`}>STATUS</span>
            </div>
            <p css={tw`mb-4`}>{statusLabel}</p>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <Timer size={iconSize} />
              <span css={tw`ml-2 uppercase font-semibold`}>EXPIRED DATE</span>
            </div>
            <div css={tw`mb-4 flex items-center`}>
              <span>{expInfo.label}</span>
              {expInfo.expired && (
                <span css={tw`ml-2 text-[10px] uppercase px-2 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/30`}>
                  Expired
                </span>
              )}
            </div>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <Box size={iconSize} />
              <span css={tw`ml-2 uppercase font-semibold`}>UUID</span>
            </div>
            <CopyOnClick text={serverData.uuid}>
              <p css={tw`mb-4`}>{serverData.uuid}</p>
            </CopyOnClick>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <MapPin size={iconSize} />
              <span css={tw`ml-2 uppercase font-semibold`}>NODE</span>
            </div>
            <p css={tw`mb-4`}>{serverData.node}</p>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <Activity size={iconSize} />
              <span css={tw`ml-2 uppercase font-semibold`}>ADDRESS</span>
            </div>
            <CopyOnClick text={allocation}>
              <p css={tw`mb-4`}>{allocation}</p>
            </CopyOnClick>
          </div>
        </TitledGreyBox>
      </div>

      <div css={tw`w-full md:flex-1`}>
        <TitledGreyBox icon={<Cpu size={18} />} title={"System Info"}>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <Timer size={iconSize} />
              <span css={tw`ml-2 uppercase font-semibold`}>UPTIME</span>
            </div>
            <p css={tw`mb-4`}>
              {resolvedStatus === "offline"
                ? "Offline"
                : stats.uptime > 0
                ? <UptimeDuration uptime={stats.uptime / 1000} />
                : capitalize(resolvedStatus)}
            </p>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <Cpu size={iconSize} />
              <span css={tw`ml-2 uppercase font-semibold`}>CPU</span>
            </div>
            <p css={tw`mb-4`}>
              {resolvedStatus === "offline" ? "Offline" : `${stats.cpu.toFixed(2)}% / ${cpuLimit}`}
            </p>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <Server size={iconSize} />
              <span css={tw`ml-2 uppercase font-semibold`}>MEMORY</span>
            </div>
            <p css={tw`mb-4`}>
              {resolvedStatus === "offline" ? "Offline" : `${bytesToString(stats.memory)} / ${memoryLimit}`}
            </p>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <HardDrive size={iconSize} />
              <span css={tw`ml-2 uppercase font-semibold`}>DISK</span>
            </div>
            <p css={tw`mb-4`}>
              {resolvedStatus === "offline" ? "Offline" : `${bytesToString(stats.disk)} / ${diskLimit}`}
            </p>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <Globe size={iconSize} />
              <span css={tw`ml-2 uppercase font-semibold`}>NETWORK</span>
            </div>
            {resolvedStatus === "offline" ? (
              <div css={tw`flex items-center mb-4`}>
                {resolvedStatus === "install_failed" ? <TriangleAlert size={14} /> : <CircleOff size={14} />}
                <p css={tw`ml-1`}>{statusLabel}</p>
              </div>
            ) : (
              <div css={tw`flex items-center mb-4`}>
                <CloudDownload size={14} />
                <p css={tw`ml-1`}>{bytesToString(stats.rx)}</p>
                <CloudUpload size={14} css={tw`ml-3`} />
                <p css={tw`ml-1`}>{bytesToString(stats.tx)}</p>
                <CheckCircle2 size={14} css={tw`ml-3 text-green-400`} />
              </div>
            )}
          </div>
        </TitledGreyBox>
      </div>
    </div>
  );
};

export default ServerDetailsBlock;
