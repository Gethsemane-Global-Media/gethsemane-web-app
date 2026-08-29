export interface BibleVersion {
  id: string;
  short: string;
  long: string;
}

export const BIBLE_VERSIONS: BibleVersion[] = [
  { id: 'de4e12af7f28f599-01', short: 'KJV', long: 'King James Version' },
  { id: '06125adad2d5898a-01', short: 'AMP', long: 'Amplified Bible' },
  { id: '13a726d4c7526a0b-01', short: 'NLT', long: 'New Living Translation' },
];