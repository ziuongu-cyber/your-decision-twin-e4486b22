import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

        <div className="prose prose-sm prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Digital Twin, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Digital Twin is an AI-powered decision tracking application that helps users log decisions, track outcomes, and receive personalized insights. The service uses artificial intelligence to analyze decision patterns and provide recommendations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Data</h2>
            <p className="text-muted-foreground">
              Your decision data is stored locally on your device by default. When you use AI-powered features, anonymized data may be processed by our AI systems to generate insights. We do not sell or share your personal decision data with third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. AI-Generated Content</h2>
            <p className="text-muted-foreground">
              The AI-generated insights and recommendations provided by Digital Twin are for informational purposes only. They should not be considered professional advice. Always use your own judgment when making important decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Digital Twin is provided "as is" without warranties of any kind. We are not liable for any decisions made based on the app's recommendations or any data loss that may occur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, please contact us through the app's feedback form.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
