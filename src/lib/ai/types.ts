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
  keyTakeaways?: string[];
}

export interface EpisodeSection {
  title: string;
  content: string;
  type: "concept" | "example" | "exercise" | "summary";
}

export interface StructuredEpisodeResponse {
  sections: EpisodeSection[];
  summary: string;
  keyTakeaways: string[];
  content: string; // Combined content from all sections
}

export interface EpisodeTemplate {
  id: string;
  name: string;
  description: string;
  structure: {
    sections: Array<{
      title: string;
      type: "concept" | "example" | "exercise" | "summary";
      keyPoints?: string[];
    }>;
  };
}

export interface MediaItem {
  type: "image" | "video" | "embed";
  url: string;
  caption?: string;
  alt?: string;
}
