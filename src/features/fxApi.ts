import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const fxApi = createApi({
  reducerPath: 'fxApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.frankfurter.app',  // reliable free API, no key needed
  }),
  endpoints: builder => ({
    getRates: builder.query<{ rates: Record<string, number> }, string>({
      query: base => `/latest?from=${base}`,  // using "from" parameter for base currency
    }),
  }),
});

export const { useGetRatesQuery } = fxApi;