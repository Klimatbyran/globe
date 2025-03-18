import axios from 'axios';
import { Company, EmissionsData } from '../types/emissions';

const API_URL = '/api';

export async function fetchEmissionsData(year: number = 2023): Promise<EmissionsData> {
  try {
    const response = await axios.get(`${API_URL}/companies`);
    
    if (!Array.isArray(response.data)) {
      throw new Error('Invalid data format received from API');
    }

    const companies: Company[] = response.data.filter((company: Company) => {
      return company.reportingPeriods.some(period => {
        const startDate = new Date(period.startDate);
        return startDate.getFullYear() === year;
      });
    }).map(company => ({
      ...company,
      reportingPeriods: company.reportingPeriods.filter(period => 
        new Date(period.startDate).getFullYear() === year
      )
    }));

    if (companies.length === 0) {
      throw new Error(`No companies found with emissions data for year ${year}`);
    }

    const totalEmissions = companies.reduce((sum, company) => {
      const yearPeriod = company.reportingPeriods[0];
      if (!yearPeriod) return sum;

      const emissions = yearPeriod.emissions;
      if (!emissions) return sum;

      const emissionValue = emissions.calculatedTotalEmissions ?? 
                          emissions.statedTotalEmissions?.total ?? 0;

      return sum + emissionValue;
    }, 0);

    return {
      companies,
      totalEmissions,
      year
    };
  } catch (error) {
    console.error('API Error Details:', error);
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response received from API server. Please check your connection.');
      }
    }
    throw error instanceof Error ? error : new Error('An unexpected error occurred');
  }
}