"use client";

import { useCallback, useEffect, useState } from "react";

import type { CurrencyCode } from "@/features/stock-movements/types/stockMovement";

export type ExchangeRateItem = {
  currency: CurrencyCode;
  symbol: string;
  label: string;
  rateToTRY: number;
};

type ExchangeRatesResponse = {
  ok: boolean;
  baseCurrency: "TRY";
  source: string;
  sourceDate: string;
  updatedAt: string;
  rates: Partial<Record<CurrencyCode, ExchangeRateItem>>;
  message?: string;
};

type FrankfurterResponse = {
  amount: number;
  base: string;
  date: string;
  rates: {
    TRY?: number;
  };
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

async function safeJsonFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`İstek başarısız oldu: ${response.status}`);
  }

  if (text.trim().startsWith("<")) {
    throw new Error("Sunucu JSON yerine HTML döndürdü.");
  }

  return JSON.parse(text) as T;
}

async function fetchFrankfurterRateToTRY(
  currency: Exclude<CurrencyCode, "TRY">
) {
  const data = await safeJsonFetch<FrankfurterResponse>(
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

async function fetchFrankfurterFallback(): Promise<ExchangeRatesResponse> {
  const [usd, eur, gbp] = await Promise.all([
    fetchFrankfurterRateToTRY("USD"),
    fetchFrankfurterRateToTRY("EUR"),
    fetchFrankfurterRateToTRY("GBP"),
  ]);

  return {
    ok: true,
    baseCurrency: "TRY",
    source: "Frankfurter",
    sourceDate: usd.date,
    updatedAt: new Date().toISOString(),
    rates: {
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
    },
  };
}

export function useExchangeRates() {
  const [rates, setRates] = useState<
    Partial<Record<CurrencyCode, ExchangeRateItem>>
  >({
    TRY: {
      currency: "TRY",
      symbol: "₺",
      label: "Türk Lirası",
      rateToTRY: 1,
    },
  });

  const [source, setSource] = useState("");
  const [sourceDate, setSourceDate] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const applyRates = useCallback((data: ExchangeRatesResponse) => {
    setRates({
      TRY: {
        currency: "TRY",
        symbol: "₺",
        label: "Türk Lirası",
        rateToTRY: 1,
      },
      ...data.rates,
    });

    setSource(data.source);
    setSourceDate(data.sourceDate);
    setUpdatedAt(data.updatedAt);
  }, []);

  const fetchRates = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const localData = await safeJsonFetch<ExchangeRatesResponse>(
        "/api/exchange-rates"
      );

      if (!localData.ok) {
        throw new Error(localData.message || "Kur bilgileri alınamadı.");
      }

      applyRates(localData);
    } catch {
      try {
        const fallbackData = await fetchFrankfurterFallback();
        applyRates(fallbackData);
      } catch (fallbackError) {
        setErrorMessage(
          fallbackError instanceof Error
            ? fallbackError.message
            : "Kur bilgileri alınamadı."
        );

        setRates({
          TRY: {
            currency: "TRY",
            symbol: "₺",
            label: "Türk Lirası",
            rateToTRY: 1,
          },
        });

        setSource("");
        setSourceDate("");
        setUpdatedAt("");
      }
    } finally {
      setIsLoading(false);
    }
  }, [applyRates]);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  return {
    rates,
    source,
    sourceDate,
    updatedAt,
    isLoading,
    errorMessage,
    refetch: fetchRates,
  };
}