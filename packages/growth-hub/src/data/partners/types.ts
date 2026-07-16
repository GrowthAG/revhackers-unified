
export interface PartnerData {
  name: string;
  logo: string;
  coverImage: string;
  category: string;
  description: string;
  tags: string[];
  caseStudy: string[];
  results: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

export type PartnerKey = 
  | "anhembi"
  | "fmu-virtual" 
  | "toefl" 
  | "datavoxx" 
  | "agence-mr" 
  | "heineken" 
  | "bldn-digital" 
  | "placlux" 
  | "enics";
