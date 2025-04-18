import { createStore } from 'solid-js/store';
import * as v from 'valibot';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import {
  NumberField,
  NumberFieldErrorMessage,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldLabel,
} from './components/ui/number-field';
import { type LoanOutput, computeCost } from './lib/calculator';
import { Show, splitProps } from 'solid-js';
import type { NumberFieldRootProps } from '@kobalte/core/number-field';

const InputSchema = v.object({
  principal: v.pipe(v.number(), v.minValue(0)),
  annualRatePercentage: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  months: v.pipe(v.number(), v.integer(), v.minValue(1)),
  initialFees: v.pipe(v.number(), v.minValue(0)),
  insuranceCost: v.pipe(v.number(), v.minValue(0)),
});
type Input = v.InferOutput<typeof InputSchema>;

type Result = { output: LoanOutput | null };

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  currencyDisplay: 'symbol',
  maximumFractionDigits: 2,
});
function formatCurrency(amount: number) {
  return currencyFormatter.format(amount);
}
const percentageFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
function formatPercentage(value: number) {
  return percentageFormatter.format(value);
}

function App() {
  const [inputs, setInputs] = createStore<Input>({
    principal: 200_000,
    annualRatePercentage: 3.5,
    months: 240,
    initialFees: 2500,
    insuranceCost: 10_000,
  });
  const [result, setResult] = createStore<Result>({ output: null });

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    const validation = v.safeParse(InputSchema, inputs);
    if (!validation.success) return;
    const output = computeCost({
      ...validation.output,
      annualRate: validation.output.annualRatePercentage / 100,
    });
    setResult('output', output);
  };

  return (
    <div class="w-full p-3 space-y-4 mx-auto">
      <header class="flex flex-col items-center gap-1">
        <h1 class="text-2xl font-bold">Loan Ranger</h1>
        <h2 class="text-lg font-semibold">Calculateur de prêt immobilier</h2>
      </header>

      <main class="flex flex-col md:flex-row md:justify-center items-center md:items-stretch gap-3">
        <Card class="w-full max-w-md">
          <CardHeader>
            <CardTitle>Informations sur le prêt</CardTitle>
          </CardHeader>
          <CardContent class="flex flex-col gap-2 w-full max-w-md">
            <NumberInput
              rawValue={inputs.principal}
              onRawValueChange={(value) => setInputs('principal', value)}
              label="Montant emprunté (principal)"
              errorMessage="Le principal doit être un nombre positif."
            />
            <NumberInput
              rawValue={inputs.annualRatePercentage}
              onRawValueChange={(value) => setInputs('annualRatePercentage', value)}
              label="Taux d'intérêt annuel (%)"
              errorMessage="Le taux d'intérêt doit être un nombre entre 0 et 100."
            />
            <NumberInput
              rawValue={inputs.months}
              onRawValueChange={(value) => setInputs('months', value)}
              label="Durée du prêt (mois)"
              errorMessage="La durée doit être un nombre entier positif."
            />
            <NumberInput
              rawValue={inputs.initialFees}
              onRawValueChange={(value) => setInputs('initialFees', value)}
              label="Frais de dossier initiaux"
              errorMessage="Les frais doivent être un nombre positif."
            />
            <NumberInput
              rawValue={inputs.insuranceCost}
              onRawValueChange={(value) => setInputs('insuranceCost', value)}
              label="Coût de l'assurance"
              errorMessage="Le coût doit être un nombre positif."
            />
            <Button type="button" onClick={handleOnClick} disabled={!validation().success}>
              Calculer
            </Button>
          </CardContent>
        </Card>

        <Show when={result.output} keyed>
          {(output) => (
            <Card class="w-full max-w-md">
              <CardHeader>
                <CardTitle>Coût du prêt</CardTitle>
              </CardHeader>
              <CardContent class="space-y-2">
                <DataDisplay
                  value={formatCurrency(output.monthlyInstallmentWithoutInsurance)}
                  title="Mensualités (hors assurance)"
                />
                <DataDisplay value={formatCurrency(output.fullInstallment)} title="Mensualités (assurance incluse)" />
                <DataDisplay value={formatCurrency(output.totalInterests)} title="Intérêts totaux" />
                <DataDisplay
                  value={formatCurrency(output.totalCostWithoutInsurance)}
                  title="Coût total (hors assurance)"
                />
                <DataDisplay value={formatCurrency(output.totalCost)} title="Coût total (assurance incluse)" />
                <DataDisplay
                  value={formatPercentage(output.effectiveAnnualRate)}
                  title="Taux Annuel Effectif Global (TAEG)"
                />
                <DataDisplay
                  value={formatPercentage(output.effectiveInsuranceAnnualRate)}
                  title="Taux Annuel Effect d'Assurance (TAEA)"
                />
              </CardContent>
            </Card>
          )}
        </Show>
      </main>
    </div>
  );
}

type NumberInputProps = NumberFieldRootProps & { label: string; errorMessage: string };
const NumberInput = (props: NumberInputProps) => {
  const [local, rest] = splitProps(props, ['label', 'errorMessage']);
  return (
    <NumberField {...rest} class="flex w-full flex-col gap-2">
      <NumberFieldGroup>
        <NumberFieldLabel>{local.label}</NumberFieldLabel>
        <NumberFieldInput />
        <NumberFieldErrorMessage>{local.errorMessage}</NumberFieldErrorMessage>
      </NumberFieldGroup>
    </NumberField>
  );
};

const DataDisplay = ({ title, value }: { title: string; value: string }) => (
  <div class="w-full">
    <div class="text-sm">{title}</div>
    <div class="font-semibold">{value}</div>
  </div>
);

export default App;
