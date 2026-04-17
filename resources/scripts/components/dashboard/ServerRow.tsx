import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components/macro";
import tw from "twin.macro";
import { Box, CalendarClock, Cpu, HardDrive, MemoryStick } from "lucide-react";
import { Server } from "@/api/server/getServer";
import getServerResourceUsage, { ServerStats } from "@/api/server/getServerResourceUsage";
import { bytesToString, mbToBytes } from "@/lib/formatters";
import { Button } from "@/components/elements/button/index";
import CopyOnClick from "@/components/elements/CopyOnClick";
import { getElysiumData } from "@/components/elements/elysium/getElysiumData";

type Timer = ReturnType<typeof setInterval>;

const getExpInfo = (expDate: string | null) => {
  if (!expDate) return { label: "Unlimited", expired: false };

  const parsed = new Date(expDate);
  if (Number.isNaN(parsed.getTime())) return { label: expDate, expired: false };

  return {
    label: parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
    expired: parsed.getTime() < Date.now(),
  };
};

const getLifecycleLabel = (server: Server, stats: ServerStats | null) => {
  if (server.status === "suspended" || stats?.isSuspended) {
    return { label: "Suspended", tone: "suspended" as const };
  }

  if (server.isTransferring) {
    return { label: "Transferring", tone: "warning" as const };
  }

  if (server.status === "installing") {
    return { label: "Installing", tone: "warning" as const };
  }

  if (server.status === "restoring_backup") {
    return { label: "Restoring Backup", tone: "warning" as const };
  }

  if (server.status === "install_failed" || server.status === "reinstall_failed") {
    return { label: "Install Failed", tone: "danger" as const };
  }

  if (!stats) {
    return { label: "Connecting", tone: "warning" as const };
  }

  switch (stats.status) {
    case "running":
      return { label: "Running", tone: "success" as const };
    case "starting":
      return { label: "Starting", tone: "success" as const };
    case "stopping":
      return { label: "Stopping", tone: "danger" as const };
    default:
      return { label: "Stopped", tone: "danger" as const };
  }
};

export default memo(({ server }: { server: Server }) => {
  const serverBackground = JSON.parse(getElysiumData("--server-background"));
  const [stats, setStats] = useState<ServerStats | null>(null);
  const pollingInterval = useRef<Timer | null>(null);

  useEffect(() => {
    let mounted = true;

    const poll = () => {
      getServerResourceUsage(server.uuid)
        .then((data) => {
          if (mounted) setStats(data);
        })
        .catch((error) => console.error(error));
    };

    poll();
    pollingInterval.current = setInterval(poll, 30000);

    return () => {
      mounted = false;
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [server.uuid]);

  const diskLimit = server.limits.disk !== 0 ? bytesToString(mbToBytes(server.limits.disk)) : "Unlimited";
  const memoryLimit = server.limits.memory !== 0 ? bytesToString(mbToBytes(server.limits.memory)) : "Unlimited";
  const cpuLimit = server.limits.cpu !== 0 ? `${server.limits.cpu}%` : "Unlimited";
  const expInfo = getExpInfo(server.expDate);
  const lifecycle = getLifecycleLabel(server, stats);

  const statusStyle = useMemo(() => {
    if (lifecycle.tone === "success") return tw`bg-green-500/90 text-white`;
    if (lifecycle.tone === "warning") return tw`bg-yellow-500/90 text-black`;
    if (lifecycle.tone === "suspended") return tw`bg-red-700/90 text-white`;

    return tw`bg-red-500/90 text-white`;
  }, [lifecycle.tone]);

  const BackgroundDiv = styled.div`
    ${tw`w-full min-h-[170px] py-4 rounded-xl relative`}
    background: linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url(${serverBackground});
    background-size: cover;
    background-position: center;
  `;

  const defaultAllocation = server.allocations.find((alloc) => alloc.isDefault);

  return (
    <div css={tw`text-neutral-50 bg-elysium-color3 rounded-xl shadow-lg p-3 relative`}>
      <BackgroundDiv>
        <span css={[tw`absolute top-3 right-3 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide`, statusStyle]}>
          {lifecycle.label}
        </span>

        <div css={tw`absolute left-4 bottom-4 right-36 sm:right-44`}>
          <p css={tw`font-bold text-left w-full truncate`} title={server.name}>
            {server.name}
          </p>

          <div css={tw`uppercase text-sm font-semibold text-left w-full truncate`}>
            {defaultAllocation && (
              <CopyOnClick text={`${defaultAllocation.alias || defaultAllocation.ip}:${defaultAllocation.port}`}>
                <span css={tw`cursor-pointer`} title={`${defaultAllocation.alias || defaultAllocation.ip}:${defaultAllocation.port}`}>
                  {defaultAllocation.alias || defaultAllocation.ip}:{defaultAllocation.port}
                </span>
              </CopyOnClick>
            )}
          </div>
        </div>

        <div css={tw`absolute right-3 bottom-3 max-w-[45%]`}>
          <span css={tw`text-[11px] bg-black/40 px-2.5 py-1 rounded-full inline-flex items-center gap-1 whitespace-nowrap`}>
            <CalendarClock size={13} />
            <span>Expired:</span>
            <span css={tw`font-semibold truncate`}>{expInfo.label}</span>
            {expInfo.expired && <span css={tw`text-red-300`}>(Expired)</span>}
          </span>
        </div>
      </BackgroundDiv>

      <div css={tw`grid grid-cols-1 md:grid-cols-2 gap-x-2 sm:gap-x-4 mt-3 mb-4 gap-y-2 mx-4 rounded-xl`}>
        <div css={tw`overflow-hidden whitespace-nowrap`}>
          <div css={tw`flex items-center`}>
            <Box size={15} />
            <span css={tw`ml-2 uppercase font-semibold`}>ID</span>
          </div>
          <p>{server.id}</p>
        </div>

        <div css={tw`overflow-hidden whitespace-nowrap`}>
          <div css={tw`flex items-center`}>
            <Cpu size={15} />
            <span css={tw`ml-2 uppercase font-semibold`}>CPU</span>
          </div>
          <p>{stats ? `${stats.cpuUsagePercent.toFixed(2)}% / ${cpuLimit}` : lifecycle.label}</p>
        </div>

        <div css={tw`overflow-hidden whitespace-nowrap`}>
          <div css={tw`flex items-center`}>
            <MemoryStick size={15} />
            <span css={tw`ml-2 uppercase font-semibold`}>Memory</span>
          </div>
          <p>{stats ? `${bytesToString(stats.memoryUsageInBytes)} / ${memoryLimit}` : lifecycle.label}</p>
        </div>

        <div css={tw`overflow-hidden whitespace-nowrap`}>
          <div css={tw`flex items-center`}>
            <HardDrive size={15} />
            <span css={tw`ml-2 uppercase font-semibold`}>Disk</span>
          </div>
          <p>{stats ? `${bytesToString(stats.diskUsageInBytes)} / ${diskLimit}` : lifecycle.label}</p>
        </div>
      </div>

      <Link to={`/server/${server.id}`}>
        <Button css={tw`block w-full`} disabled={expInfo.expired}>
          <span css={tw`overflow-hidden whitespace-nowrap`}>{expInfo.expired ? "Server Expired" : "Manage Server"}</span>
        </Button>
      </Link>
    </div>
  );
});
