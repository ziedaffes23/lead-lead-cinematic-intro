import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const allowedContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  const body = request.body as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: request as unknown as Request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const contentType = typeof clientPayload === "string"
          ? (() => {
              try {
                return (JSON.parse(clientPayload) as { contentType?: string }).contentType;
              } catch {
                return undefined;
              }
            })()
          : undefined;

        if (contentType && !allowedContentTypes.includes(contentType)) {
          throw new Error("Unsupported upload type.");
        }

        return {
          allowedContentTypes,
          maximumSizeInBytes: pathname.includes("/cv/") ? 15 * 1024 * 1024 : 5 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ pathname }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("registration blob upload completed", blob.pathname);
      },
    });

    return response.status(200).json(jsonResponse);
  } catch (error) {
    return response.status(400).json({
      error: error instanceof Error ? error.message : "Upload could not be completed.",
    });
  }
}
