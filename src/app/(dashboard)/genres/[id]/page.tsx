import { notFound } from "next/navigation";
import { getGenre } from "@/lib/actions/genre-actions";
import { GenreDetail } from "@/components/features/genres/genre-detail";

export default async function GenreDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const genre = await getGenre(id);
  if (!genre) notFound();
  return <GenreDetail genre={genre} />;
}
