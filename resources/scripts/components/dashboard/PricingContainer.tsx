import React, { useMemo } from "react";
import tw from "twin.macro";
import { Check } from "lucide-react";
import { getElysiumData } from "@/components/elements/elysium/getElysiumData";

type PricingItem = { name: string; price: string; description?: string; features?: string[] };

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

export default () => {
  const title = parseStringVar("--playground-pricing-title", "Paket Pricing Panel");
  const subtitle = parseStringVar("--playground-pricing-subtitle", "Pilih paket yang paling sesuai kebutuhan server kamu.");

  const pricingItems = useMemo(
    () =>
      parseJsonVar<PricingItem[]>("--playground-pricing-items", [
        { name: "Starter", price: "Rp 15.000/bulan", description: "Paket dasar panel.", features: ["Support cepat"] },
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
              <p css={tw`text-indigo-300 text-xl font-extrabold mt-1 break-words`}>{item.price}</p>
              {item.description && <p css={tw`text-neutral-300 text-sm mt-2 break-words`}>{item.description}</p>}
            </div>

            <ul css={tw`space-y-2 text-sm text-neutral-200 flex-1`}>
              {(item.features ?? []).map((feature) => (
                <li key={feature} css={tw`flex items-start gap-2`}>
                  <Check size={15} css={tw`text-green-400 mt-0.5 flex-shrink-0`} />
                  <span css={tw`break-words`}>{feature}</span>
                </li>
              ))}
            </ul>

            <button css={tw`w-full rounded-lg bg-indigo-500 hover:bg-indigo-400 transition-colors text-white text-sm font-semibold py-2.5`}>
              Pilih Paket
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
