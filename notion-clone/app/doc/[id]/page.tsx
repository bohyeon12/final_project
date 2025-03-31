import Document from "@/components/Document";

export default async function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await Promise.resolve(params); //params 오류 회피

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Document id={id} />
    </div>
  );
}
