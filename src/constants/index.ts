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