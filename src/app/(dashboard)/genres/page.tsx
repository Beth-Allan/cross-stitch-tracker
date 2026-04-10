import { getGenresWithStats } from "@/lib/actions/genre-actions";
import { GenreList } from "@/components/features/genres/genre-list";

export default async function GenresPage() {
  const genres = await getGenresWithStats();
  return <GenreList genres={genres} />;
}
