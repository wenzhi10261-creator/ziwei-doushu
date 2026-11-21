/**
 * 虚构排盘示例。
 *
 * 下面的年月日、钟点、经度和姓名是为了验证引擎写的，不对应任何真人，
 * 也不表示真实出生地。脚本只在本进程计算，不读密钥，不访问网络，
 * 不写 localStorage。
 *
 * 运行：npm run demo:fictional
 */
import { generateChart } from '../../lib/ziwei/algorithm';
import { generateTrueSolarChart, resolveTrueSolarBirthInfo } from '../../lib/ziwei/chart-entry';
import { STAR_DB } from '../../lib/ziwei/db-analysis';
import type { BirthInfo, ZiweiChart } from '../../lib/ziwei/types';

const BRANCH = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

const clock = {
  year: 2001,
  month: 1,
  day: 1,
  clockHour: 8,
  clockMinute: 30,
};

const birth: BirthInfo = {
  name: '虚构示例甲',
  year: clock.year,
  month: clock.month,
  day: clock.day,
  hour: 0,
  gender: 'male',
  longitude: 121.5,
};

function branchName(index: number): string {
  const name = BRANCH[index];
  if (!name) throw new Error(`时辰索引超出 0-11：${index}`);
  return name;
}

function summarize(chart: ZiweiChart) {
  return {
    chartDate: {
      year: chart.birthInfo.year,
      month: chart.birthInfo.month,
      day: chart.birthInfo.day,
    },
    hourBranchIndex: chart.birthInfo.hour,
    hourBranchName: branchName(chart.birthInfo.hour),
    lunar: {
      lunarYear: chart.lunarInfo.lunarYear,
      lunarMonth: chart.lunarInfo.lunarMonth,
      lunarDay: chart.lunarInfo.lunarDay,
      isLeapMonth: chart.lunarInfo.isLeapMonth,
      fourPillars: chart.lunarInfo.fourPillars,
    },
    wuxingJu: chart.wuxingJuName,
    mingGong: branchName(chart.mingGongBranch),
    shenGong: branchName(chart.shenGongBranch),
    mingZhu: chart.mingZhu,
    shenZhu: chart.shenZhu,
    yinYangGender: chart.yinYangGender,
    palaces: chart.palaces.map((palace) => ({
      branch: branchName(palace.branch),
      name: palace.name,
      major: palace.stars
        .filter((star) => star.type === 'major')
        .map((star) => `${star.name}${star.siHua ? `化${star.siHua}` : ''}`),
    })),
  };
}

const resolved = resolveTrueSolarBirthInfo(birth, clock);
const chart = generateTrueSolarChart(birth, clock);
branchName(resolved.hour);

const farLongitude: BirthInfo = { ...birth, name: '虚构示例乙', longitude: 75 };
const farResolved = resolveTrueSolarBirthInfo(farLongitude, clock);

const mistaken = generateChart({
  ...birth,
  name: '虚构对照（把钟点误当时辰索引）',
  hour: clock.clockHour,
  longitude: undefined,
});

const report = {
  disclaimer: '虚构资料，非真人出生信息。本脚本未调用 /api/interpret、/api/heming，也未连接任何付费接口。',
  input: {
    name: birth.name,
    clock: `${clock.year}-${String(clock.month).padStart(2, '0')}-${String(clock.day).padStart(2, '0')} ${String(clock.clockHour).padStart(2, '0')}:${String(clock.clockMinute).padStart(2, '0')}`,
    longitude: birth.longitude,
    longitudeNote: '虚构经度，只用于真太阳时换算，不是出生地声明。',
  },
  hourField: {
    meaning: 'BirthInfo.hour 是 0-11 的时辰地支索引，不是 0-23 的钟点。',
    clockHour: clock.clockHour,
    resolvedHourBranchIndex: resolved.hour,
    resolvedHourBranchName: branchName(resolved.hour),
    clockHourIsNotBranchIndex: clock.clockHour !== resolved.hour,
  },
  trueSolarChart: summarize(chart),
  farLongitudeCheck: {
    name: farLongitude.name,
    longitude: farLongitude.longitude,
    resolvedHourBranchIndex: farResolved.hour,
    resolvedHourBranchName: branchName(farResolved.hour),
    chartDate: {
      year: farResolved.year,
      month: farResolved.month,
      day: farResolved.day,
    },
  },
  mistakenClockAsBranchIndex: {
    note: '若把钟点 8 直接写入 BirthInfo.hour，引擎会把它当成申时（索引 8），而不是上午 8 点。',
    hourBranchIndex: mistaken.birthInfo.hour,
    hourBranchName: branchName(mistaken.birthInfo.hour),
    mingGong: branchName(mistaken.mingGongBranch),
    differsFromTrueSolarMingGong: mistaken.mingGongBranch !== chart.mingGongBranch,
  },
  limits: {
    starDbEntries: Object.keys(STAR_DB).length,
    interpretRoute: '开源树没有 /api/interpret',
    hemingRoute: '开源树没有 /api/heming',
  },
};

console.log(JSON.stringify(report, null, 2));
