import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchRecordDetail } from "../../data/fhirApi";
import type { ResultRecordDetail } from "../../types/domain";
import { FHIR_SYSTEMS } from "../../constants/fhir";

export const RecordDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ResultRecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchRecordDetail(id).then((r) => {
      if (!r) setNotFound(true);
      else setRecord(r);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (notFound || !record) return <NotFound onBack={() => navigate(-1)} id={id} />;

  const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-800", completed: "bg-slate-100 text-slate-600",
      "on-hold": "bg-amber-100 text-amber-800", cancelled: "bg-red-100 text-red-700",
    };
    return <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>{status}</span>;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-blue-800 text-white px-6 py-4 shadow-md flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-300 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium"
        >
          ← Back
        </button>
        <div className="border-l border-blue-600 pl-4">
          <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">Record Detail</p>
          <h1 className="text-lg font-bold mt-0.5">{record.name}</h1>
        </div>
      </header>

      <main className="flex-1 p-6 space-y-5 max-w-5xl">
        {/* Identity card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{record.name}</h2>
              {record.brandNames?.length && (
                <p className="text-sm text-slate-500 mt-1">
                  Also known as: <span className="font-medium text-slate-700">{record.brandNames.join(", ")}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {record.drugClass && (
                <span className="text-sm bg-violet-50 text-violet-700 border border-violet-100 px-3 py-1 rounded-full font-medium">
                  {record.drugClass}
                </span>
              )}
              <StatusPill status={record.status} />
            </div>
          </div>

          {/* Quick facts grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
            <Fact label="Record ID"   value={record.id} mono />
            <Fact label="RxCUI"       value={record.rxcui ?? record.codes} mono />
            <Fact label="Admin Route" value={record.adminRoute} />
            <Fact label="Frequency"   value={record.frequency} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Mechanism + Indications */}
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
            <SectionTitle>Clinical Information</SectionTitle>
            {record.mechanism && (
              <div>
                <Label>Mechanism of Action</Label>
                <p className="text-sm text-slate-700 mt-1">{record.mechanism}</p>
              </div>
            )}
            {record.indications?.length && (
              <div>
                <Label>Indications</Label>
                <ul className="mt-1 space-y-1">
                  {record.indications.map((ind) => (
                    <li key={ind} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="text-green-500 text-xs">●</span>{ind}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {record.contraindications?.length && (
              <div>
                <Label>Contraindications</Label>
                <ul className="mt-1 space-y-1">
                  {record.contraindications.map((ci) => (
                    <li key={ci} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="text-red-400 text-xs">●</span>{ci}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {record.sideEffects?.length && (
              <div>
                <Label>Common Side Effects</Label>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {record.sideEffects.map((se) => (
                    <span key={se} className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
                      {se}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* FHIR coding identifiers */}
          <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
            <SectionTitle>FHIR Coding Identifiers</SectionTitle>
            <CodeRow system="RxNorm" uri={FHIR_SYSTEMS.RXNORM} code={record.rxcui ?? record.codes} display={record.name} />
            {record.loincCode && (
              <CodeRow system="LOINC" uri={FHIR_SYSTEMS.LOINC} code={record.loincCode} display="Lab / Observation code" />
            )}
            {record.snomedCode && (
              <CodeRow system="SNOMED CT" uri={FHIR_SYSTEMS.SNOMED} code={record.snomedCode} display="Clinical finding" />
            )}

            <div className="pt-3 border-t border-slate-100">
              <Label>FHIR MedicationRequest snippet</Label>
              <pre className="mt-2 text-xs bg-slate-900 text-green-300 rounded-lg p-3 overflow-x-auto leading-relaxed">
{`{
  "resourceType": "MedicationRequest",
  "status": "${record.status}",
  "intent": "order",
  "medicationCodeableConcept": {
    "coding": [{
      "system": "${FHIR_SYSTEMS.RXNORM}",
      "code": "${record.rxcui ?? record.codes}",
      "display": "${record.name}"
    }]
  },
  "dosageInstruction": [{
    "route": {
      "coding": [{
        "system": "${FHIR_SYSTEMS.HL7_MEDICATION_ADMIN_ROUTE}",
        "display": "${record.adminRoute}"
      }]
    },
    "timing": { "code": { "text": "${record.frequency}" } }
  }]
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Meta footer */}
        <div className="bg-white rounded-xl shadow-sm px-5 py-3 flex flex-wrap gap-6 text-xs text-slate-500">
          {record.source && <span>Source: <strong className="text-slate-700">{record.source}</strong></span>}
          {record.lastUpdated && <span>Last Updated: <strong className="text-slate-700">{record.lastUpdated}</strong></span>}
        </div>
      </main>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">{children}</h3>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{children}</p>
);

const Fact: React.FC<{ label: string; value?: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div>
    <Label>{label}</Label>
    <p className={`text-sm text-slate-700 mt-0.5 ${mono ? "font-mono" : ""}`}>{value ?? "—"}</p>
  </div>
);

const CodeRow: React.FC<{ system: string; uri: string; code?: string; display?: string }> = ({
  system, uri, code, display,
}) => (
  <div className="border border-slate-100 rounded-lg px-3 py-2.5 space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold text-slate-600">{system}</span>
      {code && <code className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">{code}</code>}
    </div>
    <p className="text-xs text-slate-400 font-mono truncate">{uri}</p>
    {display && <p className="text-xs text-slate-600">{display}</p>}
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <div className="bg-blue-800 h-16" />
    <div className="p-6 space-y-4 max-w-5xl">
      {[100, 80, 60].map((w, i) => (
        <div key={i} className="h-6 bg-slate-200 rounded animate-pulse" style={{ width: `${w}%` }} />
      ))}
    </div>
  </div>
);

const NotFound: React.FC<{ onBack: () => void; id?: string }> = ({ onBack, id }) => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <p className="text-4xl">🔍</p>
    <p className="text-lg font-bold text-slate-700">Record not found</p>
    <p className="text-sm text-slate-500">No record with ID <code className="font-mono">{id}</code> exists.</p>
    <button onClick={onBack} className="mt-2 text-sm text-blue-600 hover:underline font-medium">← Go back</button>
  </div>
);
