import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <div className="prose prose-sm prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-3">Your Privacy Matters</h2>
            <p className="text-muted-foreground">
              At Digital Twin, we take your privacy seriously. This policy explains how we collect, use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data Collection</h2>
            <p className="text-muted-foreground">We collect the following types of information:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Decision Data:</strong> The decisions you log, including titles, choices, alternatives, and outcomes. This is stored locally on your device by default.</li>
              <li><strong>Usage Analytics:</strong> Anonymous usage patterns to improve the app experience.</li>
              <li><strong>Device Information:</strong> Basic device info for compatibility and debugging purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How We Use Your Data</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>To provide AI-powered insights and recommendations</li>
              <li>To improve our algorithms and user experience</li>
              <li>To send relevant notifications about your decisions</li>
              <li>To generate aggregated, anonymized statistics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data Storage & Security</h2>
            <p className="text-muted-foreground">
              Your decision data is primarily stored locally on your device. When using cloud features, data is encrypted in transit and at rest. We use industry-standard security measures to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">AI Processing</h2>
            <p className="text-muted-foreground">
              When you use AI features (like Ask Your Twin or Insights), your decision data may be processed by our AI systems. This data is used solely to generate personalized recommendations and is not stored beyond the processing session.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
            <p className="text-muted-foreground">
              We may use third-party services for analytics and AI processing. These services are bound by their own privacy policies and our data processing agreements.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li><strong>Access:</strong> You can export all your data at any time</li>
              <li><strong>Deletion:</strong> You can delete your data from the app settings</li>
              <li><strong>Portability:</strong> Export your data in multiple formats</li>
              <li><strong>Opt-out:</strong> Disable analytics and AI features in settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this privacy policy or your data, please use the feedback form in the app.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
