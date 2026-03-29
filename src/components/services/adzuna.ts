
export type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  redirect_url: string;
  contract_type?: string;
  salary_min?: number;
  description: string;
};

export const searchAdzunaJobs = async (query: string, country: string = 'us', resultsPerPage: number = 10) => {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;

  if (!appId || !appKey) {
    console.warn("Adzuna API credentials not configured. Skipping Adzuna search.");
    return [];
  }

  try {
    const url = `https://api.adzuna.com/v1/api/jobs/${location}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=${resultsPerPage}&what=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Adzuna API error: ${response.status}`);
    }
    const data = await response.json();
    return data.results as AdzunaJob[];
  } catch (error) {
    console.error("Failed to fetch jobs from Adzuna:", error);
    return [];
  }
};
