import { DatasetDetailView } from "./dataset-detail-view";

export default function DatasetDetailPage({
  params,
}: {
  params: { datasetId: string };
}) {
  return <DatasetDetailView datasetId={decodeURIComponent(params.datasetId)} />;
}
