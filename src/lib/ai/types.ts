export interface SeriesGenerationResponse {
  id?: string;
  title: string;
  description: string;
  tags: string[];
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
