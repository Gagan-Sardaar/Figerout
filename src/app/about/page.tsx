
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutUsPage() {
  return (
    <div className="min-h-svh bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl">About Figerout</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <p>
            Welcome to Figerout, where we believe that inspiration is all around us, hidden in the vibrant tapestry of everyday life. Our mission is to empower creators, designers, and color enthusiasts to discover and capture the world's palette, one snapshot at a time.
          </p>
          
          <h2 className="text-2xl font-semibold">Our Story</h2>
          <p>
            Figerout was born from a simple idea: what if you could capture the stunning colors of a sunset, the subtle hues of a flower, or the bold tones of street art with just your phone? We wanted to create a tool that was not just a utility, but a source of creative inspiration. We're a small team of passionate developers and designers who saw the potential to bridge the gap between the digital and physical worlds through color.
          </p>

          <h2 className="text-2xl font-semibold">What We Do</h2>
          <p>
            Our application provides an intuitive and powerful way to:
          </p>
          <ul>
            <li><strong>Capture Colors:</strong> Use your device's camera to instantly identify and save colors from your environment.</li>
            <li><strong>Create Palettes:</strong> Automatically generate beautiful color palettes from your captured images.</li>
            <li><strong>Explore & Discover:</strong> Browse a community-driven library of colors and palettes for endless inspiration.</li>
            <li><strong>Share Your Vision:</strong> Easily share your color discoveries with friends, colleagues, or on social media.</li>
          </ul>

          <h2 className="text-2xl font-semibold">Our Vision</h2>
          <p>
            We aim to be the go-to platform for color discovery and palette creation. We are continuously working on new features, including advanced AI tools for our admin users to analyze color trends and generate creative content, making Figerout an indispensable tool for professionals and hobbyists alike.
          </p>

          <div className="not-prose mt-8">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
