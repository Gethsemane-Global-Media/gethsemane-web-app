export interface BibleVersion {
  id: string;
  short: string;
  long:string;
}

export const BIBLE_VERSIONS: BibleVersion[] = [
  { id: 'de4e12af7f28f599-01', short: 'KJV', long: 'King James Version' },
  { id: 'bba9f4018352646c-01', short: 'NKJV', long: 'New King James Version' },
  { id: '06125adad2d5898a-01', short: 'AMP', long: 'Amplified Bible' },
  { id: '13a726d4c7526a0b-01', short: 'NLT', long: 'New Living Translation' },
  { id: 'f421fe261da7624f-01', short: 'ESV', long: 'English Standard Version' },
  { id: 'db2315a6b04b4d49-01', short: 'MSG', long: 'Message Translation' },
];