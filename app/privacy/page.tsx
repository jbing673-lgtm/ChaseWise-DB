export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 mb-12">Last updated: June 30, 2026</p>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <p className="text-gray-700 leading-relaxed">
            ChaseWise (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the chasewise website (the &quot;Service&quot;).
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            This page informs you of our policies regarding the collection, use,
            and disclosure of personal data when you use our Service and the
            choices you have associated with that data.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            We use your data to provide and improve the Service. By using the
            Service, you agree to the collection and use of information in
            accordance with this policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Information Collection and Use
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We collect several different types of information for various
            purposes to provide and improve our Service to you.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            Types of Data Collected
          </h3>

          <h4 className="text-lg font-semibold text-gray-800 mt-4 mb-2">
            Personal Data
          </h4>
          <p className="text-gray-700 leading-relaxed">
            While using our Service, we may ask you to provide certain personally
            identifiable information that can be used to contact or identify you
            (&quot;Personal Data&quot;). Personally identifiable information may
            include, but is not limited to:
          </p>
          <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1 text-sm">
            <li>Email address</li>
            <li>Usage data</li>
            <li>Authentication data stored securely by Supabase</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-800 mt-6 mb-2">
            Usage Data
          </h4>
          <p className="text-gray-700 leading-relaxed">
            We automatically collect information about your interactions with the
            Service, including your browser type, the pages you visit, and the
            dates/times of your visits. This data is used for security and service
            improvement purposes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Data Storage
          </h2>
          <p className="text-gray-700 leading-relaxed">
            Your data is stored on Supabase, a third-party database provider located in the
            United States. Supabase maintains industry-standard security practices
            to protect your data. For more information about Supabase&apos;s privacy practices,
            please see their{' '}
            <a
              href="https://supabase.com/privacy"
              className="text-primary-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            We retain your data for as long as your account is active. You may request deletion
            of your data at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Use of Data
          </h2>
          <p className="text-gray-700 leading-relaxed">
            ChaseWise uses the collected data for:
          </p>
          <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1 text-sm">
            <li>Providing and maintaining the Service</li>
            <li>Generating AI-powered collection emails based on your inputs</li>
            <li>Managing your account and subscription</li>
            <li>Authenticating users securely</li>
            <li>Improving the Service</li>
            <li>Communicating with you regarding updates, security alerts, and service changes</li>
            <li>Detecting and preventing fraud, abuse, and security incidents</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Disclosure of Data
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We do not share your personal data with third parties except in the following
            limited circumstances:
          </p>
          <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1 text-sm">
            <li>When required by law to comply with a legal obligation</li>
            <li>With your explicit consent</li>
            <li>To protect our rights, property, or safety</li>
            <li>
              To our service providers (Supabase, DeepSeek, Creem) who are
              contractually obligated to keep your data secure
            </li>
            <li>
              In the event of a business transaction such as a merger, acquisition,
              or asset sale
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Your Rights
          </h2>
          <p className="text-gray-700 leading-relaxed">You have the right to:</p>
          <ul className="list-disc ml-6 mt-2 text-gray-700 space-y-1 text-sm">
            <li>Access and download a copy of your personal data</li>
            <li>Request correction of any incorrect or incomplete personal data</li>
            <li>Request deletion of your personal data and account</li>
            <li>
              Restrict processing of your personal data in certain circumstances
            </li>
            <li>
              Withdraw consent at any time where we rely on consent to process your personal data
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            To exercise any of these rights, please contact us at{' '}
            <strong>jbing673@gmail.com</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Cookies
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We may use cookies and similar tracking technologies to track session
            activity on our Service. You can instruct your browser to refuse all
            cookies or to indicate when a cookie is being sent. Most modern browsers
            support this setting.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            Cookies are small pieces of data stored on your device to enable
            authentication and remember your session. We only store essential
            authentication cookies.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Security
          </h2>
          <p className="text-gray-700 leading-relaxed">
            The security of your data is important to us, but no method of
            transmission over the Internet or electronic storage is 100% secure.
            While we strive to use commercially acceptable means to protect your
            Personal Data, we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Changes to This Privacy Policy
          </h2>
          <p className="text-gray-700 leading-relaxed">
            We may update our Privacy Policy from time to time. We will notify you
            of any changes by posting the new Privacy Policy on this page and updating
            the &quot;last updated&quot; date at the top of this document.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            You are advised to review this Privacy Policy periodically for any changes.
            Changes are effective when they are posted on this page.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Contact Us
          </h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about this Privacy Policy, contact us at:
          </p>
          <p className="text-gray-700 mt-2">
            <strong>Email:</strong> jbing673@gmail.com
          </p>
        </section>
      </div>
    </div>
  );
}
