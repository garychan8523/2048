import { useState, useEffect } from 'react';
import { CreateMLCEngine, type InitProgressReport, type ChatCompletionMessageParam } from "@mlc-ai/web-llm";

const LocalAI = () => {
    const [engine, setEngine] = useState<any>(null);
    const [progress, setProgress] = useState("Not started");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const modelId = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

    useEffect(() => {
        const initEngine = async () => {
            const result = await CreateMLCEngine(modelId, {
                initProgressCallback: (report: InitProgressReport) => {
                    setProgress(report.text);
                },
            });
            setEngine(result);
        };

        initEngine();
    }, []);

    const handleChat = async () => {
        if (!engine) return;

        setLoading(true);

        const messages: ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: "You are a 2048 strategy engine. You suggest the next best move based on the current grid state. You only output a single word: up, down, left, or right. Do not provide explanations, markdown, or greetings."
            },
            // Example 1: Vertical Merge
            {
                role: "user",
                content: "[[2, 0, 0, 0], [2, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]"
            },
            { role: "assistant", content: "up" },
            // Example 2: Horizontal Merge (This fixes your current issue)
            {
                role: "user",
                content: "[[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]"
            },
            { role: "assistant", content: "left" },
            // Current Board
            {
                role: "user",
                content: "[[1024, 1024, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]"
            },
        ];
        const reply = await engine.chat.completions.create({
            messages,
            temperature: 0.0,
        });
        const cleanResponse = reply.choices[0].message.content?.trim().toLowerCase();
        setResponse(cleanResponse || "");
        setLoading(false);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Local WebLLM in React</h2>
            <p><strong>Status:</strong> {progress}</p>

            <br />
            <button onClick={handleChat} disabled={loading || !engine}>
                {loading ? "Thinking..." : "Send"}
            </button>

            {response && (
                <div style={{ marginTop: '20px', backgroundColor: '#f0f0f0', padding: '10px' }}>
                    <strong>AI:</strong> {response}
                </div>
            )}
        </div>
    );
};

export default LocalAI;