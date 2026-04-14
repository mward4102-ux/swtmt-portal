// BLS Occupational Employment and Wage Statistics client
// Fetches labor rate data from the Bureau of Labor Statistics public API.
// Falls back to empty results if the API key is not set or the request fails.

export interface BLSWageData {
  occupation_code: string;
  occupation_title: string;
  hourly_mean: number | null;
  annual_mean: number | null;
  hourly_median: number | null;
  annual_median: number | null;
}

export async function fetchBLSLaborRates(
  occupationCodes: string[],
  _location?: string
): Promise<BLSWageData[]> {
  const apiKey = process.env.BLS_API_KEY;

  if (!apiKey || occupationCodes.length === 0) {
    return [];
  }

  // BLS series IDs for OES national wage data follow the format:
  // OEUM{area}{industry}{occupation}{datatype}
  // National: area=0000000, all industries: 000000
  // Data types: 01=employment, 04=hourly mean, 13=annual mean
  const seriesIds = occupationCodes.flatMap(code => [
    `OEUM000000000000${code}04`,  // hourly mean
    `OEUM000000000000${code}13`   // annual mean
  ]);

  try {
    const resp = await fetch('https://api.bls.gov/publicAPI/v2/timeseries/data/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seriesid: seriesIds.slice(0, 50), // BLS limits to 50 series per request
        registrationkey: apiKey,
        startyear: String(new Date().getFullYear() - 1),
        endyear: String(new Date().getFullYear()),
        latest: true
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!resp.ok) {
      console.warn(`BLS API returned ${resp.status}`);
      return [];
    }

    const data = await resp.json();
    if (data.status !== 'REQUEST_SUCCEEDED') {
      console.warn(`BLS API error: ${data.message?.[0] || 'Unknown'}`);
      return [];
    }

    // Parse series data into wage records per occupation code
    const wageMap = new Map<string, Partial<BLSWageData>>();

    for (const series of data.Results?.series || []) {
      const sid: string = series.seriesID || '';
      const occCode = sid.slice(20, 26); // extract occupation code from series ID
      const dataType = sid.slice(26, 28);
      const latestValue = series.data?.[0]?.value;
      const val = latestValue ? parseFloat(latestValue) : null;

      if (!wageMap.has(occCode)) {
        wageMap.set(occCode, { occupation_code: occCode, occupation_title: '' });
      }
      const entry = wageMap.get(occCode)!;

      if (dataType === '04') entry.hourly_mean = val;
      if (dataType === '13') entry.annual_mean = val;
    }

    return Array.from(wageMap.values()).map(w => ({
      occupation_code: w.occupation_code || '',
      occupation_title: w.occupation_title || '',
      hourly_mean: w.hourly_mean ?? null,
      annual_mean: w.annual_mean ?? null,
      hourly_median: null, // would need separate series
      annual_median: null
    }));
  } catch (e: any) {
    console.warn(`BLS fetch failed: ${e.message}`);
    return [];
  }
}
