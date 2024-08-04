import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Component() {
  const [animationRequest, setAnimationRequest] = useState<string>("");
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleGenerate = async () => {
    setIsLoading(true);
    setError("");
    setVideoUrls([]);
    setAudioUrl("");
    try {
      const generateResponse = await fetch(
        "http://localhost:3001/api/v1/generate-script",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userPrompt: animationRequest }),
        }
      );

      if (!generateResponse.ok) {
        throw new Error("Failed to generate animation");
      }

      const data = await generateResponse.json();
      if (data.status === "completed" && data.video_urls && data.audio_url) {
        setVideoUrls(data.video_urls);
        setAudioUrl(data.audio_url);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error:", error);
      setError(
        "An error occurred while generating the animation. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const VideoComponent = useCallback(() => {
    if (isLoading) {
      return <p>Generating animation...</p>;
    }
    if (videoUrls.length === 0) {
      return <p>Place for videos</p>;
    }
    return (
      <div className="flex flex-col gap-4 w-full">
        {videoUrls.map((url, index) => (
          <video key={index} src={url} controls className="w-full" />
        ))}
      </div>
    );
  }, [videoUrls, isLoading]);

  const AudioComponent = useCallback(() => {
    return audioUrl ? (
      <audio src={audioUrl} controls className="w-full" />
    ) : (
      <p>{isLoading ? "Generating audio..." : "Place for audio"}</p>
    );
  }, [audioUrl, isLoading]);

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-4">
      <header className="flex justify-between w-full p-4 border-b">
        <div className="text-lg font-bold">AniMath</div>
      </header>
      <main className="flex flex-col items-center w-full flex-1 p-4">
        <h1 className="text-2xl font-bold text-center mb-4">Just animate math, and explore it like a 3b1b</h1>
        <div className="flex flex-col items-center w-full max-w-lg space-y-4">
          <Input 
            type="text" 
            placeholder="Enter request for creating Manim animation" 
            className="w-full"
            value={animationRequest}
            onChange={(e) => setAnimationRequest(e.target.value)}
          />
          <div className="flex flex-col gap-4 w-full">
            <Button className="flex-1" onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate"}
            </Button>
            <div className="flex gap-4 w-full">
              <Button variant="outline" className="flex-1">
                Animate Equations
              </Button>
              <Button variant="outline" className="flex-1">
                Visualize Concepts
              </Button>
              <Button variant="outline" className="flex-1">
                Explain Theorems
              </Button>
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <div className="w-full max-w-lg mt-8 border p-4">
          <h2 className="text-xl font-semibold mb-4">Generated Videos</h2>
          <VideoComponent />
        </div>
        <div className="w-full max-w-lg mt-8 border p-4">
          <h2 className="text-xl font-semibold mb-4">Generated Audio</h2>
          <AudioComponent />
        </div>
      </main>
    </div>
  );
}