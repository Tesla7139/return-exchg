import { HomeClient } from "@/components/home/HomeClient";

/**
 * Deep link: /<store> (e.g. /gullylabs.com) opens the demo straight into that store,
 * skipping the URL entry step. The segment is passed to HomeClient as the initial store.
 */
export default async function StorePage({ params }: { params: Promise<{ store: string }> }) {
  const { store } = await params;
  return <HomeClient initialStore={decodeURIComponent(store)} />;
}
