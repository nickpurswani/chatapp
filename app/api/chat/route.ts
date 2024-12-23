export async function POST(req: Request) {
    const hardcodedMessages = [
      { id: "1", role: "assistant", content: "Hello! How can I assist you today?" },
      { id: "2", role: "assistant", content: "Here's more information in a follow-up message." },
      { id: "3", role: "assistant", content: "This is the final part of the response." },
    ];
  
    const stream = new ReadableStream({
      start(controller) {
        hardcodedMessages.forEach((message, index) => {
          setTimeout(() => {
            controller.enqueue(new TextEncoder().encode(JSON.stringify(message) + "\n"));
            if (index === hardcodedMessages.length - 1) {
              controller.close();
            }
          }, index * 1000);
        });
      },
    });
  
    return new Response(stream, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  }
  