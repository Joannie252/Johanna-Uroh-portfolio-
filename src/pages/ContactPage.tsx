import React, { useState, useEffect } from 'react';
import { useRouter } from '../lib/router';
import { sendContactMessage, getServices } from '../lib/api';
import { ServiceItem } from '../types';
import { useSiteSettings } from '../context/SettingsContext';
import { Mail, CheckCircle2, AlertCircle, Send, Sparkles, Clock, MapPin } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { path } = useRouter();
  const { settings } = useSiteSettings();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shakeSubmit, setShakeSubmit] = useState(false);

  const contactEmail = settings.profile?.email || 'urohjohanna25@gmail.com';

  const triggerSubmitShake = () => {
    setShakeSubmit(true);
    setTimeout(() => setShakeSubmit(false), 400);
  };

  // Pre-select service if passed in query string (?service=...)
  useEffect(() => {
    const params = new URLSearchParams(path.split('?')[1] || '');
    const serviceParam = params.get('service');
    if (serviceParam) {
      setSelectedService(serviceParam);
    }
  }, [path]);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await getServices();
        setServices(data);
      } catch (err) {
        console.error('Failed to load services for contact form:', err);
      }
    }
    loadServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      triggerSubmitShake();
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Please provide a valid email address.');
      triggerSubmitShake();
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setErrorMsg('Please enter a descriptive message (at least 10 characters).');
      triggerSubmitShake();
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await sendContactMessage({
        name,
        email,
        service: selectedService || 'General Inquiry',
        message,
      });

      setSuccessMsg(res.message || 'Thank you! Your message has been received.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error('Contact submission failed:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      triggerSubmitShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-28 pb-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Context & Direct Details */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start a Collaboration</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-display">
                Get In Touch
              </h1>
              <p className="mt-4 text-zinc-600 dark:text-zinc-300 text-base leading-relaxed">
                Have an executive workflow bottleneck, an AI prompting project, or a web build in mind? Send a message and let&apos;s explore how we can work together.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Direct Email
                  </h4>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-sm font-semibold link-neon"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Response Expectations
                  </h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    Typically within 24 business hours.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Location &amp; Hours
                  </h4>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">
                    Remote worldwide • Flexible time zones
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white dark:bg-[#12141a] border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">
                Send a Message
              </h2>

              {successMsg ? (
                <div className="p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-200">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-sm text-emerald-800 dark:text-emerald-300/90 leading-relaxed max-w-sm mx-auto">
                    {successMsg}
                  </p>
                  <button
                    onClick={() => setSuccessMsg(null)}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errorMsg && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 text-sm flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Your Name <span className="text-purple-500">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Email Address <span className="text-purple-500">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="alex@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    />
                  </div>

                  {/* Service */}
                  <div>
                    <label
                      htmlFor="contact-service"
                      className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Area of Interest
                    </label>
                    <select
                      id="contact-service"
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="">General Inquiry / Custom Project</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                      <option value="Virtual Assistance">Virtual Assistance</option>
                      <option value="AI & Prompt Engineering">AI &amp; Prompt Engineering</option>
                      <option value="Website Development">Website Development</option>
                      <option value="Digital Skills Training">Digital Skills Training</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs uppercase tracking-wider font-semibold text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Message / Project Details <span className="text-purple-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      placeholder="Describe your project goals, timeline, or current workflow challenges..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    id="contact-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 rounded-xl btn-neon-primary text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                      shakeSubmit ? 'neon-shake' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <span>Submitting message...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
