import { KmbEtaRaw, ProcessedEta, RouteGroup, ROUTE_EXTRA_INFO } from '../types';

const KMB_API_BASE = 'https://data.etabus.gov.hk/v1/transport/kmb';

/**
 * Fetch ETAs for a specific KMB bus stop
 */
export async function fetchStopEtas(stopId: string): Promise<KmbEtaRaw[]> {
  const url = `${KMB_API_BASE}/stop-eta/${stopId}`;
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`KMB API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();
  if (!json || !Array.isArray(json.data)) {
    throw new Error('Invalid response structure from KMB API');
  }

  return json.data as KmbEtaRaw[];
}

/**
 * Process raw ETA records into rich, calculated objects sorted chronologically
 */
export function processEtas(rawList: KmbEtaRaw[], now: Date = new Date()): {
  arrivingBuses: ProcessedEta[];
  noEtaBuses: ProcessedEta[];
  groupedByRoute: RouteGroup[];
} {
  const arriving: ProcessedEta[] = [];
  const noEta: ProcessedEta[] = [];
  const seenKeys = new Set<string>();

  for (const raw of rawList) {
    // Stable unique key for the arrival slot
    const uniqueKey = `${raw.route}-${raw.dir}-${raw.service_type}-${raw.seq}-${raw.eta_seq}`;
    if (seenKeys.has(uniqueKey)) continue;
    seenKeys.add(uniqueKey);

    let etaDate: Date | null = null;
    let minutesRemaining: number | null = null;
    let secondsRemaining: number | null = null;
    let displayStatus: ProcessedEta['displayStatus'] = 'NO_ETA';
    let displayTimeText = '暫無即時班次';
    let clockTimeText = '--:--';

    if (raw.eta && raw.eta.trim() !== '') {
      try {
        etaDate = new Date(raw.eta);
        if (!isNaN(etaDate.getTime())) {
          const diffMs = etaDate.getTime() - now.getTime();
          const totalSeconds = Math.round(diffMs / 1000);
          minutesRemaining = Math.floor(totalSeconds / 60);
          secondsRemaining = totalSeconds;

          // Format clock time (HH:mm)
          const hours = etaDate.getHours().toString().padStart(2, '0');
          const minutes = etaDate.getMinutes().toString().padStart(2, '0');
          clockTimeText = `${hours}:${minutes}`;

          if (totalSeconds <= -90) {
            displayStatus = 'DEPARTED';
            displayTimeText = '已駛離';
          } else if (totalSeconds <= 60) {
            displayStatus = 'ARRIVING_NOW';
            displayTimeText = '即將抵達';
          } else {
            displayStatus = 'MINUTES';
            displayTimeText = `${minutesRemaining} 分鐘`;
          }
        }
      } catch {
        etaDate = null;
      }
    }

    // Remark analysis: empty rmk_tc indicates GPS real-time bus
    const isRealTime = !raw.rmk_tc || raw.rmk_tc.trim() === '';

    const processed: ProcessedEta = {
      id: uniqueKey,
      route: raw.route,
      serviceType: raw.service_type,
      destTc: raw.dest_tc,
      destEn: raw.dest_en,
      destSc: raw.dest_sc,
      etaSeq: raw.eta_seq,
      eta: raw.eta,
      etaDate,
      minutesRemaining,
      secondsRemaining,
      displayStatus,
      displayTimeText,
      clockTimeText,
      isRealTime,
      remarkTc: raw.rmk_tc || '實時定位',
      remarkEn: raw.rmk_en || 'Real-time GPS',
      dataTimestamp: raw.data_timestamp,
      stopSequence: raw.seq,
      direction: raw.dir,
    };

    if (etaDate && displayStatus !== 'DEPARTED') {
      arriving.push(processed);
    } else if (displayStatus === 'NO_ETA' || displayStatus === 'DEPARTED') {
      // Keep only one NO_ETA item per route to avoid spam
      const alreadyHasNoEta = noEta.some(n => n.route === raw.route && n.destTc === raw.dest_tc);
      if (!alreadyHasNoEta) {
        noEta.push(processed);
      }
    }
  }

  // Sort ALL arriving buses strictly by arrival timestamp (first to arrive on top)
  arriving.sort((a, b) => {
    const timeA = a.etaDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const timeB = b.etaDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    return a.route.localeCompare(b.route, undefined, { numeric: true });
  });

  // Group by route
  const routeMap = new Map<string, RouteGroup>();

  // First seed with arriving buses
  for (const item of arriving) {
    const key = `${item.route}-${item.destTc}`;
    if (!routeMap.has(key)) {
      routeMap.set(key, {
        route: item.route,
        destTc: item.destTc,
        destEn: item.destEn,
        serviceType: item.serviceType,
        arrivals: [],
        earliestMinutes: item.minutesRemaining,
      });
    }
    routeMap.get(key)!.arrivals.push(item);
  }

  // Seed remaining no-ETA routes
  for (const item of noEta) {
    const key = `${item.route}-${item.destTc}`;
    if (!routeMap.has(key)) {
      routeMap.set(key, {
        route: item.route,
        destTc: item.destTc,
        destEn: item.destEn,
        serviceType: item.serviceType,
        arrivals: [item],
        earliestMinutes: null,
      });
    }
  }

  const groupedByRoute = Array.from(routeMap.values()).sort((a, b) => {
    // Routes with active arriving buses come first
    if (a.earliestMinutes !== null && b.earliestMinutes !== null) {
      return a.earliestMinutes - b.earliestMinutes;
    }
    if (a.earliestMinutes !== null) return -1;
    if (b.earliestMinutes !== null) return 1;
    return a.route.localeCompare(b.route, undefined, { numeric: true });
  });

  return {
    arrivingBuses: arriving,
    noEtaBuses: noEta,
    groupedByRoute,
  };
}

/**
 * Play a pleasant audio chime when bus is approaching (Web Audio API)
 */
export function playArrivalChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.15); // A5
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.35); // D6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.15);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.6);
  } catch (e) {
    console.warn('Audio chime could not be played:', e);
  }
}
