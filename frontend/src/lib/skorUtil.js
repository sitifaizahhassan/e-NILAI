/**
 * skorUtil.js — Fungsi pengiraan skor berwajaran dikongsi
 * Digunakan oleh PencerapanForm.jsx dan AdminAnalisisPage.jsx
 */
import { ASPEK_LIST, getTarafPdP } from "../data/tapakStandard4";

/**
 * Kira peratus skor bagi satu subAspek.
 * @param {object} subAspek - objek subAspek dari ASPEK_LIST
 * @param {object} scores   - { itemId: nilai(0-4) }
 * @returns {number} peratusan (0–100)
 */
export function kiraPctSubAspek(subAspek, scores) {
  const itemCount = subAspek.items.length;
  if (itemCount === 0) return 0;
  const maxSubAspekScore = itemCount * 4;
  let rawScore = 0;
  subAspek.items.forEach((item) => {
    const s = scores[item.id];
    if (s !== null && s !== undefined) rawScore += Number(s);
  });
  return maxSubAspekScore > 0 ? (rawScore / maxSubAspekScore) * 100 : 0;
}

/**
 * Kira peratus skor bagi satu aspek (purata wajaran subAspek).
 * @param {object} aspek  - objek aspek dari ASPEK_LIST
 * @param {object} scores - { itemId: nilai(0-4) }
 * @returns {number} peratusan (0–100)
 */
export function kiraPctAspek(aspek, scores) {
  let totalWajaran = 0;
  let sumWeighted = 0;
  aspek.subAspek.forEach((sa) => {
    const pct = kiraPctSubAspek(sa, scores);
    sumWeighted += (pct * sa.wajaran) / 100;
    totalWajaran += sa.wajaran;
  });
  return totalWajaran > 0 ? (sumWeighted / totalWajaran) * 100 : 0;
}

/**
 * Kira jumlah skor berwajaran (%) untuk satu borang.
 * @param {object} scores - { itemId: nilai(0-4) }
 * @returns {number} jumlah skor berwajaran (%)
 */
export function kiraSkorBerwajaran(scores) {
  let totalWeighted = 0;
  ASPEK_LIST.forEach((aspek) => {
    aspek.subAspek.forEach((sa) => {
      const pct = kiraPctSubAspek(sa, scores);
      totalWeighted += (pct * sa.wajaran) / 100;
    });
  });
  return totalWeighted;
}

/**
 * Kira skor dan taraf bagi rekod pencerapan.
 * @param {object|null} rekod - rekod dengan field `scores`
 * @returns {{ skor: number|null, taraf: string|null }}
 */
export function kiraSkorRekod(rekod) {
  if (!rekod || !rekod.scores) return { skor: null, taraf: null };
  const skor = kiraSkorBerwajaran(rekod.scores);
  const taraf = getTarafPdP(skor);
  return { skor, taraf };
}

/**
 * Kira purata peratus setiap subAspek merentas senarai rekod.
 * @param {Array} rekodList - senarai rekod dengan field `scores`
 * @returns {Array} [{ subAspek, pctKendiri, pctP1, pctP2 }] (mengikut indeks ASPEK_LIST)
 */
export function kiraStatSubAspek(rekodKendiriMap, rekodP1Map, rekodP2Map, guruIds) {
  return ASPEK_LIST.flatMap((aspek) =>
    aspek.subAspek.map((sa) => {
      const pcts = { kendiri: [], p1: [], p2: [] };
      guruIds.forEach((id) => {
        const k = rekodKendiriMap[id];
        const p1 = rekodP1Map[id];
        const p2 = rekodP2Map[id];
        if (k?.scores) pcts.kendiri.push(kiraPctSubAspek(sa, k.scores));
        if (p1?.scores) pcts.p1.push(kiraPctSubAspek(sa, p1.scores));
        if (p2?.scores) pcts.p2.push(kiraPctSubAspek(sa, p2.scores));
      });
      const avg = (arr) =>
        arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
      return {
        kod: sa.kod,
        standardKualiti: sa.standardKualiti,
        avgKendiri: avg(pcts.kendiri),
        avgP1: avg(pcts.p1),
        avgP2: avg(pcts.p2),
      };
    })
  );
}

/**
 * Kira purata peratus setiap aspek merentas senarai guru.
 * @param {object} rekodKendiriMap  - { guruId: rekod }
 * @param {object} rekodP1Map       - { guruId: rekod }
 * @param {object} rekodP2Map       - { guruId: rekod }
 * @param {string[]} guruIds
 * @returns {Array} [{ kod, tajuk, avgKendiri, avgP1, avgP2 }]
 */
export function kiraStatAspek(rekodKendiriMap, rekodP1Map, rekodP2Map, guruIds) {
  return ASPEK_LIST.map((aspek) => {
    const pcts = { kendiri: [], p1: [], p2: [] };
    guruIds.forEach((id) => {
      const k = rekodKendiriMap[id];
      const p1 = rekodP1Map[id];
      const p2 = rekodP2Map[id];
      if (k?.scores) pcts.kendiri.push(kiraPctAspek(aspek, k.scores));
      if (p1?.scores) pcts.p1.push(kiraPctAspek(aspek, p1.scores));
      if (p2?.scores) pcts.p2.push(kiraPctAspek(aspek, p2.scores));
    });
    const avg = (arr) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
    return {
      kod: aspek.kod,
      tajuk: aspek.tajuk,
      avgKendiri: avg(pcts.kendiri),
      avgP1: avg(pcts.p1),
      avgP2: avg(pcts.p2),
    };
  });
}
