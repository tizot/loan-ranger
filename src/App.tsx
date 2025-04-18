import { createStore } from 'solid-js/store';
import * as v from 'valibot';
import {
  NumberField,
  NumberFieldErrorMessage,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldLabel,
} from './components/ui/number-field';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';

const InputSchema = v.object({
  principal: v.pipe(v.number(), v.minValue(0)),
  annualRatePercentage: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  months: v.pipe(v.number(), v.integer(), v.minValue(1)),
  initialFees: v.pipe(v.number(), v.minValue(0)),
  insuranceCost: v.pipe(v.number(), v.minValue(0)),
});
type Input = v.InferOutput<typeof InputSchema>;

function App() {
  const [inputs, setInputs] = createStore<Input>({
    principal: 200_000,
    annualRatePercentage: 3.5,
    months: 240,
    initialFees: 2500,
    insuranceCost: 10_000,
  });

  return (
    <div class="w-full p-3 space-y-4">
      <header class="flex flex-col items-center gap-1">
        <h1 class="text-2xl font-bold">Loan Ranger</h1>
        <h2 class="text-lg font-semibold">Calculateur de prêt immobilier</h2>
      </header>

      <main class="flex flex-col items-center gap-3">
        <Card class="w-full">
          <CardHeader>
            <CardTitle>Informations sur le prêt</CardTitle>
          </CardHeader>
          <CardContent>
            <form class="flex flex-col gap-2 w-full max-w-md">
              <NumberField
                class="flex w-full flex-col gap-2"
                rawValue={inputs.principal}
                onRawValueChange={(value) => setInputs('principal', value)}
              >
                <NumberFieldGroup>
                  <NumberFieldLabel>Montant emprunté (principal)</NumberFieldLabel>
                  <NumberFieldInput />
                  <NumberFieldErrorMessage>Le principal doit être un nombre positif.</NumberFieldErrorMessage>
                </NumberFieldGroup>
              </NumberField>

              <NumberField
                class="flex w-full flex-col gap-2"
                rawValue={inputs.annualRatePercentage}
                onRawValueChange={(value) => setInputs('annualRatePercentage', value)}
              >
                <NumberFieldGroup>
                  <NumberFieldLabel>Taux d'intérêt annuel (%)</NumberFieldLabel>
                  <NumberFieldInput />
                  <NumberFieldErrorMessage>
                    Le taux d'intérêt doit être un nombre entre 0 et 100.
                  </NumberFieldErrorMessage>
                </NumberFieldGroup>
              </NumberField>

              <NumberField
                class="flex w-full flex-col gap-2"
                rawValue={inputs.months}
                onRawValueChange={(value) => setInputs('months', value)}
              >
                <NumberFieldGroup>
                  <NumberFieldLabel>Durée du prêt (mois)</NumberFieldLabel>
                  <NumberFieldInput />
                  <NumberFieldErrorMessage>La durée doit être un nombre entier positif.</NumberFieldErrorMessage>
                </NumberFieldGroup>
              </NumberField>

              <NumberField
                class="flex w-full flex-col gap-2"
                rawValue={inputs.initialFees}
                onRawValueChange={(value) => setInputs('initialFees', value)}
              >
                <NumberFieldGroup>
                  <NumberFieldLabel>Frais de dossier initiaux</NumberFieldLabel>
                  <NumberFieldInput />
                  <NumberFieldErrorMessage>Les frais doivent être un nombre positif.</NumberFieldErrorMessage>
                </NumberFieldGroup>
              </NumberField>

              <NumberField
                class="flex w-full flex-col gap-2"
                rawValue={inputs.insuranceCost}
                onRawValueChange={(value) => setInputs('insuranceCost', value)}
              >
                <NumberFieldGroup>
                  <NumberFieldLabel>Coût de l'assurance</NumberFieldLabel>
                  <NumberFieldInput />
                  <NumberFieldErrorMessage>Le coût doit être un nombre positif.</NumberFieldErrorMessage>
                </NumberFieldGroup>
              </NumberField>

              <Button type="submit" class="mt-3">
                Calculer
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default App;
