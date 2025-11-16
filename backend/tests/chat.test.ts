import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import app from "../src/index";
import { clearMemories } from "../src/services/memory";
import { generateAllyReply } from "../src/services/llm";

vi.mock("../src/services/llm", () => ({
  generateAllyReply: vi.fn()
}));

const mockedGenerateAllyReply = vi.mocked(generateAllyReply);

describe("Ally backend API", () => {
  beforeEach(() => {
    mockedGenerateAllyReply.mockResolvedValue({
      message: "Thanks for sharing. I'm right here with you.",
      emotion: "warm",
      shouldSaveMemory: false,
      memoryBlob: null
    });
    clearMemories();
  });

  it("returns healthy status for /health", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: "ok",
      service: "ally-backend"
    });
  });

  it("creates a chat response via the LLM service", async () => {
    const response = await request(app)
      .post("/chat")
      .send({
        userId: "test-user",
        message: "I feel overwhelmed in a new city."
      })
      .expect(200);

    expect(response.body.message).toContain("Thanks for sharing");
    expect(response.body.emotion).toBe("warm");
    expect(mockedGenerateAllyReply).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "I feel overwhelmed in a new city.",
        userId: "test-user"
      })
    );
  });

  it("rejects empty chat messages", async () => {
    const response = await request(app).post("/chat").send({
      userId: "lonely-user",
      message: "   "
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/non-empty message/i);
  });
});
