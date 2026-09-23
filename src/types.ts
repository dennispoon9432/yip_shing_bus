export interface KmbEtaRaw {
  co: string;
  route: string;
  dir: string;
  service_type: number;
  seq: number;
  dest_tc: string;
  dest_sc: string;
  dest_en: string;
  eta_seq: number;
  eta: string | null;
  rmk_tc: string;
  rmk_sc: string;
  rmk_en: string;
  data_timestamp: string;
}

export interface StopConfig {
  id: string;
  stopId: string;
  poleCode: string;
  directionName: string;
  directionEn: string;
  description: string;
  locationTc: string;
  locationEn: string;
  lat: number;
  lng: number;
  primaryDestinations: string[];
}

export interface ProcessedEta {
  id: string; // unique key (route-seq-eta_seq-eta)
  route: string;
  serviceType: number;
  destTc: string;
  destEn: string;
  destSc: string;
  etaSeq: number;
  eta: string | null;
  etaDate: Date | null;
  minutesRemaining: number | null;
  secondsRemaining: number | null;
  displayStatus: 'ARRIVING_NOW' | 'MINUTES' | 'DEPARTED' | 'NO_ETA';
  displayTimeText: string;
  clockTimeText: string;
  isRealTime: boolean;
  remarkTc: string;
  remarkEn: string;
  dataTimestamp: string;
  stopSequence: number;
  direction: string;
}

export interface RouteGroup {
  route: string;
  destTc: string;
  destEn: string;
  serviceType: number;
  arrivals: ProcessedEta[];
  earliestMinutes: number | null;
  isFavorite?: boolean;
}

export const YIP_SHING_STOPS: Record<'KOWLOON' | 'TSUEN_WAN', StopConfig> = {
  KOWLOON: {
    id: 'KOWLOON',
    stopId: 'C3672D8D28801773',
    poleCode: 'KW410',
    directionName: '往九龍方向',
    directionEn: 'To Kowloon',
    description: '南行 / 東行往九龍及港島各區',
    locationTc: '青山公路－葵涌段（業成街路口旁）',
    locationEn: 'Castle Peak Road - Kwai Chung (near Yip Shing St)',
    lat: 22.360518,
    lng: 114.135930,
    primaryDestinations: ['尖沙咀', '旺角/奧運', '西九龍站', '觀塘/藍田', '銅鑼灣']
  },
  TSUEN_WAN: {
    id: 'TSUEN_WAN',
    stopId: '3FE93821145B65F5',
    poleCode: 'KW123',
    directionName: '往荃灣方向',
    directionEn: 'To Tsuen Wan',
    description: '北行 / 西行往荃灣、梨木樹、葵盛及青衣',
    locationTc: '青山公路－葵涌段（業成街對面）',
    locationEn: 'Castle Peak Road - Kwai Chung (opposite Yip Shing St)',
    lat: 22.360158,
    lng: 114.135190,
    primaryDestinations: ['荃灣(石圍角/如心)', '葵盛', '梨木樹', '安蔭', '青衣(長亨)']
  }
};

// Route metadata helper to give local context
export const ROUTE_EXTRA_INFO: Record<string, { viaTc?: string; tag?: string; color?: string }> = {
  '31B': { viaTc: '石籬、深水埗、大角咀', tag: '流水線' },
  '32': { viaTc: '象山、石圍角、旺角', tag: '常規線' },
  '35A': { viaTc: '長沙灣、旺角、彌敦道、尖沙咀', tag: '主要幹線' },
  '35X': { viaTc: '特快直達旺角、尖沙咀', tag: '特快特選' },
  '36B': { viaTc: '梨木樹、深水埗、佐敦、西九龍站', tag: '主要幹線' },
  '36X': { viaTc: '特快直達旺角、油麻地、尖沙咀', tag: '特快' },
  '38': { viaTc: '黃大仙、九龍灣、觀塘、平田', tag: '東九幹線' },
  '38P': { viaTc: '繁忙時間特快往平田', tag: '繁忙時間' },
  '40P': { viaTc: '石圍角、黃大仙、九龍灣、觀塘碼頭', tag: '東九幹線' },
  '42C': { viaTc: '青衣、黃大仙、觀塘、藍田站', tag: '東九幹線' },
  '936': { viaTc: '西區海底隧道、上環、中環、灣仔、銅鑼灣', tag: '過海隧道' },
  '936A': { viaTc: '繁忙時間過海特快往銅鑼灣', tag: '過海特快' },
  'R936': { viaTc: '渣打馬拉松特別線', tag: '活動特別線' },
  'X42P': { viaTc: '青衣單向直達觀塘、藍田站', tag: '繁忙時間' },
  'N237': { viaTc: '通宵循環線', tag: '通宵線' },
};
