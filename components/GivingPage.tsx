import React, { useState } from 'react';

interface Props {
  onNavigateBack: () => void;
}

export const GivingPage: React.FC<Props> = ({ onNavigateBack }) => {
  const mainMinistryAccounts = [
    { currency: 'NGN (Naira)', number: '3001231735', display: '3001 23 1735' },
    { currency: 'USD (US Dollar)', number: '3001231759', display: '3001 23 1759' },
    { currency: 'GBP (British Pound)', number: '3001231773', display: '3001 23 1773' },
    { currency: 'EUR (Euro)', number: '3001231807', display: '3001 23 1807' },
  ];

  const buildingAccount = {
    accountName: "Gethsemane Kingdom Network Int'l - Dauda David Onoruoyiza",
    accountNumber: '6673374265',
    bankName: 'Moniepoint MFB',
    purpose: 'Church Building, Cathedral Infrastructure & Special Programs',
  };

  const leadPastorAccounts = [
    {
      accountName: 'DAVID ONORUOYIZA DAUDA',
      accountNumber: '8142786104',
      bankName: 'PalmPay',
      purpose: 'Prophetic Seed, Pastor Honorarium & Personal Blessing',
    },
    {
      accountName: 'Dauda David Onoruoyiza',
      accountNumber: '0169910412',
      bankName: 'GTBank',
      purpose: 'Prophetic Seed, Pastor Honorarium & Personal Blessing',
    },
  ];

  const partnershipTiers = [
    {
      name: 'Media Evangelism Partner',
      description: 'Supports weekly live streaming, satellite broadcasts, and audio CDN distribution worldwide.',
    },
    {
      name: 'Discipleship & Student Sponsor',
      description: 'Covers study materials, curriculum printing, and tuition scholarships for emerging ministers.',
    },
    {
      name: 'Sanctuary Builder',
      description: 'Directly funds church infrastructure, auditorium expansion, and ministry campus development.',
    },
    {
      name: 'General Kingdom Stewardship',
      description: 'Faithful covenant partnership for daily ministry operations and global evangelistic outreaches.',
    },
  ];

  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const copyToClipboard = (accNum: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(accNum);
    } else {
      const input = document.createElement('input');
      input.value = accNum;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopiedAccount(accNum);
    setTimeout(() => setCopiedAccount(null), 2500);
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

        <h1 className="text-xs font-bold text-brand-dark">Kingdom Giving</h1>

        <div className="w-8" />
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-4 space-y-4">
        {/* Banner */}
        <div className="rounded-3xl bg-brand-dark p-6 text-white shadow-sm">
          <span className="inline-block rounded-full bg-brand-green/20 px-3 py-1 text-[11px] font-semibold text-brand-green">
            Covenant Partnership
          </span>
          <h2 className="mt-2 text-xl sm:text-2xl font-black">Kingdom Giving & Partnership</h2>
          <p className="text-xs text-neutral-300 mt-1">
            "Give, and it shall be given unto you; good measure, pressed down, shaken together, and running over." — Luke 6:38
          </p>
        </div>

        {/* 1. Main Ministry Accounts */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase text-brand-green">Corporate Ministry Giving</span>
              <h3 className="text-base font-bold text-brand-dark mt-0.5">Main Ministry Accounts</h3>
            </div>
            <span className="rounded-full bg-brand-bg px-2.5 py-1 text-[10px] font-bold text-brand-dark border border-gray-200">
              Bank: GTBank • SWIFT: GTBINGLA
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-brand-bg border border-gray-200/80">
            <div className="text-[11px] font-bold text-brand-secondary">Account Name:</div>
            <div className="text-sm font-extrabold text-brand-dark mt-0.5">
              GETHSEMANE KINGDOM NETWORK INTL
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mainMinistryAccounts.map((acc) => (
              <div
                key={acc.number}
                className="p-3.5 rounded-2xl bg-brand-bg border border-gray-200/80 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-[10px] font-bold uppercase text-brand-green">{acc.currency}</div>
                  <div className="font-mono text-sm sm:text-base font-black text-brand-dark tracking-wider mt-0.5">
                    {acc.display}
                  </div>
                </div>

                <button
                  onClick={() => copyToClipboard(acc.number)}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-brand-dark hover:bg-brand-green hover:text-white hover:border-brand-green text-[11px] font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  {copiedAccount === acc.number ? (
                    <>
                      <svg className="w-3 h-3 text-brand-green fill-current" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Building and Program Account */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase text-brand-green">Infrastructure & Projects</span>
            <h3 className="text-base font-bold text-brand-dark mt-0.5">Building and Program Account</h3>
            <p className="text-xs text-brand-secondary">
              For church building, auditorium expansion, and ministerial program sponsorship.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-brand-bg border border-gray-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-brand-dark">{buildingAccount.bankName}</div>
              <div className="font-mono text-base sm:text-lg font-black text-brand-green tracking-wider">
                {buildingAccount.accountNumber}
              </div>
              <div className="text-[11px] text-brand-dark font-medium">{buildingAccount.accountName}</div>
              <div className="text-[10px] text-brand-secondary">{buildingAccount.purpose}</div>
            </div>

            <button
              onClick={() => copyToClipboard(buildingAccount.accountNumber)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-brand-dark hover:bg-brand-green hover:text-white hover:border-brand-green text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
            >
              {copiedAccount === buildingAccount.accountNumber ? (
                <>
                  <svg className="w-3.5 h-3.5 text-brand-green fill-current" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  <span>Copy Account</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 3. Lead Pastor's Account Details */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase text-brand-green">Prophetic Honorarium</span>
            <h3 className="text-base font-bold text-brand-dark mt-0.5">The Lead Pastor's Account Details</h3>
            <p className="text-xs text-brand-secondary">
              For prophetic seeds, personal blessing, and honorarium unto the servant of God.
            </p>
          </div>

          <div className="space-y-3">
            {leadPastorAccounts.map((acc) => (
              <div
                key={acc.accountNumber}
                className="p-4 rounded-2xl bg-brand-bg border border-gray-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="text-xs font-bold text-brand-dark">{acc.bankName}</div>
                  <div className="font-mono text-base sm:text-lg font-black text-brand-green tracking-wider">
                    {acc.accountNumber}
                  </div>
                  <div className="text-[11px] text-brand-dark font-medium">{acc.accountName}</div>
                  <div className="text-[10px] text-brand-secondary">{acc.purpose}</div>
                </div>

                <button
                  onClick={() => copyToClipboard(acc.accountNumber)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-gray-200 text-brand-dark hover:bg-brand-green hover:text-white hover:border-brand-green text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  {copiedAccount === acc.accountNumber ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-brand-green fill-current" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span>Copy Account</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership Tiers */}
        <div className="rounded-3xl bg-white p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase text-brand-green">Strategic Impact</span>
            <h3 className="text-base font-bold text-brand-dark mt-0.5">Ministry Partnership Arms</h3>
            <p className="text-xs text-brand-secondary">
              Partner consistently with the apostolic mandate across strategic ministry arms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {partnershipTiers.map((tier, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-brand-bg border border-gray-200/80 space-y-1">
                <h4 className="text-xs font-bold text-brand-dark">{tier.name}</h4>
                <p className="text-[11px] text-brand-secondary leading-relaxed">{tier.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
