import React, { useMemo } from "react";
import tw from "twin.macro";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import { getElysiumData } from "@/components/elements/elysium/getElysiumData";

type PricingItem = {
  name: string;
  monthly_price?: number;
  price?: string;
  cpu?: string;
  memory?: string;
  disk?: string;
  description?: string;
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

const formatPrice = (value: number): string => {
  return `Rp ${value.toLocaleString("id-ID")}/bulan`;
};

export default () => {
  const title = parseStringVar("--playground-pricing-title", "Paket Pricing Panel");
  const subtitle = parseStringVar("--playground-pricing-subtitle", "Pilih paket yang paling sesuai kebutuhan server kamu.");

  const pricingItems = useMemo(
    () =>
      parseJsonVar<PricingItem[]>("--playground-pricing-items", [
        { name: "Starter", monthly_price: 15000, cpu: "1 vCPU", memory: "2 GB", disk: "20 GB", description: "Paket dasar panel." },
      ]),
    []
  );

  return (
    <div css={tw`mt-6 mb-10`}>
      <div css={tw`mb-6`}>
        <h1 css={tw`text-2xl sm:text-3xl font-bold text-neutral-100`}>{title}</h1>
        <p css={tw`text-neutral-400 mt-2 text-sm`}>{subtitle}</p>
      </div>

      <div css={tw`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4`}>
        {pricingItems.map((item, index) => (
          <div key={`${item.name}-${index}`} css={tw`rounded-xl bg-elysium-color3 border border-white/5 p-5 flex flex-col gap-4`}>
            <div>
              <h2 css={tw`text-lg font-bold text-white truncate`} title={item.name}>
                {item.name}
              </h2>
              <p css={tw`text-indigo-300 text-xl font-extrabold mt-1 break-words`}>{formatPrice(toMonthlyPrice(item))}</p>
              {item.description && <p css={tw`text-neutral-300 text-sm mt-2 break-words`}>{item.description}</p>}
            </div>

            <div css={tw`space-y-2 text-sm text-neutral-200 flex-1`}>
              <p css={tw`flex items-center gap-2`}><Cpu size={14} css={tw`text-indigo-300`} /> CPU: {item.cpu || "-"}</p>
              <p css={tw`flex items-center gap-2`}><MemoryStick size={14} css={tw`text-indigo-300`} /> Memory: {item.memory || "-"}</p>
              <p css={tw`flex items-center gap-2`}><HardDrive size={14} css={tw`text-indigo-300`} /> Disk: {item.disk || "-"}</p>
            </div>

            <button css={tw`w-full rounded-lg bg-indigo-500 hover:bg-indigo-400 transition-colors text-white text-sm font-semibold py-2.5`}>
              Pilih Paket
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
