export interface Artist {
  elementId: string;
  name: string;
  country: string;
  activeSince: number;
}

export interface Band {
  elementId: string;
  name: string;
  formed: number;
  country: string;
}

export interface Genre {
  elementId: string;
  name: string;
  description: string;
}

export interface Song {
  elementId: string;
  title: string;
  year: number;
  streams: number;
}

export interface Label {
  elementId: string;
  name: string;
  country: string;
}

export interface GraphStats {
  artists: number;
  bands: number;
  songs: number;
  genres: number;
  labels: number;
  relationships: number;
}

export interface DegreePath {
  path: { label: string; name: string }[];
  degrees: number;
}

export interface ConnectionResult {
  name: string;
  elementId: string;
  via: string;
}
