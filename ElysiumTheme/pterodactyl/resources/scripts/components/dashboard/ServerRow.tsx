import React, { memo, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHdd,
  faMemory,
  faMicrochip,
  faBox,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { Server } from "@/api/server/getServer";
import getServerResourceUsage, {
  ServerStats,
  ServerPowerState,
} from "@/api/server/getServerResourceUsage";
import { bytesToString, mbToBytes } from "@/lib/formatters";
import tw, { TwStyle } from "twin.macro";
import styled from "styled-components/macro";
import { Button } from "@/components/elements/button/index";
import CopyOnClick from "@/components/elements/CopyOnClick";
import { ServerContext } from "@/state/server";
import { getElysiumData } from "@/components/elements/elysium/getElysiumData";

type Timer = ReturnType<typeof setInterval>;

export default ({ server }: { server: Server }) => {
  const server_background = JSON.parse(getElysiumData("--server-background"));
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [status, setStatus] = useState<ServerPowerState | null>(null);
  const interval = useRef<Timer>(null) as React.MutableRefObject<Timer>;
  const [isSuspended, setIsSuspended] = useState(server.status === "suspended");

  const getStats = () =>
    getServerResourceUsage(server.uuid)
      .then((data) => setStats(data))
      .catch((error) => console.error(error));

  useEffect(() => {
    setIsSuspended(stats?.isSuspended || server.status === "suspended");
  }, [stats?.isSuspended, server.status]);

  useEffect(() => {
    // Don't waste a HTTP request if there is nothing important to show to the user because
    // the server is suspended.
    if (isSuspended) return;

    getStats().then(() => {
      interval.current = setInterval(() => getStats(), 30000);
    });

    return () => {
      interval.current && clearInterval(interval.current);
    };
  }, [isSuspended]);

  const getStatus = () =>
    getServerResourceUsage(server.uuid)
      .then((data) => {
        setStatus(data.status);
      })
      .catch((error) => console.error(error));

  useEffect(() => {
    if (status) return;

    getStatus().then(() => {
      interval.current = setInterval(() => getStats(), 30000);
    });

    return () => {
      interval.current && clearInterval(interval.current);
    };
  }, [status]);

  const diskLimit =
    server.limits.disk !== 0
      ? bytesToString(mbToBytes(server.limits.disk))
      : "Unlimited";
  const memoryLimit =
    server.limits.memory !== 0
      ? bytesToString(mbToBytes(server.limits.memory))
      : "Unlimited";
  const cpuLimit =
    server.limits.cpu !== 0 ? server.limits.cpu + " %" : "Unlimited";

  const BackgroundDiv = styled.div`
    ${tw`w-full py-10 rounded-xl`}
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
        url(${server_background});
    background-size: cover;
    background-position: center;
  `;

  return (
    <>
      <div css={tw`text-neutral-50 bg-elysium-color3 rounded-xl shadow-lg p-3`}>
        <BackgroundDiv>
          <a
            css={tw`font-bold overflow-hidden whitespace-nowrap flex justify-center`}
          >
            {server.name}
          </a>
          <div
            css={tw`uppercase font-semibold overflow-hidden whitespace-nowrap flex justify-center`}
          >
            {server.allocations
              .filter((alloc) => alloc.isDefault)
              .map((allocation) => (
                <React.Fragment
                  key={allocation.ip + allocation.port.toString()}
                >
                  <CopyOnClick
                    text={`${allocation.alias || allocation.ip}:${
                      allocation.port
                    }`}
                  >
                    <a>
                      {allocation.alias || allocation.ip}:{allocation.port}
                    </a>
                  </CopyOnClick>
                </React.Fragment>
              ))}
          </div>
          <div
            css={tw`uppercase font-semibold overflow-hidden whitespace-nowrap flex justify-center`}
          >
            {!stats || isSuspended ? (
              isSuspended ? (
                <div css={tw`flex-1 text-center`}>
                  <span css={tw`bg-red-600 rounded px-2 py-1 text-xs`}>
                    {server.status === "suspended"
                      ? "Suspended"
                      : "Connecting.."}
                  </span>
                </div>
              ) : server.isTransferring || server.status ? (
                <div css={tw`flex-1 text-center`}>
                  <span css={tw`bg-yellow-500 rounded px-2 py-1 text-xs`}>
                    {server.isTransferring
                      ? "Transferring"
                      : server.status === "installing"
                      ? "Installing"
                      : server.status === "restoring_backup"
                      ? "Restoring Backup"
                      : "Connecting.."}
                  </span>
                </div>
              ) : (
                <div css={tw`flex-1 text-center`}>
                  <span css={tw`bg-red-500 rounded px-2 py-1 text-xs`}>
                    Connecting..
                  </span>
                </div>
              )
            ) : (
              <div css={tw`flex-1 text-center`}>
                <span
                  css={[
                    tw`rounded px-2 py-1 text-neutral-100 text-xs`,
                    status === "running" ? tw`bg-green-500` : tw`bg-red-500`,
                  ]}
                >
                  <span>{status === "running" ? "Running" : "Offline"}</span>
                </span>
              </div>
            )}
          </div>
        </BackgroundDiv>
        {!stats || isSuspended ? (
          isSuspended ? (
            <div
              css={tw`grid grid-cols-1 md:grid-cols-2 gap-x-2 sm:gap-x-4 mt-3 mb-4 gap-y-2 mx-4 my-4 rounded-xl`}
            >
              {["ID", "CPU", "MEMORY", "DISK"].map((label, index) => (
                <div key={index} css={tw`overflow-hidden whitespace-nowrap`}>
                  <div css={tw`flex items-center`}>
                    <div>
                      {index === 0 && <FontAwesomeIcon icon={faBox} />}
                      {index === 1 && <FontAwesomeIcon icon={faMicrochip} />}
                      {index === 2 && <FontAwesomeIcon icon={faMemory} />}
                      {index === 3 && <FontAwesomeIcon icon={faHdd} />}
                    </div>
                    <a css={tw`ml-2 uppercase font-semibold`}>{label}</a>
                  </div>
                  <p css={tw`font-normal uppercase`}>
                    {index === 0 && server.id}
                    {index === 1 &&
                      `${
                        server.status === "suspended"
                          ? `Suspended`
                          : "Connecting.."
                      }`}
                    {index === 2 &&
                      `${
                        server.status === "suspended"
                          ? `Suspended`
                          : "Connecting.."
                      }`}
                    {index === 3 &&
                      `${
                        server.status === "suspended"
                          ? `Suspended`
                          : "Connecting.."
                      }`}
                  </p>
                </div>
              ))}
            </div>
          ) : server.isTransferring || server.status ? (
            <div
              css={tw`grid grid-cols-1 md:grid-cols-2 gap-x-2 sm:gap-x-4 mt-3 mb-4 gap-y-2 mx-4 my-4 rounded-xl`}
            >
              {["ID", "CPU", "MEMORY", "DISK"].map((label, index) => (
                <div key={index} css={tw`overflow-hidden whitespace-nowrap`}>
                  <div css={tw`flex items-center`}>
                    <div>
                      {index === 0 && <FontAwesomeIcon icon={faBox} />}
                      {index === 1 && <FontAwesomeIcon icon={faMicrochip} />}
                      {index === 2 && <FontAwesomeIcon icon={faMemory} />}
                      {index === 3 && <FontAwesomeIcon icon={faHdd} />}
                    </div>
                    <a css={tw`ml-2 uppercase font-semibold`}>{label}</a>
                  </div>
                  <p css={tw`font-normal uppercase`}>
                    {[
                      index === 0 && server.id,
                      index === 1 || index === 2 || index === 3
                        ? server.isTransferring
                          ? "Transferring"
                          : server.status === "installing"
                          ? "Installing"
                          : server.status === "restoring_backup"
                          ? "Restoring Backup"
                          : "Connecting.."
                        : null,
                    ]}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div
              css={tw`grid grid-cols-1 md:grid-cols-2 gap-x-2 sm:gap-x-4 mt-3 mb-4 gap-y-2 mx-4 my-4 rounded-xl`}
            >
              {["ID", "CPU", "MEMORY", "DISK"].map((label, index) => (
                <div key={index} css={tw`overflow-hidden whitespace-nowrap`}>
                  <div css={tw`flex items-center`}>
                    <div>
                      {index === 0 && <FontAwesomeIcon icon={faBox} />}
                      {index === 1 && <FontAwesomeIcon icon={faMicrochip} />}
                      {index === 2 && <FontAwesomeIcon icon={faMemory} />}
                      {index === 3 && <FontAwesomeIcon icon={faHdd} />}
                    </div>
                    <a css={tw`ml-2 uppercase font-semibold`}>{label}</a>
                  </div>
                  <p css={tw`font-normal uppercase`}>
                    {index === 0 && server.id}
                    {index === 1 && `Connecting..`}
                    {index === 2 && `Connecting..`}
                    {index === 3 && `Connecting..`}
                  </p>
                </div>
              ))}
            </div>
          )
        ) : (
          <div
            css={tw`grid grid-cols-1 md:grid-cols-2 gap-x-2 sm:gap-x-4 mt-3 mb-4 gap-y-2 mx-4 my-4 rounded-xl`}
          >
            {["ID", "CPU", "MEMORY", "DISK"].map((label, index) => (
              <div key={index} css={tw`overflow-hidden whitespace-nowrap`}>
                <div css={tw`flex items-center`}>
                  <div>
                    {index === 0 && <FontAwesomeIcon icon={faBox} />}
                    {index === 1 && <FontAwesomeIcon icon={faMicrochip} />}
                    {index === 2 && <FontAwesomeIcon icon={faMemory} />}
                    {index === 3 && <FontAwesomeIcon icon={faHdd} />}
                  </div>
                  <a css={tw`ml-2 uppercase font-semibold`}>{label}</a>
                </div>
                <p css={tw`font-normal`}>
                  {index === 0 && server.id}
                  {index === 1 &&
                    `${stats.cpuUsagePercent.toFixed(2)}% / ${cpuLimit}`}
                  {index === 2 &&
                    `${bytesToString(
                      stats.memoryUsageInBytes
                    )} / ${memoryLimit}`}
                  {index === 3 &&
                    `${bytesToString(stats.diskUsageInBytes)} / ${diskLimit}`}
                </p>
              </div>
            ))}
          </div>
        )}
        <Link to={`/server/${server.id}`}>
          <Button css={tw`block w-full`}>
            <span css={tw`overflow-hidden whitespace-nowrap`}>
              Manage Server
            </span>
          </Button>
        </Link>
      </div>
    </>
  );
};
