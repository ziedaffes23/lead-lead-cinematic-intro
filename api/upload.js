// api/upload.ts
import { handleUpload } from "@vercel/blob/client";
var allowedContentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
];
async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }
  const body = request.body;
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const contentType = typeof clientPayload === "string" ? (() => {
          try {
            return JSON.parse(clientPayload).contentType;
          } catch {
            return void 0;
          }
        })() : void 0;
        if (contentType && !allowedContentTypes.includes(contentType)) {
          throw new Error("Unsupported upload type.");
        }
        return {
          allowedContentTypes,
          maximumSizeInBytes: pathname.includes("/cv/") ? 15 * 1024 * 1024 : 5 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ pathname })
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log("registration blob upload completed", blob.pathname);
      }
    });
    return response.status(200).json(jsonResponse);
  } catch (error) {
    return response.status(400).json({
      error: error instanceof Error ? error.message : "Upload could not be completed."
    });
  }
}
export {
  handler as default
};
