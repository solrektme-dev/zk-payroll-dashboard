import type { PayrollProof, PayrollPublicInputs, ScVal } from "@/types";

function proofToSorobanScVal(proof: PayrollProof): ScVal {
  const serializedProof = JSON.stringify({
    publicSignals: proof.publicSignals,
    proof: proof.proof,
  });

  return {
    type: "bytes",
    value: new TextEncoder().encode(serializedProof),
  };
}

export function toSorobanScVals(
  proof: PayrollProof,
  publicInputs: PayrollPublicInputs
): ScVal[] {
  return [
    { type: "string", value: publicInputs.merkleRoot },
    { type: "u128", value: publicInputs.totalPayrollAmount },
    { type: "string", value: publicInputs.payrollPeriodId },
    proofToSorobanScVal(proof),
  ];
}
