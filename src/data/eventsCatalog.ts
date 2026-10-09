import { ActionableEvent, MarketCycle, MarketState, Property } from '../types/game';

export const MARKET_CYCLES: Record<MarketCycle, MarketState> = {
  boom: {
    cycle: 'boom',
    name: 'Economic Boom & High Migration',
    description: 'Strong job growth and influx of residents. Property appreciation is rapid (+6.5%/yr), rental demand is fierce.',
    appreciationRateAnnual: 0.065,
    benchmarkMortgageRate: 6.8,
    inflationRate: 0.035,
    demandIndex: 1.15,
    stockMarketReturnAnnual: 0.16,
    monthsInCycle: 0,
  },
  steady: {
    cycle: 'steady',
    name: 'Balanced Healthy Market',
    description: 'Stable employment and predictable inflation. Steady 3.8% annual property appreciation with moderate turnover.',
    appreciationRateAnnual: 0.038,
    benchmarkMortgageRate: 6.1,
    inflationRate: 0.024,
    demandIndex: 1.0,
    stockMarketReturnAnnual: 0.085,
    monthsInCycle: 0,
  },
  cooling: {
    cycle: 'cooling',
    name: 'Cooling Buyer Market',
    description: 'Mortgage rates tick upwards. Property prices flatten (+1.2%/yr), tenants become more price-conscious.',
    appreciationRateAnnual: 0.012,
    benchmarkMortgageRate: 7.4,
    inflationRate: 0.031,
    demandIndex: 0.92,
    stockMarketReturnAnnual: 0.02,
    monthsInCycle: 0,
  },
  recession: {
    cycle: 'recession',
    name: 'Economic Contraction',
    description: 'Slowing commercial leasing and cautious consumer sentiment. Property values see temporary dip (-2.5%/yr).',
    appreciationRateAnnual: -0.025,
    benchmarkMortgageRate: 5.5,
    inflationRate: 0.015,
    demandIndex: 0.85,
    stockMarketReturnAnnual: -0.14,
    monthsInCycle: 0,
  },
};

/**
 * Procedural Actionable Event generator based on property type, condition, and status
 */
export function generateRandomPropertyEvent(property: Property): ActionableEvent | null {
  const rand = Math.random();

  // If condition is poor (<70), higher likelihood of maintenance breakdowns
  if (property.condition < 70 && rand < 0.45) {
    return {
      id: `event-hvac-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: 'HVAC Heating & Cooling Failure',
      propertyId: property.id,
      propertyName: property.name,
      severity: 'high',
      description: `The central heating unit at ${property.name} broke down during severe weather. Tenants have submitted an urgent emergency complaint.`,
      options: [
        {
          id: 'opt-replace',
          label: 'Install Brand New High-Efficiency HVAC',
          cost: Math.round(property.units * 1400),
          description: 'Full replacement with modern 10-year warranty unit.',
          conditionImpact: 12,
          satisfactionImpact: 15,
        },
        {
          id: 'opt-patch',
          label: 'Temporary Mechanic Patch',
          cost: Math.round(property.units * 450),
          description: 'Quick weld and capacitor fix. Solves issue today, but higher risk of future breakdown.',
          conditionImpact: 3,
          satisfactionImpact: -5,
          riskDescription: 'Temporary fix may fail again within 6 months.',
        },
        {
          id: 'opt-ignore',
          label: 'Delay Repair (Tenant buys space heaters)',
          cost: 0,
          description: 'Postpone action until next month.',
          conditionImpact: -5,
          satisfactionImpact: -30,
          riskDescription: 'Severe tenant dissatisfaction; risk of rent withholding or lease termination.',
        },
      ],
    };
  }

  // Plumbing & Roof issues
  if (rand < 0.18) {
    return {
      id: `event-plumbing-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: 'Plumbing Mainline Backup',
      propertyId: property.id,
      propertyName: property.name,
      severity: 'medium',
      description: `Tree roots infiltrated the sewer line at ${property.name}, backing up drains on the ground floor.`,
      options: [
        {
          id: 'opt-hydrojet',
          label: 'Professional Hydrojet & Pipe Sleeve',
          cost: Math.round(750 + property.units * 200),
          description: 'Clears obstruction and reinforces line against future roots.',
          conditionImpact: 8,
          satisfactionImpact: 10,
        },
        {
          id: 'opt-snake',
          label: 'Basic Mechanical Snake',
          cost: 280,
          description: 'Punches hole through blockage to restore immediate drainage.',
          conditionImpact: 2,
          satisfactionImpact: 0,
        },
      ],
    };
  }

  // Tenant Improvement / Appreciation Opportunity
  if (rand < 0.32) {
    return {
      id: `event-upgrade-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: 'Smart Home & Energy Efficiency Upgrade',
      propertyId: property.id,
      propertyName: property.name,
      severity: 'low',
      description: `A local utility contractor is offering a subsidized package for smart digital locks, LED fixtures, and digital thermostats at ${property.name}.`,
      options: [
        {
          id: 'opt-smart-upgrade',
          label: 'Accept Smart Efficiency Package',
          cost: Math.round(property.units * 350),
          description: 'Increases property appeal, lowers tenant utility friction, and adds value.',
          conditionImpact: 6,
          satisfactionImpact: 12,
        },
        {
          id: 'opt-decline-upgrade',
          label: 'Decline for Now',
          cost: 0,
          description: 'Keep current setup without spending cash.',
          conditionImpact: 0,
          satisfactionImpact: 0,
        },
      ],
    };
  }

  // Commercial / Multi tenant lease renewal request
  if (rand < 0.44 && property.units > 0) {
    return {
      id: `event-lease-negotiation-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: 'Tenant Lease Extension Negotiation',
      propertyId: property.id,
      propertyName: property.name,
      severity: 'low',
      description: `A reliable tenant whose lease is ending wants to sign a 2-year renewal if you replace the carpets or offer a $50/mo courtesy discount.`,
      options: [
        {
          id: 'opt-refurbish',
          label: 'Install Fresh Stain-Resistant Carpet ($600)',
          cost: 600,
          description: 'Keep the rent unchanged at current full market rate for 2 full years.',
          conditionImpact: 5,
          satisfactionImpact: 18,
        },
        {
          id: 'opt-firm',
          label: 'Maintain Firm Standard Terms',
          cost: 0,
          description: 'No upgrades, standard market renewal.',
          conditionImpact: 0,
          satisfactionImpact: -8,
        },
      ],
    };
  }

  return null;
}
