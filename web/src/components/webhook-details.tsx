import { useSuspenseQuery } from "@tanstack/react-query";
import { webhookDetailSchema } from "../http/schemas/webhooks";
import { WebhookDetailHeader } from "./webhook-detail-header";
import { SectionTitle } from "./section-title";
import { SectionDataTable } from "./section-data-table";
import { CodeBlock } from "./ui/code-block";
import { Activity } from "react";

interface WebhookDetailsProps {
  id: string;
}

export function WebhookDetails({ id }: WebhookDetailsProps) {
  const { data } = useSuspenseQuery({
    queryKey: ["webhook", id],
    queryFn: async () => {
      const response = await fetch(`http://localhost:3333/api/webhooks/${id}`);
      const data = await response.json();
      return webhookDetailSchema.parse(data);
    },
  });

  const overviewData = [
    { key: "Method", value: data.method },
    { key: "Status Code", value: data.statusCode.toString() },
    { key: "Content-Type", value: data.contentType || "application/json" },
    {
      key: "Content-Length",
      value: data.contentLength ? `${data.contentLength} bytes` : "N/A",
    },
  ];

  const headersData = Object.entries(data.headers).map(([key, value]) => {
    return { key, value: String(value) };
  });

  const queryParamsData = Object.entries(data.queryParams || {}).map(
    ([key, value]) => {
      return { key, value: String(value) };
    }
  );

  return (
    <div className="flex h-full flex-col">
      <WebhookDetailHeader
        method={data.method}
        pathname={data.pathname}
        ip={data.ip}
        createdAt={data.createdAt}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
          <div className="space-y-4">
            <SectionTitle>Request Overview</SectionTitle>
            <SectionDataTable data={overviewData} />
          </div>

          <div className="space-y-4">
            <SectionTitle>Headers</SectionTitle>
            <SectionDataTable data={headersData} />
          </div>

          <Activity mode={queryParamsData.length > 0 ? "visible" : "hidden"}>
            <div className="space-y-4">
              <SectionTitle>Query Parameters</SectionTitle>
              <SectionDataTable data={queryParamsData} />
            </div>
          </Activity>

          <Activity mode={data.body ? "visible" : "hidden"}>
            <div className="space-y-4">
              <SectionTitle>Request Body</SectionTitle>
              <CodeBlock code={data.body || ""} />
            </div>
          </Activity>
        </div>
      </div>
    </div>
  );
}
