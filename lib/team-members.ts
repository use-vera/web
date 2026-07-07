export interface TeamMember {
  name: string;
  initials: string;
  title: string;
  bio: string;
  imageUrl?: string;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Judith Akabogu",
    initials: "JA",
    title: "Co-founder & CEO",
    bio: "Believes every event deserves a ticket system that doesn't get in the way.",
  },
  {
    name: "Tobenna Ezimorah",
    initials: "TE",
    title: "Co-founder & CTO",
    bio: "Built checkout flows for three fintechs before building one for parties.",
  },
];
