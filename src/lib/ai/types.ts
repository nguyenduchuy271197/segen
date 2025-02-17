export interface SeriesGenerationResponse {
  title: string;
  description: string;
  episodes: {
    title: string;
    description: string;
    order: number;
  }[];
}

export interface EpisodeContentResponse {
  content: string;
  summary: string;
}