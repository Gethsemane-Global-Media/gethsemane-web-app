import React, { useState } from 'react';

interface Props {
  onNavigateBack: () => void;
}

interface SchoolInfo {
  code: string;
  name: string;
  duration: string;
  target: string;
  description: string;
  prerequisite?: string;
  curriculum: string[];
}

export const DiscipleshipPage: React.FC<Props> = ({ onNavigateBack }) => {
  const schools: SchoolInfo[] = [
    {
      code: 'GFC',
      name: 'Gethsemane Foundation Class',
      duration: '4 Weeks',
      target: 'New converts & believers establishing foundational doctrines',
      description: 'The entrance gate to kingdom discipleship. Solidify assurance of salvation, water baptism, the ministry of the Holy Spirit, prayer foundations, and spiritual growth disciplines.',
      curriculum: ['Assurance of Salvation', 'The Authority of the Believer', 'Quiet Time & Secret Place Life', 'Kingdom Stewardship'],
    },
    {
      code: 'GWD',
      name: 'Gethsemane Workers Discipleship',
      duration: '8 Weeks',
      target: 'Active church workers, department heads & ministers',
      description: 'Equipping believers for ministry service readiness, character forging under apostolic discipline, spiritual warfare dynamics, and ministerial protocol.',
      prerequisite: 'GFC Completion',
      curriculum: ['The Heart of a Servant', 'Spiritual Authority & Submission', 'Spiritual Warfare Dynamics', 'Ministerial Ethics & Loyalty'],
    },
    {
      code: 'GSOM',
      name: 'Gethsemane School of Ministry',
      duration: '12 Weeks',
      target: 'Called ministers, church planters & pulpit leaders',
      description: 'Comprehensive equipping in apostolic doctrines, pulpit grace, hermeneutics, ministerial administration, fivefold ministry operations, and altar dynamics.',
      prerequisite: 'GWD / GFC Completion',
      curriculum: ['Hermeneutics & Expository Preaching', 'Ruach Elohim: Holy Spirit Operations', 'Apostolic Altar Ministry', 'Church Governance & Leadership'],
    },
    {
      code: 'ESG',
      name: 'Episcopal School of Gethsemane',
      duration: '6 Months (Intensive)',
      target: 'Senior ministers, apostles, episcopal leaders & seasoned stewards',
      description: 'High-level executive equipping in territorial apostolic mandate, episcopal oversight, fivefold ordination, and national spiritual reformation.',
      prerequisite: 'GSOM Mandatory Completion',
      curriculum: ['Episcopal Oversight & Jurisdictions', 'Territorial Intercession & Deliverance', 'Apostolic Presbytery Protocols', 'Commissioning & Apostolic Succession'],
    },
  ];

  const [selectedSchool, setSelectedSchool] = useState<SchoolInfo | null>(null);
  const [hasCompletedGsom, setHasCompletedGsom] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleApply = (school: SchoolInfo) => {
    setSelectedSchool(school);
    setApplicationSuccess(false);
    setErrorMessage('');
  };

  const submitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (selectedSchool?.code === 'ESG' && !hasCompletedGsom) {
      setErrorMessage('Prerequisite Required: You cannot apply for ESG (Episcopal School of Gethsemane) without completing GSOM (Gethsemane School of Ministry) first.');
      return;
    }

    // Success
    setApplicationSuccess(true);
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200/80 bg-white/90 px-4 py-3 backdrop-blur-md">
        <button
          onClick={onNavigateBack}
          className="flex items-center gap-1.5 rounded-full p-2 text-brand-dark hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-semibold">Home</span>
        </button>

        <h1 className="text-xs font-bold text-brand-dark">Gethsemane Discipleship</h1>

        <div className="w-8" />
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4 space-y-4">
        {/* Banner */}
        <div className="rounded-3xl bg-brand-dark p-6 text-white shadow-sm">
          <span className="inline-block rounded-full bg-brand-green/20 px-3 py-1 text-[11px] font-semibold text-brand-green">
            Rooted Academic Academy
          </span>
          <h2 className="mt-2 text-xl sm:text-2xl font-black">Discipleship Tiers</h2>
          <p className="text-xs text-neutral-300 mt-1">
            Transformational spiritual formation across GFC, GWD, GSOM, and ESG cohorts.
          </p>
        </div>

        {/* School Cards */}
        <div className="space-y-4">
          {schools.map((school) => (
            <div
              key={school.code}
              className="rounded-3xl bg-white p-5 sm:p-6 border border-gray-200 shadow-xs space-y-3 transition-all hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-brand-dark px-3 py-1 text-xs font-extrabold text-white">
                    {school.code}
                  </span>
                  <span className="text-xs font-semibold text-brand-green">
                    {school.duration}
                  </span>
                </div>

                {school.prerequisite && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                    Prereq: {school.prerequisite}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-brand-dark">{school.name}</h3>
              <p className="text-xs text-brand-secondary leading-relaxed">{school.description}</p>

              {/* Core Outlines */}
              <div className="pt-2 border-t border-gray-100">
                <span className="text-[11px] font-bold text-brand-dark block mb-1.5">Core Curriculum Focus:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {school.curriculum.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-xs text-brand-secondary">
                      <span className="text-brand-green font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply CTA */}
              <div className="pt-3 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => handleApply(school)}
                  className="px-4 py-2 rounded-2xl bg-brand-green hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  Apply for {school.code} Cohort →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Application Modal */}
      {selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto text-brand-dark">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-brand-green uppercase">Admissions Application</span>
                <h3 className="text-base font-bold text-brand-dark mt-0.5">{selectedSchool.name} ({selectedSchool.code})</h3>
              </div>
              <button
                onClick={() => setSelectedSchool(null)}
                className="p-1 rounded-full text-gray-400 hover:text-brand-dark"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {applicationSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-brand-dark">Application Submitted Successfully!</h4>
                <p className="text-xs text-brand-secondary">
                  Your registration for <strong>{selectedSchool.name}</strong> has been received. Our academic admissions office will contact you via email with matriculation details.
                </p>
                <button
                  onClick={() => setSelectedSchool(null)}
                  className="mt-3 px-5 py-2 rounded-2xl bg-brand-dark text-white font-bold text-xs"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={submitApplication} className="mt-4 space-y-3.5 text-xs">
                {errorMessage && (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-relaxed">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="font-semibold text-brand-dark">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. John Emmanuel"
                    className="mt-1 w-full rounded-2xl bg-brand-bg px-3.5 py-2 text-xs border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-brand-dark">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="mt-1 w-full rounded-2xl bg-brand-bg px-3.5 py-2 text-xs border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>

                <div>
                  <label className="font-semibold text-brand-dark">WhatsApp / Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={applicantPhone}
                    onChange={(e) => setApplicantPhone(e.target.value)}
                    placeholder="+234..."
                    className="mt-1 w-full rounded-2xl bg-brand-bg px-3.5 py-2 text-xs border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>

                {/* Prerequisite Verification for ESG */}
                {selectedSchool.code === 'ESG' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                    <span className="text-[11px] font-bold text-amber-900 block">
                      Prerequisite Verification Required:
                    </span>
                    <label className="flex items-start gap-2 text-xs text-amber-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasCompletedGsom}
                        onChange={(e) => setHasCompletedGsom(e.target.checked)}
                        className="mt-0.5 rounded text-brand-green"
                      />
                      <span>I have officially completed and graduated from the Gethsemane School of Ministry (GSOM).</span>
                    </label>
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSchool(null)}
                    className="px-4 py-2 rounded-2xl bg-gray-100 text-brand-dark font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-2xl bg-brand-green hover:bg-emerald-600 text-white font-bold shadow-md"
                  >
                    Submit Cohort Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
