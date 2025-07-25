  export const MODE_NAMES: Record<string, string> = {
    driving: '驾车',
    walking: '步行', 
    bicycling: '骑行',
    elecbike: '电动车',
    transit: '公交'
  };

  export const MODE_COLORS: Record<string, string> = {
    driving: '#1890ff',
    walking: '#52c41a',
    bicycling: '#faad14',
    elecbike: '#722ed1',
    transit: '#f759ab'
  };

export interface Option {
  value: string;
  label: string;
  children?: Option[];
}

export type CityOptions = Option[];

export const CityOptions: CityOptions =[
    {
    value: 'zhejiang',
    label: '浙江',
    children: [
      {
        value: 'hangzhou',
        label: '杭州',
      },
      {
        value: 'ningbo',
        label: '宁波',
      },
      {
        value: 'wenzhou',
        label: '温州',
      },
      {
        value: 'shaoxing',
        label: '绍兴',
      },
      {
        value: 'huzhou',
        label: '湖州',
      },
      {
        value: 'jiaxing',
        label: '嘉兴',
      },
      {
        value: 'zhoushan',
        label: '舟山',
      },
      {
        value: 'quzhou',
        label: '衢州',
      },
      {
        value: 'taizhou',
        label: '台州',
      },
      {
        value: 'lishui',
        label: '丽水',
      },
    ],
  },
  {
    value: 'jiangsu',
    label: '江苏',
    children: [
      {
        value: 'nanjing',
        label: '南京',
      },
      {
        value: 'suzhou',
        label: '苏州',
      },
      {
        value: 'wuxi',
        label: '无锡',
      },
      {
        value: 'changzhou',
        label: '常州',
      },
      {
        value: 'zhenjiang',
        label: '镇江',
      },
      {
        value: 'nantong',
        label: '南通',
      },
      {
        value: 'yangzhou',
        label: '扬州',
      },
      {
        value: 'taizhou',
        label: '泰州',
      },
      {
        value: 'xuzhou',
        label: '徐州',
      },
      {
        value: 'huai an',
        label: '淮安',
      },
      {
        value: 'yancheng',
        label: '盐城',
      },
      {
        value: 'lianyungang',
        label: '连云港',
      },
      {
        value: 'suqian',
        label: '宿迁',
      },
    ],
  },
  {
    value: 'beijing',
    label: '北京',
    children: [
      {
        value: 'beijing',
        label: '北京',
      },
    ],
  },
  {
    value: 'shanghai',
    label: '上海',
    children: [
      {
        value: 'shanghai',
        label: '上海',
      },
    ],
  },
  {
    value: 'guangdong',
    label: '广东',
    children: [
      {
        value: 'guangzhou',
        label: '广州',
      },
      {
        value: 'shenzhen',
        label: '深圳',
      },
      {
        value: 'zhuhai',
        label: '珠海',
      },
      {
        value: 'shantou',
        label: '汕头',
      },
      {
        value: 'foshan',
        label: '佛山',
      },
      {
        value: 'dongguan',
        label: '东莞',
      },
      {
        value: 'zhongshan',
        label: '中山',
      },
      {
        value: 'jiangmen',
        label: '江门',
      },
      {
        value: 'huizhou',
        label: '惠州',
      },
      {
        value: 'maoming',
        label: '茂名',
      },
      {
        value: 'zhanjiang',
        label: '湛江',
      },
      {
        value: 'meizhou',
        label: '梅州',
      },
      {
        value: 'qingyuan',
        label: '清远',
      },
      {
        value: 'shaoguan',
        label: '韶关',
      },
      {
        value: 'yunfu',
        label: '云浮',
      },
      {
        value: 'chaozhou',
        label: '潮州',
      },
      {
        value: 'jieyang',
        label: '揭阳',
      },
      {
        value: 'heyuan',
        label: '河源',
      },
    ],
  },
  {
    value: 'sichuan',
    label: '四川',
    children: [
      {
        value: 'chengdu',
        label: '成都',
      },
      {
        value: 'mianyang',
        label: '绵阳',
      },
      {
        value: 'deyang',
        label: '德阳',
      },
      {
        value: 'nanchong',
        label: '南充',
      },
      {
        value: 'ziyang',
        label: '资阳',
      },
      {
        value: 'zigong',
        label: '自贡',
      },
      {
        value: 'panzhihua',
        label: '攀枝花',
      },
      {
        value: 'luzhou',
        label: '泸州',
      },
      {
        value: 'dazhou',
        label: '达州',
      },
      {
        value: 'guangyuan',
        label: '广元',
      },
      {
        value: 'yibin',
        label: '宜宾',
      },
      {
        value: 'neijiang',
        label: '内江',
      },
      {
        value: 'leshan',
        label: '乐山',
      },
      {
        value: 'bazhong',
        label: '巴中',
      },
      {
        value: 'yaan',
        label: '雅安',
      },
      {
        value: 'ganzi',
        label: '甘孜',
      },
      {
        value: 'liangshan',
        label: '凉山',
      },
      {
        value: 'abazhou',
        label: '阿坝',
      },
    ],
  },
  {
    value: 'yunnan',
    label: '云南',
    children: [
      {
        value: 'kunming',
        label: '昆明',
      },
      {
        value: 'dali',
        label: '大理',
      },
      {
        value: 'lijiang',
        label: '丽江',
      },
      {
        value: 'xishuangbanna',
        label: '西双版纳',
      },
      {
        value: 'baoshan',
        label: '保山',
      },
      {
        value: 'chuxiong',
        label: '楚雄',
      },
      {
        value: 'dehong',
        label: '德宏',
      },
      {
        value: 'nujiang',
        label: '怒江',
      },
      {
        value: 'diqing',
        label: '迪庆',
      },
      {
        value: 'zhaotong',
        label: '昭通',
      },
      {
        value: 'qujing',
        label: '曲靖',
      },
      {
        value: 'yuxi',
        label: '玉溪',
      },
      {
        value: 'honghe',
        label: '红河',
      },
      {
        value: 'wenchuan',
        label: '文山',
      },
      {
        value: 'puer',
        label: '普洱',
      },
      {
        value: 'linfen',
        label: '临沧',
      },
    ],
  },
  {
    value: 'hainan',
    label: '海南',
    children: [
      {
        value: 'haikou',
        label: '海口',
      },
      {
        value: 'sanya',
        label: '三亚',
      },
      {
        value: 'danzhou',
        label: '儋州',
      },
      {
        value: 'wuzhishan',
        label: '五指山',
      },
      {
        value: 'qionghai',
        label: '琼海',
      },
      {
        value: 'wanning',
        label: '万宁',
      },
      {
        value: 'wenchang',
        label: '文昌',
      },
      {
        value: 'dongfang',
        label: '东方',
      },
    ],
  },
  {
    value: 'hunan',
    label: '湖南',
    children: [
      {
        value: 'changsha',
        label: '长沙',
      },
      {
        value: 'zhuzhou',
        label: '株洲',
      },
      {
        value: 'xiangtan',
        label: '湘潭',
      },
      {
        value: 'hengyang',
        label: '衡阳',
      },
      {
        value: 'shaoyang',
        label: '邵阳',
      },
      {
        value: 'yueyang',
        label: '岳阳',
      },
      {
        value: 'changde',
        label: '常德',
      },
      {
        value: 'zhangjiajie',
        label: '张家界',
      },
      {
        value: 'yiyang',
        label: '益阳',
      },
      {
        value: 'chenzhou',
        label: '郴州',
      },
      {
        value: 'yongzhou',
        label: '永州',
      },
      {
        value: 'huaihua',
        label: '怀化',
      },
      {
        value: 'loudi',
        label: '娄底',
      },
      {
        value: 'xiangxi',
        label: '湘西',
      },
    ],
  },
  {
    value: 'hubei',
    label: '湖北',
    children: [
      {
        value: 'wuhan',
        label: '武汉',
      },
      {
        value: 'huangshi',
        label: '黄石',
      },
      {
        value: 'shiyan',
        label: '十堰',
      },
      {
        value: 'yichang',
        label: '宜昌',
      },
      {
        value: 'xiangyang',
        label: '襄阳',
      },
      {
        value: 'ezhou',
        label: '鄂州',
      },
      {
        value: 'jingmen',
        label: '荆门',
      },
      {
        value: 'xiaogan',
        label: '孝感',
      },
      {
        value: 'jingzhou',
        label: '荆州',
      },
      {
        value: 'huanggang',
        label: '黄冈',
      },
      {
        value: 'xianning',
        label: '咸宁',
      },
      {
        value: 'suizhou',
        label: '随州',
      },
      {
        value: 'enshi',
        label: '恩施',
      },
    ],
  },
  {
    value: 'shandong',
    label: '山东',
    children: [
      {
        value: 'jinan',
        label: '济南',
      },
      {
        value: 'qingdao',
        label: '青岛',
      },
      {
        value: 'zibo',
        label: '淄博',
      },
      {
        value: 'zaozhuang',
        label: '枣庄',
      },
      {
        value: 'dongying',
        label: '东营',
      },
      {
        value: 'yantai',
        label: '烟台',
      },
      {
        value: 'weifang',
        label: '潍坊',
      },
      {
        value: 'jining',
        label: '济宁',
      },
      {
        value: 'taian',
        label: '泰安',
      },
      {
        value: 'weihai',
        label: '威海',
      },
      {
        value: 'rizhao',
        label: '日照',
      },
      {
        value: 'laiwu',
        label: '莱芜',
      },
      {
        value: 'linyi',
        label: '临沂',
      },
      {
        value: 'dezhou',
        label: '德州',
      },
      {
        value: 'liaocheng',
        label: '聊城',
      },
      {
        value: 'binzhou',
        label: '滨州',
      },
      {
        value: 'heze',
        label: '菏泽',
      },
    ],
  },
]

