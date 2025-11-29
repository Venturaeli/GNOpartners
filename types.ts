export interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  tags: string[];
}

export interface SearchResult extends Guide {
  relevanceScore: number;
  reasoning: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING_DATA = 'LOADING_DATA',
  SEARCHING = 'SEARCHING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS'
}
