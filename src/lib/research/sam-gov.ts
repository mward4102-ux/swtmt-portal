// SAM.gov API client
// Searches recent contract opportunities by NAICS and set-aside type.
// Requires SAM_GOV_API_KEY in env (free from api.sam.gov).

export interface SAMOpportunity {
  notice_id: string;
  title: string;
  solicitation_number: string;
  agency: string;
  posted_date: string;
  response_deadline: string;
  naics_code: string;
  set_aside: string;
  description: string;
}

export async function searchSAMOpportunities(
  naics: string,
  setAside?: string,
  daysBack = 365
): Promise<SAMOpportunity[]> {
  const apiKey = process.env.SAM_GOV_API_KEY;
  if (!apiKey) {
    console.warn('SAM_GOV_API_KEY not set — skipping SAM.gov search');
    return [];
  }

  if (!naics) return [];

  const postedFrom = new Date(Date.now() - daysBack * 86400000).toISOString().slice(0, 10);
  const postedTo = new Date().toISOString().slice(0, 10);

  const params = new URLSearchParams({
    api_key: apiKey,
    ncode: naics,
    postedFrom,
    postedTo,
    limit: '50',
    offset: '0'
  });

  if (setAside) {
    // SAM.gov set-aside codes
    const saMap: Record<string, string> = {
      'SDVOSB': 'SDVOSBC',
      'VOSB': 'VSB',
      '8(a)': 'SBA',
      'HUBZone': 'HZC',
      'WOSB': 'WOSB',
      'Small Business': 'SBP'
    };
    const code = saMap[setAside];
    if (code) params.set('typeOfSetAside', code);
  }

  try {
    const url = `https://api.sam.gov/opportunities/v2/search?${params.toString()}`;
    const resp = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000)
    });

    if (!resp.ok) {
      console.warn(`SAM.gov API returned ${resp.status}: ${resp.statusText}`);
      return [];
    }

    const data = await resp.json();
    const items: any[] = data?.opportunitiesData || [];

    return items.map((o: any) => ({
      notice_id: o.noticeId || '',
      title: o.title || '',
      solicitation_number: o.solicitationNumber || '',
      agency: o.fullParentPathName || o.department || '',
      posted_date: o.postedDate || '',
      response_deadline: o.responseDeadLine || '',
      naics_code: o.naicsCode || '',
      set_aside: o.typeOfSetAsideDescription || '',
      description: (o.description || '').slice(0, 2000)
    }));
  } catch (e: any) {
    console.warn(`SAM.gov fetch failed: ${e.message}`);
    return [];
  }
}
