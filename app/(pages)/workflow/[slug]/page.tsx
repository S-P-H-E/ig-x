
export default async function WorkflowID({ params }: { params: Promise<{ slug: string }>}) {
  const { slug } = await params;

  return (
    <div>
      {slug}
    </div>
  );
}