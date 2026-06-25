import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type CurrencyCode = "TRY" | "USD" | "EUR" | "GBP";

type ExchangeRateItem = {
  currency: CurrencyCode;
  symbol: string;
  label: string;
  rateToTRY: number;
};

const currencyMeta: Record<CurrencyCode, { symbol: string; label: string }> = {
  TRY: {
    symbol: "₺",
    label: "Türk Lirası",
  },
  USD: {
    symbol: "$",
    label: "Amerikan Doları",
  },
  EUR: {
    symbol: "€",
    label: "Euro",
  },
  GBP: {
    symbol: "£",
    label: "İngiliz Sterlini",
  },
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Kur servisi hata döndü: ${response.status}`);
  }

  if (text.trim().startsWith("<")) {
    throw new Error("Kur servisi JSON yerine HTML döndü.");
  }

  return JSON.parse(text) as T;
}

type FrankfurterResponse = {
  amount: number;
  base: string;
  date: string;
  rates: {
    TRY?: number;
  };
};

async function getFrankfurterRateToTRY(
  currency: Exclude<CurrencyCode, "TRY">
) {
  const data = await fetchJson<FrankfurterResponse>(
    `https://api.frankfurter.dev/v1/latest?base=${currency}&symbols=TRY`
  );

  const rate = Number(data.rates?.TRY ?? 0);

  if (!Number.isFinite(rate) || rate <= 0) {
    throw new Error(`${currency} kuru alınamadı.`);
  }

  return {
    rate,
    date: data.date,
  };
}

async function getRatesFromFrankfurter() {
  const [usd, eur, gbp] = await Promise.all([
    getFrankfurterRateToTRY("USD"),
    getFrankfurterRateToTRY("EUR"),
    getFrankfurterRateToTRY("GBP"),
  ]);

  const rates: Record<CurrencyCode, ExchangeRateItem> = {
    TRY: {
      currency: "TRY",
      symbol: currencyMeta.TRY.symbol,
      label: currencyMeta.TRY.label,
      rateToTRY: 1,
    },
    USD: {
      currency: "USD",
      symbol: currencyMeta.USD.symbol,
      label: currencyMeta.USD.label,
      rateToTRY: usd.rate,
    },
    EUR: {
      currency: "EUR",
      symbol: currencyMeta.EUR.symbol,
      label: currencyMeta.EUR.label,
      rateToTRY: eur.rate,
    },
    GBP: {
      currency: "GBP",
      symbol: currencyMeta.GBP.symbol,
      label: currencyMeta.GBP.label,
      rateToTRY: gbp.rate,
    },
  };

  return {
    source: "Frankfurter",
    sourceDate: usd.date,
    rates,
  };
}

export async function GET() {
  try {
    const data = await getRatesFromFrankfurter();

    return NextResponse.json(
      {
        ok: true,
        baseCurrency: "TRY",
        source: data.source,
        sourceDate: data.sourceDate,
        updatedAt: new Date().toISOString(),
        rates: data.rates,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Kur bilgileri alınamadı.",
        baseCurrency: "TRY",
        source: "none",
        sourceDate: "",
        updatedAt: new Date().toISOString(),
        rates: {
          TRY: {
            currency: "TRY",
            symbol: "₺",
            label: "Türk Lirası",
            rateToTRY: 1,
          },
        },
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}