export const CITY_CENTERS: Record<string, [number, number]> = {
  '杭州': [120.153576, 30.287459],
  '宁波': [121.549792, 29.870244],
  '温州': [120.699374, 27.994207],
  '绍兴': [120.580045, 30.023551],
  '湖州': [120.097547, 30.872655],
  '嘉兴': [120.756608, 30.750483],
  '舟山': [122.207217, 30.025551],
  '衢州': [118.876444, 28.946588],
  '台州': [121.420711, 28.656387],
  '丽水': [119.921033, 28.451379],

  '南京': [118.767413, 32.041544],
  '苏州': [120.585316, 31.29888],
  '无锡': [120.299393, 31.573885],
  '常州': [119.955045, 31.795574],
  '镇江': [119.452783, 32.204402],
  '南通': [120.864688, 32.016175],
  '扬州': [119.421009, 32.393152],
  '泰州': [119.915173, 32.484882],
  '徐州': [117.184811, 34.261792],
  '淮安': [119.015305, 33.581511],
  '盐城': [120.139998, 33.377631],
  '连云港': [119.221617, 34.576476],
  '宿迁': [118.276837, 33.939688],

  '北京': [116.397428, 39.90923],
  '上海': [121.473701, 31.230416],

  '广州': [113.280637, 23.125178],
  '深圳': [114.085947, 22.547],
  '珠海': [113.576726, 22.270703],
  '汕头': [116.683828, 23.355818],
  '佛山': [113.122717, 23.028595],
  '东莞': [113.75179, 23.020748],
  '中山': [113.382333, 22.521112],
  '江门': [113.094175, 22.589016],
  '惠州': [114.412605, 23.07942],
  '茂名': [110.919231, 21.659752],
  '湛江': [110.359377, 21.270679],
  '梅州': [116.119268, 24.299056],
  '清远': [113.04789, 24.325153],
  '韶关': [113.598407, 24.809434],
  '云浮': [112.044382, 22.927393],
  '潮州': [116.632303, 23.661951],
  '揭阳': [116.355529, 23.543716],
  '河源': [114.697808, 23.746275],

  '成都': [104.065735, 30.659462],
  '绵阳': [104.741657, 31.455295],
  '德阳': [104.394943, 31.128142],
  '南充': [106.082976, 30.795771],
  '资阳': [104.641797, 30.123222],
  '自贡': [104.778442, 29.359089],
  '攀枝花': [101.718636, 26.582347],
  '泸州': [105.443737, 28.878649],
  '达州': [107.502627, 31.209818],
  '广元': [105.828737, 32.433767],
  '宜宾': [104.569279, 28.763023],
  '内江': [105.052014, 29.582056],
  '乐山': [103.761017, 29.563017],
  '巴中': [106.753537, 31.857465],
  '雅安': [103.001858, 29.98289],
  '甘孜': [100.233394, 30.050591],
  '凉山': [102.266365, 27.902191],
  '阿坝': [102.22435, 31.898394],

  '昆明': [102.832892, 24.880095],
  '大理': [100.228445, 25.616545],
  '丽江': [100.226146, 26.864494],
  '西双版纳': [100.799647, 22.003307],
  '保山': [99.166606, 25.111631],
  '楚雄': [101.543757, 25.036331],
  '德宏': [98.577494, 24.439671],
  '怒江': [98.854247, 26.648914],
  '迪庆': [99.708255, 27.825172],
  '昭通': [103.717158, 27.318388],
  '曲靖': [103.797387, 25.496423],
  '玉溪': [102.539095, 24.350431],
  '红河': [102.818658, 23.369552],
  '文山': [104.24427, 23.369998],
  '普洱': [100.973858, 22.775479],
  '临沧': [100.089039, 23.885899],

  '海口': [110.33119, 20.031971],
  '三亚': [109.731928, 18.249575],
  '儋州': [109.340454, 19.517126],
  '五指山': [109.517624, 18.773724],
  '琼海': [110.466989, 19.256953],
  '万宁': [110.389319, 18.798578],
  '文昌': [110.77781, 19.810778],
  '东方': [108.653813, 19.09708],

  '长沙': [112.973895, 28.196059],
  '株洲': [113.132898, 27.831873],
  '湘潭': [112.944048, 27.829724],
  '衡阳': [112.580162, 26.898242],
  '邵阳': [111.467124, 27.237843],
  '岳阳': [113.089684, 29.363969],
  '常德': [111.691585, 29.030896],
  '张家界': [110.479298, 29.127356],
  '益阳': [112.339719, 28.567383],
  '郴州': [113.032259, 25.774173],
  '永州': [111.608017, 26.430765],
  '怀化': [109.959052, 27.537304],
  '娄底': [112.003673, 27.728183],
  '湘西': [109.739779, 28.312699],

  '武汉': [114.298572, 30.584355],
  '黄石': [115.096794, 30.185835],
  '十堰': [110.788111, 32.646473],
  '宜昌': [111.290804, 30.693176],
  '襄阳': [112.14414, 32.042451],
  '鄂州': [114.888993, 30.390928],
  '荆门': [112.203958, 31.035758],
  '孝感': [113.917078, 30.916557],
  '荆州': [112.239204, 30.329688],
  '黄冈': [114.879454, 30.436752],
  '咸宁': [113.868505, 29.839171],
  '随州': [113.364104, 31.708469],
  '恩施': [109.489134, 30.274575],

  '济南': [117.020048, 36.667524],
  '青岛': [120.382602, 36.064357],
  '淄博': [118.047644, 36.788883],
  '枣庄': [117.323134, 34.818489],
  '东营': [118.492963, 37.461484],
  '烟台': [121.391446, 37.539289],
  '潍坊': [119.160833, 36.649827],
  '济宁': [116.587269, 35.389439],
  '泰安': [117.087156, 36.184069],
  '威海': [122.121559, 37.51284],
  '日照': [119.477875, 35.417796],
  '莱芜': [117.659763, 36.211577],
  '临沂': [118.356384, 35.065087],
  '德州': [116.357594, 37.455084],
  '聊城': [115.975435, 36.456405],
  '滨州': [117.971797, 37.38421],
  '菏泽': [115.469381, 35.246531],

  '全国': [104.195397, 35.86166]
};