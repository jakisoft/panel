import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDesktop,
  faClock,
  faCloudDownloadAlt,
  faCloudUploadAlt,
  faHdd,
  faMemory,
  faMicrochip,
  faWifi,
  faLightbulb,
  faBox,
  faLocationArrow,
  faSignal,
  faServer,
  faFingerprint,
} from "@fortawesome/free-solid-svg-icons";
import { bytesToString, ip, mbToBytes } from "@/lib/formatters";
import { ServerContext } from "@/state/server";
import { SocketEvent, SocketRequest } from "@/components/server/events";
import UptimeDuration from "@/components/server/UptimeDuration";
import StatBlock from "@/components/server/console/StatBlock";
import useWebsocketEvent from "@/plugins/useWebsocketEvent";
import tw from "twin.macro";
import CopyOnClick from "@/components/elements/CopyOnClick";
import { capitalize } from "@/lib/strings";
import TitledGreyBox from "@/components/elements/TitledGreyBox";

type Stats = Record<"memory" | "cpu" | "disk" | "uptime" | "rx" | "tx", number>;

const ServerDetailsBlock = () => {
  const [stats, setStats] = useState<Stats>({
    memory: 0,
    cpu: 0,
    disk: 0,
    uptime: 0,
    tx: 0,
    rx: 0,
  });

  const status = ServerContext.useStoreState((state) => state.status.value);
  const connected = ServerContext.useStoreState(
    (state) => state.socket.connected
  );
  const instance = ServerContext.useStoreState(
    (state) => state.socket.instance
  );

  const name = ServerContext.useStoreState((state) => state.server.data!.name);
  const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
  const node = ServerContext.useStoreState((state) => state.server.data!.node);
  const limits = ServerContext.useStoreState(
    (state) => state.server.data!.limits
  );

  const diskLimit =
    limits.disk !== 0 ? bytesToString(mbToBytes(limits.disk)) : "Unlimited";
  const memoryLimit =
    limits.memory !== 0 ? bytesToString(mbToBytes(limits.memory)) : "Unlimited";
  const cpuLimit = limits.cpu !== 0 ? limits.cpu + "%" : "Unlimited";

  const allocation = ServerContext.useStoreState((state) => {
    const match = state.server.data!.allocations.find(
      (allocation) => allocation.isDefault
    );

    return !match ? "n/a" : `${match.alias || ip(match.ip)}:${match.port}`;
  });

  useEffect(() => {
    if (!connected || !instance) {
      return;
    }

    instance.send(SocketRequest.SEND_STATS);
  }, [instance, connected]);

  useWebsocketEvent(SocketEvent.STATS, (data) => {
    let stats: any = {};
    try {
      stats = JSON.parse(data);
    } catch (e) {
      return;
    }

    setStats({
      memory: stats.memory_bytes,
      cpu: stats.cpu_absolute,
      disk: stats.disk_bytes,
      tx: stats.network.tx_bytes,
      rx: stats.network.rx_bytes,
      uptime: stats.uptime || 0,
    });
  });

  return (
    <div css={tw`w-full md:flex gap-6`}>
      <div css={tw`w-full md:flex-1 md:mb-0 mb-5`}>
        <TitledGreyBox icon={faServer} title={"Server Info"}>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <div>
                <FontAwesomeIcon icon={faFingerprint} />
              </div>
              <a css={tw`ml-2 uppercase font-semibold`}>NAME</a>
            </div>
            <p css={tw`mb-4`}>{name}</p>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <div>
                <FontAwesomeIcon icon={faLightbulb} />
              </div>
              <a css={tw`ml-2 uppercase font-semibold`}>STATUS</a>
            </div>
            <p css={tw`mb-4`}>
              {status === "starting" ||
              status === "stopping" ||
              status === "running"
                ? capitalize(status)
                : "Offline"}
            </p>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <div>
                <FontAwesomeIcon icon={faBox} />
              </div>
              <a css={tw`ml-2 uppercase font-semibold`}>UUID</a>
            </div>
            <CopyOnClick text={uuid}>
              <p css={tw`mb-4`}>{uuid}</p>
            </CopyOnClick>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <div>
                <FontAwesomeIcon icon={faLocationArrow} />
              </div>
              <a css={tw`ml-2 uppercase font-semibold`}>NODE</a>
            </div>
            <p css={tw`mb-4`}>{node}</p>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <div>
                <FontAwesomeIcon icon={faSignal} />
              </div>
              <a css={tw`ml-2 uppercase font-semibold`}>ADDRESS</a>
            </div>
            <CopyOnClick text={allocation}>
              <p css={tw`mb-4`}>{allocation}</p>
            </CopyOnClick>
          </div>
        </TitledGreyBox>
      </div>
      <div css={tw`w-full md:flex-1`}>
        <TitledGreyBox icon={faDesktop} title={"System Info"}>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <div>
                <FontAwesomeIcon icon={faClock} />
              </div>
              <a css={tw`ml-2 uppercase font-semibold `}>UPTIME</a>
            </div>
            <p css={tw`mb-4`}>
              {status === "starting" || status === "stopping" ? (
                capitalize(status)
              ) : stats.uptime > 0 ? (
                <UptimeDuration uptime={stats.uptime / 1000} />
              ) : (
                "Offline"
              )}
            </p>
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <div>
                <FontAwesomeIcon icon={faMicrochip} />
              </div>
              <a css={tw`ml-2 uppercase font-semibold`}>CPU</a>
            </div>
            {status === "offline" ? (
              <p css={tw`mb-4`}>Offline</p>
            ) : (
              <p css={tw`mb-4`}>
                {stats.cpu.toFixed(2)}% / {cpuLimit}
              </p>
            )}
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <div>
                <FontAwesomeIcon icon={faMemory} />
              </div>
              <a css={tw`ml-2 uppercase font-semibold`}>MEMORY</a>
            </div>
            {status === "offline" ? (
              <p css={tw`mb-4`}>Offline</p>
            ) : (
              <p css={tw`mb-4`}>
                {bytesToString(stats.memory)} / {memoryLimit}
              </p>
            )}
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <div>
                <FontAwesomeIcon icon={faHdd} />
              </div>
              <a css={tw`ml-2 uppercase font-semibold`}>DISK</a>
            </div>
            {status === "offline" ? (
              <p css={tw`mb-4`}>Offline</p>
            ) : (
              <p css={tw`mb-4`}>
                {bytesToString(stats.disk)} / {diskLimit}
              </p>
            )}
          </div>
          <div css={tw`overflow-hidden whitespace-nowrap`}>
            <div css={tw`flex items-center`}>
              <div>
                <FontAwesomeIcon icon={faWifi} />
              </div>
              <a css={tw`ml-2 uppercase font-semibold`}>NETWORK</a>
            </div>
            {status === "offline" ? (
              <div css={tw`flex items-center mb-4`}>
                <p css={tw`ml-1`}>Offline</p>
              </div>
            ) : (
              <div css={tw`flex items-center mb-4`}>
                <FontAwesomeIcon icon={faCloudDownloadAlt} css={tw`text-sm`} />
                <p css={tw`ml-1`}>{bytesToString(stats.rx)}</p>
                <FontAwesomeIcon
                  icon={faCloudUploadAlt}
                  css={tw`text-sm ml-3`}
                />
                <p css={tw`ml-1`}>{bytesToString(stats.tx)}</p>
              </div>
            )}
          </div>
        </TitledGreyBox>
      </div>
    </div>
  );
};

export default ServerDetailsBlock;
