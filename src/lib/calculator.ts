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

export function computeLoanOutput(inputs: LoanInput): LoanOutput {
  const { monthlyInstallmentWithoutInsurance, totalInterests } = computeInterestCost(inputs);
  const totalCost = inputs.initialFees + inputs.insuranceCost + totalInterests;
  const fullInstallment = (inputs.principal + totalInterests + inputs.insuranceCost) / inputs.months;
  const { rate: effectiveAnnualRate } = computeEffectiveAnnualRate({
    months: inputs.months,
    principal: inputs.principal,
    totalCost: inputs.initialFees + totalInterests + inputs.insuranceCost,
    initialFees: inputs.initialFees,
  });
  const { rate: effectiveInsuranceAnnualRate } = computeEffectiveAnnualRate({
    months: inputs.months,
    principal: inputs.principal,
    totalCost: inputs.initialFees + totalInterests,
    initialFees: inputs.initialFees,
  });
  return {
    monthlyInstallmentWithoutInsurance,
    fullInstallment,
    totalInterests,
    totalCostWithoutInsurance: inputs.initialFees + totalInterests,
    totalCost,
    effectiveAnnualRate: effectiveAnnualRate ?? Number.NaN,
    effectiveInsuranceAnnualRate: (effectiveAnnualRate ?? Number.NaN) - (effectiveInsuranceAnnualRate ?? Number.NaN),
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

function computeEffectiveAnnualRate({
  months,
  principal,
  initialFees,
  totalCost,
}: { months: number; principal: number; initialFees: number; totalCost: number }):
  | { converged: true; rate: number }
  | { converged: false; rate?: number } {
  const totalReimbursed = totalCost + principal;
  const averageInstallment = (totalReimbursed - initialFees) / months;

  const objectiveFunction = (rate: number): [number, number] => {
    let value = 0;
    let derivative = 0;

    for (let i = 0; i < months; i++) {
      const pow = i + 1;
      value += averageInstallment * rate ** pow;
      derivative += pow * rate ** i;
    }

    value += initialFees - principal;
    derivative *= averageInstallment;

    return [value, derivative];
  };

  try {
    const rate = newton(objectiveFunction, 0.99);
    return { converged: true, rate: (1 / rate) ** 12 - 1 };
  } catch (error) {
    console.error('Failed to compute effective annual rate:', error);
    return { converged: false };
  }
}

// Implement newton-raphson method to find the root of the function
function newton(f: (x: number) => [number, number], x0: number, epsilon = 1e-7, maxIterations = 100): number {
  let x = x0;
  for (let i = 0; i < maxIterations; i++) {
    const [value, derivative] = f(x);
    if (Math.abs(value) < epsilon) {
      return x;
    }
    if (Math.abs(derivative) < epsilon) {
      throw new Error('Derivative is too small');
    }
    x -= value / derivative;
  }
  throw new Error('Max iterations reached');
}
