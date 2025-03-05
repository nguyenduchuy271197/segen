export interface EpisodeGenerationData {
  title: string;
  description: string;
  order: number;
}

export interface SeriesGenerationResponse {
  title: string;
  description: string;
  tags: string[];
  episodes: EpisodeGenerationData[];
}

export interface EpisodeContentResponse {
  content: string;
  summary: string;
}
