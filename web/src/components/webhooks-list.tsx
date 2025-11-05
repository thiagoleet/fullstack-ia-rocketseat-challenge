import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { webhookListSchema } from "../http/schemas/webhooks";
import { WebhooksListItem } from "./webhooks-list-item";
import { Activity, useEffect, useRef, useState } from "react";
import { Loader2Icon, Wand2 } from "lucide-react";
import { twMerge } from "tailwind-merge";
import type { GeneratedResponse } from "../http/schemas/generated-response";

export function WebhooksList() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>(null);

  const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([]);
  const [generatedHandlerCode, setGeneratedHandlerCode] = useState<
    string | null
  >(null);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ["webhooks"],
      queryFn: async ({ pageParam }) => {
        const url = new URL("http://localhost:3333/api/webhooks");
        if (pageParam) {
          url.searchParams.set("cursor", pageParam);
        }

        const response = await fetch(url);
        const data = await response.json();
        return webhookListSchema.parse(data);
      },
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? undefined;
      },
      initialPageParam: undefined as string | undefined,
    });

  const webhooks = data.pages.flatMap((page) => page.webhooks);

  function handleCheckWebhook(webhookId: string) {
    if (checkedWebhooksIds.includes(webhookId)) {
      setCheckedWebhooksIds((prev) => prev.filter((id) => id !== webhookId));
      return;
    }

    setCheckedWebhooksIds((prev) => [...prev, webhookId]);
  }

  const hasAnyCheckedWebhooks = checkedWebhooksIds.length > 0;

  async function handleGenerateHandler() {
    const response = await fetch("http://localhost:3333/api/generate", {
      method: "POST",
      body: JSON.stringify({ webhooksIds: checkedWebhooksIds }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data: GeneratedResponse = await response.json();
    setGeneratedHandlerCode(data.code);
  }

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex-1 overflow-y-auto relative">
      <div className="space-y-1 p-2">
        <button
          disabled={!hasAnyCheckedWebhooks}
          onClick={handleGenerateHandler}
          className={twMerge(
            "bg-indigo-400 text-white",
            "w-full mb-3 py-2 px-4",
            "rounded-lg font-medium text-sm",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center justify-center gap-3",
            "cursor-pointer",
            "hover:bg-indigo-500 transition-colors"
          )}
        >
          <Wand2 className="size-4" />
          Gerar Handler
        </button>
      </div>

      <div className="space-y-1 p-2 mt-2">
        {webhooks.map((webhook) => (
          <WebhooksListItem
            key={webhook.id}
            webhook={webhook}
            onWebhookChecked={() => handleCheckWebhook(webhook.id)}
            isWebhookChecked={checkedWebhooksIds.includes(webhook.id)}
          />
        ))}

        <Activity mode={hasNextPage ? "visible" : "hidden"}>
          <div
            className="p-2"
            ref={loadMoreRef}
          >
            <Activity mode={isFetchingNextPage ? "visible" : "hidden"}>
              <div className="flex items-center justify-center py-2">
                <Loader2Icon className="size-5 animate-spin text-zinc-500" />
              </div>
            </Activity>
          </div>
        </Activity>
      </div>
    </div>
  );
}
