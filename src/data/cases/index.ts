import { enicsCase } from './enics';
import { heinekenCase } from './heineken';
import { agenceMrCase } from './agence-mr';
import { toeflCase } from './toefl';
import { datavoxxCase } from './datavoxx';
import { emagrecentroCase } from './emagrecentro';
import { placluxCase } from './placlux';
import { fmuVirtualCase } from './fmu-virtual';
import { funnelsCase } from './funnels';
import { cruzeiroSulCase } from './cruzeiro-sul';
import { btDigitalCase } from './bt-digital';
import { tikpagCase } from './tikpag';
import { tegraCase } from './tegra';

// Type definition for a case study
export interface CaseStudy {
  title: string;
  category: string;
  logo: string;
  coverImage: string;
  challenge: string;
  solution: string;
  results: string[];
  metrics: {
    value: string;
    label: string;
  }[];
  quote: string;
  author: string;
  role: string;
  authorImage?: string;
  description?: string;
  preview_description?: string;
  tags?: string[];
}

// Combine all cases into a single object
export const casesData: Record<string, CaseStudy> = {
  "enics": enicsCase,
  "heineken": heinekenCase,
  "agence-mr": agenceMrCase,
  "toefl": toeflCase,
  "datavoxx": datavoxxCase,
  "emagrecentro": emagrecentroCase,
  "placlux": placluxCase,
  "fmu-virtual": fmuVirtualCase,
  "funnels": funnelsCase,
  "cruzeiro-sul": cruzeiroSulCase,
  "bt-digital": btDigitalCase,
  "tikpag": tikpagCase,
  "tegra": tegraCase
};

export type CaseStudyKey = keyof typeof casesData;
