export interface EmissionCategory {
  category: number;
  total: number;
  unit: string;
  metadata: {
    verifiedBy: {
      name: string;
    };
  };
}

export interface EmissionScope {
  total?: number;
  unit?: string;
  mb?: number;
  lb?: number;
  unknown?: null;
  calculatedTotalEmissions?: number;
  metadata?: {
    verifiedBy: {
      name: string;
    };
  };
  categories?: EmissionCategory[];
  statedTotalEmissions?: {
    total: number;
    unit: string;
    metadata: {
      verifiedBy: {
        name: string;
      };
    };
  };
}

export interface EmissionPeriod {
  startDate: string;
  endDate: string;
  reportURL: string | null;
  emissions: {
    calculatedTotalEmissions: number;
    scope1: EmissionScope | null;
    scope2: EmissionScope | null;
    scope3: EmissionScope | null;
    scope1And2: EmissionScope | null;
    statedTotalEmissions: {
      total: number;
      unit: string;
      metadata: {
        verifiedBy: {
          name: string;
        };
      };
    };
  };
  economy?: {
    employees?: {
      value: number;
      unit: string;
      metadata: {
        verifiedBy: {
          name: string;
        };
      };
    };
    turnover?: {
      value: number;
      currency: string;
      metadata: {
        verifiedBy: {
          name: string;
        };
      };
    };
  };
}

export interface Company {
  wikidataId: string;
  name: string;
  description: string;
  reportingPeriods: EmissionPeriod[];
  industry: {
    industryGics: {
      sectorCode: string;
      groupCode: string;
      industryCode: string;
      subIndustryCode: string;
    };
    metadata: {
      verifiedBy: null;
    };
  };
  tags: string[];
}

export interface EmissionsData {
  companies: Company[];
  totalEmissions: number;
  year: number;
}

export interface ActiveCompany {
  company: Company;
  period: EmissionPeriod;
  emissions: number;
}