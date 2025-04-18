interface LoanInput {
  /** The amount of money borrowed */
  principal: number;
  /** The annual interest rate expressed as a percentage (e.g. 5% -> 0.05) */
  annualRate: number;
  /** The duration of the loan in months */
  months: number;
  /** The initial fees, paid upfront, for the loan (banking fees, etc.) */
  initialFees: number;
  /** The total cost of the insurance over the duration of the loan */
  insuranceCost: number;
}

export interface LoanOutput {
  /** The monthly installment excluding insurance costs */
  monthlyInstallmentWithoutInsurance: number;
  /** The monthly installment including all costs (principal, interests, insurance, ...) */
  fullInstallment: number;
  /** The total interests paid over the duration of the loan */
  totalInterests: number;
  /** The total cost of the loan excluding insurance costs (i.e. interest + initial fees) */
  totalCostWithoutInsurance: number;
  /** The total cost of the loan including insurance costs (i.e. interest + initial fees + insurance) */
  totalCost: number;
  /** The effecitve annual rate (TAEG) including all costs, expressed as a percentage */
  effectiveAnnualRate: number;
  /** The effective annual rate of the insurance component */
  effectiveInsuranceAnnualRate: number;
}

// TODO: use cents and round to 2 decimals

export function computeCost(inputs: LoanInput): LoanOutput {
  const { monthlyInstallmentWithoutInsurance, totalInterests } = computeInterestCost(inputs);
  return {
    monthlyInstallmentWithoutInsurance,
    fullInstallment: 0,
    totalInterests,
    totalCostWithoutInsurance: inputs.initialFees + totalInterests,
    totalCost: inputs.initialFees + totalInterests + inputs.insuranceCost,
    effectiveAnnualRate: 0,
    effectiveInsuranceAnnualRate: 0,
  };
}

function computeInterestCost({
  annualRate,
  months,
  principal,
}: { annualRate: number; months: number; principal: number }): {
  monthlyInstallmentWithoutInsurance: number;
  totalInterests: number;
} {
  // Uses simple division for rate conversion.
  // For compound interest, a different formula would be required:
  // Math.pow(1 + annualRate, 1/12) - 1
  const monthlyRate = annualRate / 12;

  if (monthlyRate === 0) {
    return {
      monthlyInstallmentWithoutInsurance: principal / months,
      totalInterests: 0,
    };
  }

  const compoundFactor = (1 + monthlyRate) ** months;
  const monthlyInstallmentWithoutInsurance = (principal * monthlyRate * compoundFactor) / (compoundFactor - 1);
  return {
    monthlyInstallmentWithoutInsurance,
    totalInterests: monthlyInstallmentWithoutInsurance * months - principal,
  };
}
