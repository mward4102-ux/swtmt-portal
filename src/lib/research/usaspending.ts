// USAspending.gov API client
// Searches historical federal contract awards by NAICS and agency.
// Returns normalized award records for competitive intelligence.

export interface USASpendingAward {
  award_id: string;
  recipient_name: string;
  award_amount: number;
  start_date: string;
  end_date: string;
  description: string;
}

export async function searchUSASpending(
  naics: string,
  agency: string,
  fiscalYears: number[] = [2024, 2023, 2022, 2021, 2020]
): Promise<USASpendingAward[]> {
  if (!naics && !agency) return [];

  // Build time periods from fiscal years
  const timePeriods = fiscalYears.map(fy => ({
    start_date: `${fy - 1}-10-01`,
    end_date: `${fy}-09-30`
  }));

  const filters: Record<string, any> = {
    award_type_codes: ['A', 'B', 'C', 'D'],
    time_period: timePeriods
  };

  if (naics) filters.naics_codes = [naics];
  if (agency) {
    filters.agencies = [{ type: 'awarding', tier: 'toptier', name: agency }];
  }

  try {
    const resp = await fetch('https://api.usaspending.gov/api/v2/search/spending_by_award/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters,
        fields: [
          'Award ID',
          'Recipient Name',
          'Award Amount',
          'Period of Performance Start Date',
          'Period of Performance End Date',
          'Description'
        ],
        limit: 50,
        sort: 'Award Amount',
        order: 'desc'
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!resp.ok) {
      console.warn(`USAspending API returned ${resp.status}: ${resp.statusText}`);
      return [];
    }

    const data = await resp.json();
    const results: any[] = data?.results || [];

    return results.map((r: any) => ({
      award_id: r['Award ID'] || '',
      recipient_name: r['Recipient Name'] || '',
      award_amount: Number(r['Award Amount'] || 0),
      start_date: r['Period of Performance Start Date'] || '',
      end_date: r['Period of Performance End Date'] || '',
      description: r['Description'] || ''
    }));
  } catch (e: any) {
    console.warn(`USAspending fetch failed: ${e.message}`);
    return [];
  }
}
