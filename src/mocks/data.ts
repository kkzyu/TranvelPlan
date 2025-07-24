import { PlanItem } from '@/pages/index';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const mockPlanItems: PlanItem[] = [
  {
    id: generateId(),
    name: '故宫博物院',
    location: '北京市东城区景山前街4号',
    isStart: true,
    isEnd: false,
    mode: 'walking',
    time: '09:00',
    checked: true,
  },
  {
    id: generateId(),
    name: '景山公园',
    location: '北京市西城区景山前街',
    isStart: false,
    isEnd: false,
    mode: 'walking',
    time: '11:00',
    checked: true,
  },
  {
    id: generateId(),
    name: '北海公园',
    location: '北京市西城区文津街1号',
    isStart: false,
    isEnd: true,
    mode: 'riding',
    time: '14:00',
    checked: true,
  },
  {
    id: generateId(),
    name: '什刹海',
    location: '北京市西城区什刹海',
    isStart: false,
    isEnd: false,
    mode: 'riding',
    checked: false,
  },
  {
    id: generateId(),
    name: '南锣鼓巷',
    location: '北京市东城区南锣鼓巷',
    isStart: false,
    isEnd: false,
    mode: 'walking',
    checked: true,
  }
];

// 模拟路线规划结果
export const mockRouteResponse = {
  status: '1',
  route: {
    paths: [
      [
        [116.397026, 39.918058], // 故宫
        [116.395798, 39.918458],
        [116.394567, 39.918858],
        [116.393321, 39.919258]  // 景山
      ]
    ],
    taxi_cost: 0,
    distance: 1200, // 米
    duration: 900 // 秒
  }
};

export const mockSearchSuggestions = [
  { name: '故宫博物院', location: '北京市东城区景山前街4号' },
  { name: '天安门广场', location: '北京市东城区长安街' },
  { name: '王府井步行街', location: '北京市东城区王府井大街' },
  { name: '颐和园', location: '北京市海淀区新建宫门路19号' },
  { name: '八达岭长城', location: '北京市延庆区G6京藏高速' }
];