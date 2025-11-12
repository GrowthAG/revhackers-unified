
import { agenceMrData } from './agence-mr';
import { anhembiData } from './anhembi';
import { bldnDigitalData } from './bldn-digital';
import { datavoxxData } from './datavoxx';
import { enicsData } from './enics';
import { fmuVirtualData } from './fmu-virtual';
import { heinekenData } from './heineken';
import { placluxData } from './placlux';
import { toeflData } from './toefl';
import { funnelsPartner } from './funnels';
import { PartnerData } from './types';

export const partners: Record<string, PartnerData> = {
  'agence-mr': agenceMrData,
  'anhembi': anhembiData,
  'bldn-digital': bldnDigitalData,
  'datavoxx': datavoxxData,
  'enics': enicsData,
  'fmu-virtual': fmuVirtualData,
  'heineken': heinekenData,
  'placlux': placluxData,
  'toefl': toeflData,
  'funnels': funnelsPartner,
};

export type PartnerKey = keyof typeof partners;
