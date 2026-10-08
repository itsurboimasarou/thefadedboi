const NAMES: Record<string, number> = {
  mon: 1, monday: 1, t2: 1,
  tue: 2, tues: 2, tuesday: 2, t3: 2,
  wed: 3, weds: 3, wednesday: 3, t4: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4, t5: 4,
  fri: 5, friday: 5, t6: 5,
  sat: 6, saturday: 6, t7: 6,
  sun: 7, sunday: 7, cn: 7,
};

export function weekdayOf(folder: string): number | undefined {
  return NAMES[folder.trim().toLowerCase()];
}
