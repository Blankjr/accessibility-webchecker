export interface AxeNode {
    html: string;
    target: string[];
    failureSummary?: string;
  }
  
  export interface AxeResult {
    description: string;
    help: string;
    helpUrl: string;
    id: string;
    impact?: 'minor' | 'moderate' | 'serious' | 'critical';
    tags: string[];
    nodes: AxeNode[];
  }
  
  export interface AxeResults {
    violations: AxeResult[];
    incomplete: AxeResult[];
    passes: AxeResult[];
    inapplicable: AxeResult[];
    timestamp: string;
    url: string;
  }