# Concept Rules UI

A React + TypeScript + Vite application for building and executing FHIR R4-compatible concept rules.

## Architecture

```
src/
├── types/
│   ├── fhir.ts              # FHIR R4 core types (ValueSet, Bundle, MedicationRequest)
│   └── domain.ts            # App domain types (RuleRow, ConceptMeta, QueryResult)
├── constants/
│   └── fhir.ts              # FHIR system URIs, resource types, column maps
├── data/
│   ├── mockFhirBundle.ts    # Mock FHIR R4 ValueSet bundle + result records
│   └── fhirApi.ts           # Async API layer (swap mock <-> real FHIR server here)
├── mappers/
│   └── valueSetMapper.ts    # FhirValueSet -> ConceptMeta mapper
├── utils/
│   ├── queryBuilder.ts      # RuleRow -> FHIR search parameter translation
│   └── csvExport.ts         # RFC 4180 CSV serialiser + download trigger
├── hooks/
│   └── useConceptRules.ts   # Central orchestration hook
├── components/
│   ├── ui/                  # Button, Select primitives
│   ├── ConceptSelector/     # Search + select modal
│   ├── RulesTable/          # Editable rules grid
│   └── ResultsTable/        # Query result table + CSV export
├── pages/
│   └── ConceptRulesPage.tsx # Page composition layer
└── __tests__/
    ├── mappers/             # valueSetMapper.test.ts   (9 tests)
    ├── utils/               # queryBuilder.test.ts (22) + csvExport.test.ts (6)
    ├── hooks/               # useConceptRules.test.ts  (11 tests)
    └── components/          # ConceptSelector.test.tsx (8) + RulesTable.test.tsx (8)
```

**Total: 64 tests — all passing.**

## FHIR R4 Compatibility

### Code Systems

| System    | URI                                           | Usage            |
|-----------|-----------------------------------------------|------------------|
| RxNorm    | http://www.nlm.nih.gov/research/umls/rxnorm   | Medication RXCUI |
| LOINC     | http://loinc.org                              | Observation codes|
| SNOMED CT | http://snomed.info/sct                        | Clinical terms   |
| ICD-10-CM | http://hl7.org/fhir/sid/icd-10-cm            | Diagnosis codes  |

### Query Translation (queryBuilder.ts)

| UI Column   | FHIR Search Param      | Operator mapping         |
|-------------|------------------------|--------------------------|
| Name        | medication.code:text   | ANY OF -> comma list     |
| Codes       | code                   | prefixed with RxNorm URI |
| Admin Route | route                  | NOT IN -> :not modifier  |
| Frequency   | timing-code            |                          |
| Status      | status                 |                          |

## Swap to Real FHIR Server

Edit `src/data/fhirApi.ts` only:

```ts
const BASE_URL = "https://your-fhir-server.example.com/fhir/R4";

export async function fetchValueSetBundle() {
  const res = await fetch(`${BASE_URL}/ValueSet?status=active&_count=50`, {
    headers: { Accept: "application/fhir+json" },
  });
  return res.json();
}
```

No other files need to change.

## Commands

```bash
npm install
npm run dev            # Dev server at http://localhost:5173
npm test               # Run 64 tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```
