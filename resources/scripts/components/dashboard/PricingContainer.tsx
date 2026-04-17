import React, { useMemo } from "react";
import tw from "twin.macro";
import { CheckCircle2, Cpu, HardDrive, MemoryStick, XCircle } from "lucide-react";
import { getElysiumData } from "@/components/elements/elysium/getElysiumData";

type PricingFeature = { text: string; type?: "include" | "exclude" };

type PricingItem = {
  name: string;
  monthly_price?: number;
  price?: string;
  cpu?: string;
  memory?: string;
  disk?: string;
  description?: string;
  features?: PricingFeature[];
};

const parseStringVar = (name: string, fallback: string) => {
  try {
    const raw = getElysiumData(name).trim();
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const parseJsonVar = <T,>(name: string, fallback: T): T => {
  try {
    const raw = getElysiumData(name).trim();
    if (!raw) return fallback;
    const outer = JSON.parse(raw);
    if (typeof outer !== "string") return fallback;

    return JSON.parse(outer) as T;
  } catch {
    return fallback;
  }
};

const toMonthlyPrice = (item: PricingItem): number => {
  if (typeof item.monthly_price === "number") return item.monthly_price;
  if (!item.price) return 0;
  const digits = item.price.replace(/\D/g, "");

  return digits ? Number(digits) : 0;
};

const formatPrice = (value: number): string => `Rp ${value.toLocaleString("id-ID")}/bulan`;

export default () => {
  const title = parseStringVar("--playground-pricing-title", "Paket Pricing Panel");
  const subtitle = parseStringVar("--playground-pricing-subtitle", "Pilih paket premium untuk performa maksimal.");

  const pricingItems = useMemo(
    () =>
      parseJsonVar<PricingItem[]>("--playground-pricing-items", [
        {
          name: "Starter",
          monthly_price: 15000,
          cpu: "1 vCPU",
          memory: "2 GB",
          disk: "20 GB",
          description: "Paket dasar panel.",
          features: [
            { text: "Proteksi DDoS dasar", type: "include" },
            { text: "Priority support", type: "exclude" },
          ],
        },
      ]),
    []
  );

  return (
    <div css={tw`mt-6 mb-10`}>
      <div css={tw`mb-6`}>
        <h1 css={tw`text-2xl sm:text-3xl font-bold text-neutral-100`}>{title}</h1>
        <p css={tw`text-neutral-400 mt-2 text-sm`}>{subtitle}</p>
      </div>

      <div css={tw`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5`}>
        {pricingItems.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            css={tw`rounded-2xl p-[1px] bg-gradient-to-br from-indigo-400/60 via-fuchsia-400/40 to-cyan-400/60 shadow-[0_20px_60px_rgba(79,70,229,0.25)]`}
          >
            <div css={tw`rounded-2xl bg-elysium-color3/95 backdrop-blur-xl border border-white/10 p-5 flex flex-col gap-4 h-full`}>
              <div css={tw`flex items-start justify-between gap-3`}>
                <h2 css={tw`text-lg font-extrabold text-white truncate`} title={item.name}>
                  {item.name}
                </h2>
                <span css={tw`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-white/10 text-indigo-200`}>Premium</span>
              </div>

              <p css={tw`text-indigo-300 text-xl font-black`}>{formatPrice(toMonthlyPrice(item))}</p>
              {item.description && <p css={tw`text-neutral-300 text-sm break-words`}>{item.description}</p>}

              <div css={tw`grid grid-cols-3 gap-2 text-xs`}>
                <div css={tw`rounded-lg bg-white/5 px-2 py-2 text-center text-neutral-100`}><Cpu size={13} css={tw`mx-auto mb-1 text-indigo-300`} />{item.cpu || "-"}</div>
                <div css={tw`rounded-lg bg-white/5 px-2 py-2 text-center text-neutral-100`}><MemoryStick size={13} css={tw`mx-auto mb-1 text-indigo-300`} />{item.memory || "-"}</div>
                <div css={tw`rounded-lg bg-white/5 px-2 py-2 text-center text-neutral-100`}><HardDrive size={13} css={tw`mx-auto mb-1 text-indigo-300`} />{item.disk || "-"}</div>
              </div>

              <ul css={tw`space-y-2 text-sm flex-1`}>
                {(item.features ?? []).map((feature, featureIndex) => {
                  const included = (feature.type ?? "include") !== "exclude";
                  return (
                    <li key={`${feature.text}-${featureIndex}`} css={tw`flex items-start gap-2`}>
                      {included ? (
                        <CheckCircle2 size={16} css={tw`text-emerald-400 mt-0.5 flex-shrink-0`} />
                      ) : (
                        <XCircle size={16} css={tw`text-red-400 mt-0.5 flex-shrink-0`} />
                      )}
                      <span css={[tw`break-words`, included ? tw`text-neutral-200` : tw`text-red-200`]}>{feature.text}</span>
                    </li>
                  );
                })}
              </ul>

              <button css={tw`w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 transition-colors text-white text-sm font-semibold py-2.5 shadow-lg`}>
                Pilih Paket
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
